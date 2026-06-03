import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/opportunitycost',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ChapterFile {
  path: string;
  order: number;
  title: string;
}

// List of chapters in order
const chapterFiles: ChapterFile[] = [
  { path: 'INTRODUCTION.md', order: 0, title: 'Introdução — A escolha invisível' },
  { path: 'chapters/01-o-conceito.md', order: 1, title: 'Capítulo 1 — O conceito' },
  { path: 'chapters/02-a-vida.md', order: 2, title: 'Capítulo 2 — A vida' },
  { path: 'chapters/03-o-dinheiro.md', order: 3, title: 'Capítulo 3 — O dinheiro' },
  { path: 'chapters/04-o-poder.md', order: 4, title: 'Capítulo 4 — O poder' },
  { path: 'chapters/05-a-politica.md', order: 5, title: 'Capítulo 5 — A política' },
  { path: 'chapters/06-a-cultura.md', order: 6, title: 'Capítulo 6 — A cultura' },
  { path: 'chapters/07-o-tempo.md', order: 7, title: 'Capítulo 7 — O tempo' },
  { path: 'CONCLUSION.md', order: 8, title: 'Conclusão — A vida consciente' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'gbrobbe@gmail.com' },
    update: {},
    create: {
      email: 'gbrobbe@gmail.com',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✓ Admin user created: ${adminUser.email}`);

  // 2. Create the book product
  const product = await prisma.product.upsert({
    where: { slug: 'custo-de-oportunidade' },
    update: {},
    create: {
      type: 'BOOK',
      slug: 'custo-de-oportunidade',
      title: 'Custo de Oportunidade',
      description:
        'Uma exploração profunda sobre o custo invisível de nossas escolhas. Entenda por que a maioria das pessoas toma decisões ruins e como enxergar o verdadeiro preço das suas decisões.',
      status: 'PUBLISHED',
    },
  });
  console.log(`✓ Product created: ${product.title}`);

  // 3. Create default price
  const price = await prisma.price.upsert({
    where: { productId_label: { productId: product.id, label: 'default' } },
    update: {},
    create: {
      productId: product.id,
      label: 'default',
      amountCents: 4900, // R$ 49.00
      currency: 'BRL',
      isDefault: true,
      active: true,
    },
  });
  console.log(`✓ Price created: R$ ${price.amountCents / 100}`);

  // 4. Load and create chapters
  const bookPath = path.join(
    __dirname,
    '..',
    '..',
    'opportunity-cost-book',
    'book'
  );

  for (const chapterFile of chapterFiles) {
    const filePath = path.join(bookPath, chapterFile.path);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract the title from the first line if it's an H1
      const titleMatch = content.match(/^# (.+?)$/m);
      const chapterTitle = titleMatch ? titleMatch[1] : chapterFile.title;

      // Create slug from the path
      const slug = chapterFile.path
        .split('/')
        .pop()
        ?.replace('.md', '')
        .toLowerCase() || `chapter-${chapterFile.order}`;

      await prisma.chapter.upsert({
        where: { productId_slug: { productId: product.id, slug } },
        update: { content },
        create: {
          productId: product.id,
          slug,
          title: chapterTitle,
          order: chapterFile.order,
          content,
          published: true,
        },
      });

      console.log(`✓ Chapter ${chapterFile.order}: ${chapterTitle}`);
    } catch (error) {
      console.error(
        `✗ Failed to load chapter ${chapterFile.order} from ${chapterFile.path}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // 5. Create free access for admin user
  await prisma.access.upsert({
    where: { userId_productId: { userId: adminUser.id, productId: product.id } },
    update: {},
    create: {
      userId: adminUser.id,
      productId: product.id,
      note: 'admin - full access',
    },
  });
  console.log(`✓ Admin access granted to product`);

  console.log(
    '\n✅ Seeding complete! Login with gbrobbe@gmail.com / ' + adminPassword
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
