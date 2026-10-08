// src/app/api/admin/homepage/route.ts
// CRUD API for HomepageContent model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma.config';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const content = await prisma.homepageContent.findFirst();
  return NextResponse.json(content);
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const data = await request.json();
  const created = await prisma.homepageContent.create({ data });
  await logAction(auth.email, 'create', 'HomepageContent', created.id);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const { id, ...updates } = await request.json();
  const updated = await prisma.homepageContent.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'HomepageContent', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  // Only admin can delete core homepage content
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const { id } = await request.json();
  await prisma.homepageContent.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'HomepageContent', id);
  return NextResponse.json({ success: true });
}
