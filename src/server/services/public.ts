import "server-only";
import { prisma } from "../db/prisma";

/**
 * Read-only data for the public website. Rules enforced HERE, in one place:
 *  - soft-deleted rows are never returned
 *  - drafts are never returned
 *  - no function writes (public renders must be side-effect free)
 * Errors are deliberately not swallowed: with ISR, a failed revalidation keeps
 * serving the last good page instead of caching an empty one.
 */

export const getHomepage = () => prisma.homepageContent.findFirst({ orderBy: { id: "asc" } });
export const getCompany = () => prisma.companyInfo.findFirst({ orderBy: { id: "asc" } });
export const getSiteSettings = () => prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });

const livePost = { status: "published", deletedAt: null } as const;

export async function listPublishedPosts(opts: { page?: number; pageSize?: number } = {}) {
  const pageSize = Math.min(opts.pageSize ?? 12, 50);
  const page = Math.max(opts.page ?? 1, 1);
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: livePost,
      orderBy: [{ publishDate: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, tags: true, publishDate: true, createdAt: true },
    }),
    prisma.blogPost.count({ where: livePost }),
  ]);
  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export const getPublishedPost = (slug: string) =>
  prisma.blogPost.findFirst({ where: { ...livePost, slug } });

export const listPublishedSlugs = () =>
  prisma.blogPost.findMany({ where: livePost, select: { slug: true }, take: 500 });

const liveProduct = { status: "published", deletedAt: null } as const;

export const listPublishedProducts = () =>
  prisma.product.findMany({ where: liveProduct, orderBy: { id: "asc" }, take: 100 });

export const getPublishedProduct = (slug: string) =>
  prisma.product.findFirst({ where: { ...liveProduct, slug } });

export const listGallery = () =>
  prisma.galleryItem.findMany({ where: { deletedAt: null }, orderBy: [{ displayOrder: "asc" }, { id: "asc" }], take: 200 });

export const listTeam = (take = 100) =>
  prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: [{ displayOrder: "asc" }, { id: "asc" }], take });

export const listOpenJobs = () =>
  prisma.jobListing.findMany({ where: { status: "open", deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100 });
