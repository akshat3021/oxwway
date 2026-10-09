// src/app/api/admin/joblistings/route.ts
// CRUD API for JobListing model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  // Admin and editor can view job listings (all statuses)
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const listings = await prisma.jobListing.findMany({ orderBy: { id: 'desc' } });
  return NextResponse.json(listings);
}

export async function POST(request: NextRequest) {
  // Admin and editor can create listings (default status is "open")
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const data = await request.json();
  const listing = await prisma.jobListing.create({ data });
  await logAction(auth.email, 'create', 'JobListing', listing.id);
  return NextResponse.json(listing, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Admin and editor can update listings; only admin can change status to closed maybe, but for simplicity allow both
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;
  const { id, ...updates } = await request.json();
  const updated = await prisma.jobListing.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'JobListing', id);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  // Only admin can delete job listings
  const auth = requireRoles(request, ['admin']);
  if (auth instanceof Response) return auth;
  const { id } = await request.json();
  await prisma.jobListing.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'JobListing', id);
  return NextResponse.json({ success: true });
}
