import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ReadRedirectPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const product = await prisma.product.findUnique({
    where: { slug: bookSlug },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  });

  if (!product) {
    redirect('/');
  }

  // Check if user has access
  const access = await prisma.access.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: product.id,
      },
    },
  });

  if (!access || access.revokedAt) {
    redirect('/');
  }

  // Get last read chapter or first chapter
  const lastProgress = await prisma.readingProgress.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: product.id,
      },
    },
    include: { chapter: true },
  });

  const chapterId = lastProgress?.chapterId || product.chapters[0]?.id;

  if (!chapterId) {
    redirect('/');
  }

  redirect(`/read/${bookSlug}/${chapterId}`);
}
