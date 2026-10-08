import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma.config';

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } });
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json([]);
  }
}
