// src/app/api/admin/navitems/route.ts
// CRUD API for NavItem model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  // Admin and editor can read NavItems
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const navItems = await prisma.navItem.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json(navItems);
}

export async function POST(request: NextRequest) {
  // Admin and editor can create NavItems
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const data = await request.json();
  const navItem = await prisma.navItem.create({ data });
  await logAction(auth.email, 'create', 'NavItem', navItem.id);
  return NextResponse.json(navItem, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Admin and editor can update NavItems
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const { id, ...updates } = await request.json();
  const updated = await prisma.navItem.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'NavItem', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  // Only admin can delete NavItems
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;

  const { id } = await request.json();
  await prisma.navItem.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'NavItem', id);
  return NextResponse.json({ success: true });
}
