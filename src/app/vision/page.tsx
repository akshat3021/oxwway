import type { Metadata } from "next";
import { EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { getCompany } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Vision", description: "Where we are headed." };

export default async function VisionPage() {
  const company = await getCompany();
  return (
    <PageFrame>
      <PageHeader tag="CORE PHILOSOPHY // TENETS" title="Our" accent="Vision" />
      {company?.visionStatement ? (
        <section className="px-[5vw] pb-24"><div className="max-w-3xl text-lg"><SafeMarkdown source={company.visionStatement} /></div></section>
      ) : (
        <EmptyNote title="Our vision statement is coming soon." hint="Add it under Admin → Company." />
      )}
    </PageFrame>
  );
}
