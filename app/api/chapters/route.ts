import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookSlug = req.nextUrl.searchParams.get('bookSlug');
  if (!bookSlug) {
    return NextResponse.json({ error: 'Missing bookSlug' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: bookSlug },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
      },
      chapters: product.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        content: ch.content,
      })),
    });
  } catch (error) {
    console.error('Chapters error:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}
