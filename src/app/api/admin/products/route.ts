// src/app/api/admin/products/route.ts
// CRUD API for Product model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma.config';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  // Admin and editor can read all products (drafts + published).
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  // Only admin and editor can create drafts
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const data = await request.json();
  // Force status to draft unless admin explicitly sets published
  if (auth.role !== 'admin' && data.status === 'published') {
    return NextResponse.json({ error: 'Only admin can publish' }, { status: 403 });
  }

  const product = await prisma.product.create({ data });
  // Record audit (assuming userId is not stored; using null)
  await logAction(auth.email, 'create', 'Product', product.id);
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Update product – admin can modify any field, editor can only edit drafts
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const { id, ...updates } = await request.json();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (auth.role !== 'admin' && existing.status === 'published') {
    return NextResponse.json({ error: 'Editors cannot modify published records' }, { status: 403 });
  }

  const updated = await prisma.product.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'Product', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const auth = requireRoles(request, ['admin']); // only admin can delete
  if (auth instanceof Response) return auth;

  const { id } = await request.json();
  await prisma.product.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'Product', id);
  return NextResponse.json({ success: true });
}
