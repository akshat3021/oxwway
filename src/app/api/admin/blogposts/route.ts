// src/app/api/admin/blogposts/route.ts
// CRUD API for BlogPost model with server‑side role enforcement.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/middleware/requireRoles';
import { logAction } from '@/lib/audit';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET(request: NextRequest) {
  // Admin and editor can read all blog posts (drafts, published, archived).
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const posts = await prisma.blogPost.findMany({
    orderBy: { publishDate: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const data = await request.json();
  // Force status to draft unless admin explicitly sets published
  if (auth.role !== 'admin' && data.status === 'published') {
    return NextResponse.json({ error: 'Only admin can publish' }, { status: 403 });
  }

  const post = await prisma.blogPost.create({ data });
  await logAction(auth.email, 'create', 'BlogPost', post.id);
  revalidatePublicSite();
  return NextResponse.json(post, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = requireRoles(request, ['admin', 'editor']);
  if (auth instanceof Response) return auth;

  const { id, ...updates } = await request.json();
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (auth.role !== 'admin' && existing.status === 'published') {
    return NextResponse.json({ error: 'Editors cannot modify published posts' }, { status: 403 });
  }

  const updated = await prisma.blogPost.update({ where: { id }, data: updates });
  await logAction(auth.email, 'update', 'BlogPost', id);
  revalidatePublicSite();
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const auth = requireRoles(request, ['admin']); // only admin can delete
  if (auth instanceof Response) return auth;

  const { id } = await request.json();
  await prisma.blogPost.delete({ where: { id } });
  await logAction(auth.email, 'delete', 'BlogPost', id);
  revalidatePublicSite();
  return NextResponse.json({ success: true });
}
