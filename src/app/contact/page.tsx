import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageFrame, PageHeader } from "@/components/PublicPage";
import { getCompany } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Contact", description: "Get in touch with OXWAY." };

export default async function ContactPage() {
  const company = await getCompany();
  return (
    <PageFrame>
      <PageHeader tag="DIRECT LINK // COMMS" title="Initiate" accent="Contact" />
      <section className="px-[5vw] pb-24">
        <div className="max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          <ContactForm />
          {company?.contactDetails && (
            <aside aria-labelledby="details-h">
              <h2 id="details-h" className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">[ DETAILS ]</h2>
              <p className="font-mono text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{company.contactDetails}</p>
            </aside>
          )}
        </div>
      </section>
    </PageFrame>
  );
}
