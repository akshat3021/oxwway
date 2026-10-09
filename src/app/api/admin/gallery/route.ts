// src/app/api/admin/gallery/route.ts
// CRUD API for GalleryItem model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const items = await prisma.galleryItem.findMany({ orderBy: { displayOrder: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const data = await request.json();
  const item = await prisma.galleryItem.create({ data });
  await logAction(auth.email, 'create', 'GalleryItem', item.id);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const { id, ...updates } = await request.json();
  const updated = await prisma.galleryItem.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'GalleryItem', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const { id } = await request.json();
  await prisma.galleryItem.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'GalleryItem', id);
  return NextResponse.json({ success: true });
}
