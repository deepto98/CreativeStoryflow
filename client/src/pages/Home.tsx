import Header from "@/components/Header";
import DailyChallenge from "@/components/DailyChallenge";
import StoryboardDisplay from "@/components/StoryboardDisplay";
import PastStoryboards from "@/components/PastStoryboards";
import CommunityChallenges from "@/components/CommunityChallenges";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Challenge } from "@shared/schema";

export default function Home() {
  const { data: dailyChallenge } = useQuery<Challenge>({
    queryKey: ['/api/challenges/daily'],
  });

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <DailyChallenge />
        {dailyChallenge && <StoryboardDisplay challengeId={dailyChallenge.id} />}
        <PastStoryboards />
        <CommunityChallenges />
      </main>
      <Footer />
    </div>
  );
}
