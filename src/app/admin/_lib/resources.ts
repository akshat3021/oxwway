/**
 * Declarative description of each content screen. One generic manager renders
 * every resource from this config, so adding a field is a one-line change here
 * (plus the matching server schema).
 */
export type FieldType =
  | "text" | "textarea" | "slug" | "url" | "number" | "select"
  | "tags" | "urls" | "datetime" | "specs";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  options?: { value: string; label: string }[];
  /** For slug fields: auto-fill from this field until the user edits the slug. */
  deriveFrom?: string;
  /** Publish-state field: only administrators may change it. */
  publishState?: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  kind?: "text" | "status" | "date";
}

export interface ResourceConfig {
  resource: string;
  singular: string;
  plural: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  statusOptions?: { value: string; label: string }[];
  /** Field that identifies a row in confirmations ("Delete <title>?"). */
  titleField: string;
}

const draftPublished = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const RESOURCES: Record<string, ResourceConfig> = {
  blog: {
    resource: "blog-posts",
    singular: "post",
    plural: "Blog & News",
    titleField: "title",
    statusOptions: draftPublished,
    columns: [
      { key: "title", label: "Title" },
      { key: "status", label: "Status", kind: "status" },
      { key: "publishDate", label: "Published", kind: "date" },
      { key: "updatedAt", label: "Updated", kind: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "slug", label: "URL slug", type: "slug", required: true, deriveFrom: "title", help: "Lowercase letters, numbers and hyphens. Appears in the post URL." },
      { name: "status", label: "Status", type: "select", options: draftPublished, publishState: true, help: "Only administrators can publish." },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, maxLength: 500, help: "Short summary shown in lists." },
      { name: "body", label: "Body (Markdown)", type: "textarea", rows: 12, help: "Supports headings (#), **bold**, *italic*, lists, and [links](https://…)." },
      { name: "coverImage", label: "Cover image URL", type: "url", placeholder: "https://…" },
      { name: "tags", label: "Tags", type: "tags", help: "Comma separated, up to 10." },
      { name: "publishDate", label: "Publish date", type: "datetime", help: "Leave empty to use the moment it is published." },
      { name: "seoTitle", label: "SEO title", type: "text", maxLength: 70 },
      { name: "seoDescription", label: "SEO description", type: "textarea", rows: 2, maxLength: 160 },
    ],
  },
  products: {
    resource: "products",
    singular: "product",
    plural: "Products",
    titleField: "name",
    statusOptions: draftPublished,
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "status", label: "Status", kind: "status" },
      { key: "updatedAt", label: "Updated", kind: "date" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 120 },
      { name: "slug", label: "URL slug", type: "slug", required: true, deriveFrom: "name" },
      { name: "status", label: "Status", type: "select", options: draftPublished, publishState: true, help: "Only administrators can publish." },
      { name: "tagline", label: "Tagline", type: "text", maxLength: 200 },
      { name: "description", label: "Description", type: "textarea", rows: 6 },
      { name: "specs", label: "Specifications", type: "specs", rows: 6, help: "One per line as  Name: value  (e.g. Payload: 25 kg)." },
      { name: "mediaRefs", label: "Image URLs", type: "urls", rows: 3, help: "One https:// URL per line." },
    ],
  },
  team: {
    resource: "team-members",
    singular: "team member",
    plural: "Team",
    titleField: "name",
    columns: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "displayOrder", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 100 },
      { name: "role", label: "Role", type: "text", required: true, maxLength: 100 },
      { name: "bio", label: "Bio", type: "textarea", rows: 4, maxLength: 2000 },
      { name: "photoRef", label: "Photo URL", type: "url", placeholder: "https://…" },
      { name: "displayOrder", label: "Display order", type: "number", help: "Lower numbers appear first." },
    ],
  },
  careers: {
    resource: "job-listings",
    singular: "role",
    plural: "Careers",
    titleField: "title",
    statusOptions: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }],
    columns: [
      { key: "title", label: "Title" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 120 },
      { name: "department", label: "Department", type: "text", maxLength: 80 },
      { name: "location", label: "Location", type: "text", maxLength: 80 },
      { name: "status", label: "Status", type: "select", options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }] },
      { name: "description", label: "Description", type: "textarea", rows: 8 },
    ],
  },
  gallery: {
    resource: "gallery-items",
    singular: "item",
    plural: "Gallery",
    titleField: "caption",
    columns: [
      { key: "mediaRef", label: "Image" },
      { key: "caption", label: "Caption" },
      { key: "category", label: "Category" },
      { key: "displayOrder", label: "Order" },
    ],
    fields: [
      { name: "mediaRef", label: "Image URL", type: "url", required: true, placeholder: "https://…", help: "https:// URL. Direct uploads are not enabled yet." },
      { name: "caption", label: "Caption", type: "text", maxLength: 300 },
      { name: "category", label: "Category", type: "text", maxLength: 60 },
      { name: "displayOrder", label: "Display order", type: "number" },
    ],
  },
};

export interface SingletonConfig {
  endpoint: string;
  title: string;
  description: string;
  fields: FieldDef[];
}

export const SINGLETONS: Record<string, SingletonConfig> = {
  homepage: {
    endpoint: "/api/admin/homepage",
    title: "Homepage",
    description: "Text shown in the landing page hero. Leave a field empty to use the default.",
    fields: [
      { name: "heroHeadline", label: "Headline", type: "text", maxLength: 60, placeholder: "OXWAY" },
      { name: "heroSubheadline", label: "Outlined second line", type: "text", maxLength: 60, placeholder: "CORE" },
      { name: "heroDescription", label: "Description", type: "textarea", rows: 2, maxLength: 200, placeholder: "Engineered for absolute capability." },
      { name: "systemStatusLabel", label: "Status label", type: "text", maxLength: 40, placeholder: "SYSTEM STATUS" },
      { name: "ctaLabel", label: "Button label", type: "text", maxLength: 40, placeholder: "Explore Products" },
      { name: "ctaLink", label: "Button link", type: "url", placeholder: "/products", help: "A site path like /products, or an https:// URL." },
      { name: "scrollCueText", label: "Scroll cue", type: "text", maxLength: 60, placeholder: "Scroll to explore" },
      { name: "accessLevelReadout", label: "Access-level readout", type: "text", maxLength: 30, placeholder: "Alpha" },
    ],
  },
  company: {
    endpoint: "/api/admin/company",
    title: "Company",
    description: "Content for the About, Vision and Contact pages.",
    fields: [
      { name: "aboutContent", label: "About (Markdown)", type: "textarea", rows: 10 },
      { name: "visionStatement", label: "Vision statement", type: "textarea", rows: 5, maxLength: 5000 },
      { name: "contactDetails", label: "Contact details", type: "textarea", rows: 4, maxLength: 2000 },
    ],
  },
};
