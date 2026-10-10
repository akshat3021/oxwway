import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ where: { status: 'published' }, orderBy: { id: 'asc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([]);
  }
}
