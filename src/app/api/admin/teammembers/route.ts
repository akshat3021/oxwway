// src/app/api/admin/teammembers/route.ts
// CRUD API for TeamMember model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma.config';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const members = await prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } });
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const data = await request.json();
  const member = await prisma.teamMember.create({ data });
  await logAction(auth.email, 'create', 'TeamMember', member.id);
  return NextResponse.json(member, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const { id, ...updates } = await request.json();
  const updated = await prisma.teamMember.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'TeamMember', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const auth = requireRoles(request, ['admin']); // only admin can delete
  if (auth instanceof Response) return auth;
  const { id } = await request.json();
  await prisma.teamMember.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'TeamMember', id);
  return NextResponse.json({ success: true });
}
