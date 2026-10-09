import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.homepageContent.findFirst();
    return NextResponse.json(content || null);
  } catch (error) {
    return NextResponse.json(null);
  }
}
