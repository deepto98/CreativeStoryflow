import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ComicPanel } from "@/components/ui/comic-panel";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { ComicButton } from "@/components/ui/comic-button";
import { CompletedStoryboard, Panel } from "@shared/schema";
import { formatTimeAgo } from "@/utils/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function StoryboardDetail() {
  const [, params] = useRoute<{ id: string }>("/storyboard/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();

  const { data: storyboard, isLoading: loadingStoryboard } = useQuery<CompletedStoryboard>({
    queryKey: [`/api/storyboards/${id}`],
    enabled: !!id,
  });

  const { data: panels, isLoading: loadingPanels } = useQuery<Panel[]>({
    queryKey: [`/api/panels`, id],
    enabled: !!id,
  });

  const handleSave = () => {
    toast({
      title: "Storyboard Saved",
      description: "Your storyboard has been saved successfully.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  if (loadingStoryboard || loadingPanels) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border-4 border-black shadow-comic aspect-square animate-pulse bg-white"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!storyboard || !panels) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="font-bangers text-2xl">Storyboard Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The storyboard you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="font-bangers text-4xl mb-2">{storyboard.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`bg-${storyboard.category === 'Sci-Fi' ? 'primary' : storyboard.category === 'Fantasy' ? 'secondary' : 'accent'}-light/20 rounded-full px-3 py-1 text-sm`}>
                  {storyboard.category}
                </span>
                <span className="text-neutral-medium text-sm">Completed {formatTimeAgo(storyboard.completedAt)}</span>
                <span className="text-neutral-medium text-sm">{storyboard.panelCount} panels</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <ComicButton className="bg-white" onClick={handleSave}>
                <i className="ri-download-line mr-2"></i> Save
              </ComicButton>
              <ComicButton className="bg-white" onClick={handleShare}>
                <i className="ri-share-line mr-2"></i> Share
              </ComicButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {panels.map((panel, index) => (
              <ComicPanel 
                key={panel.id}
                className="aspect-square"
                panelNumber={index + 1}
                username={panel.username}
                votes={panel.votes}
              >
                <img 
                  src={panel.imageUrl} 
                  alt={`Panel ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
                {panel.caption && (
                  <SpeechBubble className="absolute bottom-3 left-3 right-3 text-sm">
                    {panel.caption}
                  </SpeechBubble>
                )}
              </ComicPanel>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="font-bangers text-3xl mb-4">Contributors</h2>
          <div className="bg-white border-4 border-black rounded-xl p-6 shadow-comic">
            <div className="flex flex-wrap gap-4">
              {storyboard.contributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full bg-${
                    index % 3 === 0 ? 'primary' : 
                    index % 3 === 1 ? 'secondary' : 
                    'accent'
                  } flex items-center justify-center text-white font-bold`}>
                    {contributor.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-comic">@{contributor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
