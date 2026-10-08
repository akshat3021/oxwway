import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma.config';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([]);
  }
}
