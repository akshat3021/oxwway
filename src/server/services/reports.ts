import "server-only";
import { prisma } from "../db/prisma";
import type { PageMeta } from "../http/response";
import type { ListQuery } from "../validation/common";

export async function listAudit(query: ListQuery & { entity?: string; action?: string }) {
  const where = {
    ...(query.entity ? { entity: query.entity } : {}),
    ...(query.action ? { action: query.action } : {}),
    ...(query.q ? { actorEmail: { contains: query.q, mode: "insensitive" as const } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    prisma.auditLog.count({ where }),
  ]);
  const meta: PageMeta = { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
  return { rows, meta };
}

/** Real numbers for the dashboard (replaces the old hardcoded mock values). */
export async function dashboardStats() {
  const [publishedPosts, draftPosts, openRoles, publishedProducts, teamMembers, unreadMessages, recentActivity] =
    await Promise.all([
      prisma.blogPost.count({ where: { status: "published", deletedAt: null } }),
      prisma.blogPost.count({ where: { status: "draft", deletedAt: null } }),
      prisma.jobListing.count({ where: { status: "open", deletedAt: null } }),
      prisma.product.count({ where: { status: "published", deletedAt: null } }),
      prisma.teamMember.count({ where: { deletedAt: null } }),
      prisma.contactMessage.count({ where: { readAt: null } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
  return { publishedPosts, draftPosts, openRoles, publishedProducts, teamMembers, unreadMessages, recentActivity };
}
