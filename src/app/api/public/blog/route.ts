import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma.config';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json([]);
  }
}
