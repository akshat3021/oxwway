import type { Metadata } from "next";
import { EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { getCompany } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "About", description: "Who we are and what we build." };

export default async function AboutPage() {
  const company = await getCompany();
  return (
    <PageFrame>
      <PageHeader tag="ENTITY OVERVIEW // MISSION" title="About" accent="OXWAY" />
      {company?.aboutContent ? (
        <section className="px-[5vw] pb-24"><div className="max-w-3xl"><SafeMarkdown source={company.aboutContent} /></div></section>
      ) : (
        <EmptyNote title="Our story is coming soon." hint="Add it under Admin → Company." />
      )}
    </PageFrame>
  );
}
