import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, chapterId, scrollPercent } = await req.json();

  try {
    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        chapterId,
        scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
      },
      create: {
        userId: session.user.id,
        productId,
        chapterId,
        scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Reading progress error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  try {
    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json(progress || { scrollPercent: 0 });
  } catch (error) {
    console.error('Reading progress error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
