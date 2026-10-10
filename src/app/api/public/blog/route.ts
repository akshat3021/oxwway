import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json([]);
  }
}
