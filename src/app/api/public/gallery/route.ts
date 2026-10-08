import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma.config';

export async function GET() {
  try {
    const gallery = await prisma.galleryItem.findMany({ orderBy: { displayOrder: 'asc' } });
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json([]);
  }
}
