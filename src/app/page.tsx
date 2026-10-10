import { BootGate } from "@/components/BootGate";
import { HeroSection } from "@/components/HeroSection";
import { CognitiveLoop } from "@/components/CognitiveLoop";
import { TeamTeaser } from "@/components/TeamTeaser";
import { NewsPreview } from "@/components/NewsPreview";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Footer } from "@/components/Footer";
import { getLandingData } from "@/lib/landing";

// Regenerate at most once a minute; admin edits also trigger an immediate
// revalidation (see src/lib/revalidate.ts), so changes appear right away.
export const revalidate = 60;

export default async function Home() {
  const { hero, team, posts } = await getLandingData();

  return (
    <>
      <BootGate />
      <div className="relative">
        <HeroSection hero={hero} />
        <CognitiveLoop />
        {team.length > 0 && <TeamTeaser members={team} />}
        {posts.length > 0 && <NewsPreview posts={posts} />}
        <ClosingCTA />
        <Footer />
      </div>
    </>
  );
}
