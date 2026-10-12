import { BootGate } from "@/components/BootGate";
import { HeroSection } from "@/components/HeroSection";
import { CognitiveLoop } from "@/components/CognitiveLoop";
import { TeamTeaser } from "@/components/TeamTeaser";
import { NewsPreview } from "@/components/NewsPreview";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Footer } from "@/components/Footer";
import { getLandingData } from "@/server/services/landing";

// Regenerate at most once a minute; admin edits also trigger an immediate
// revalidation (see server/http/revalidate.ts), so changes appear right away.
export const revalidate = 60;

export default async function Home() {
  const { hero, team, posts, showWatermark } = await getLandingData();

  return (
    <>
      <BootGate />
      <div className="relative">
        <HeroSection hero={hero} showWatermark={showWatermark} />
        <CognitiveLoop />
        {team.length > 0 && <TeamTeaser members={team} />}
        {posts.length > 0 && <NewsPreview posts={posts} />}
        <ClosingCTA />
        <Footer />
      </div>
    </>
  );
}
