import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.jobListing.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json([]);
  }
}
