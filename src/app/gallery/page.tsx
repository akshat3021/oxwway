import type { Metadata } from "next";
import { EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { listGallery } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Gallery", description: "Telemetry and media from the lab." };

export default async function GalleryPage() {
  const items = await listGallery();
  return (
    <PageFrame>
      <PageHeader tag="TELEMETRY // MEDIA ARCHIVE" title="Media" accent="Archive" />
      {items.length === 0 ? (
        <EmptyNote title="The archive is empty." hint="Media will appear here soon." />
      ) : (
        <section className="px-[5vw] pb-24">
          <ul className="max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((g, i) => (
              <li key={g.id} className="group border border-foreground/10 hover:border-accent/40 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.mediaRef} alt={g.caption ?? ""} loading={i < 3 ? "eager" : "lazy"} decoding="async" className="w-full aspect-[4/3] object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
                {(g.caption || g.category) && (
                  <div className="p-4">
                    {g.category && <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">{g.category}</div>}
                    {g.caption && <p className="font-mono text-xs text-foreground/70">{g.caption}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
