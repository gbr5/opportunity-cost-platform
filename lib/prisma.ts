import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/opportunitycost',
});

const adapter = new PrismaPg(pool);

let prisma: any;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  let globalPrisma = global as any;
  if (!globalPrisma.prisma) {
    globalPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalPrisma.prisma;
}

export { prisma };
