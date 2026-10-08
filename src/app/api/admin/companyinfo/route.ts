// src/app/api/admin/companyinfo/route.ts
// CRUD API for CompanyInfo model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma.config';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  // Admin and editor can read company info
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const info = await prisma.companyInfo.findFirst();
  return NextResponse.json(info);
}

export async function POST(request: NextRequest) {
  // Only admin can create/replace company info (usually singleton)
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const data = await request.json();
  const created = await prisma.companyInfo.create({ data });
  await logAction(auth.email, 'create', 'CompanyInfo', created.id);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Only admin can update company info
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const { id, ...updates } = await request.json();
  const updated = await prisma.companyInfo.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'CompanyInfo', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  // Only admin can delete company info
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const { id } = await request.json();
  await prisma.companyInfo.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'CompanyInfo', id);
  return NextResponse.json({ success: true });
}
