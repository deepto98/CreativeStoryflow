import { useState } from 'react';
import { ComicButton } from './ui/comic-button';
import { ComicPanel } from './ui/comic-panel';
import { SpeechBubble } from './ui/speech-bubble';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@shared/schema';
import { AddPanelModal } from './AddPanelModal';
import { useToast } from '@/hooks/use-toast';

export default function StoryboardDisplay({ challengeId }: { challengeId: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: panels, isLoading } = useQuery<Panel[]>({
    queryKey: ['/api/panels', challengeId],
    queryFn: () => fetch(`/api/panels?challengeId=${challengeId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bangers text-3xl tracking-wide">Current Storyboard</h2>
          <div className="animate-pulse flex space-x-3">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-4 border-black shadow-comic aspect-square animate-pulse bg-white"></div>
          ))}
        </div>
      </section>
    );
  }

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

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bangers text-3xl tracking-wide">Current Storyboard</h2>
        <div className="flex space-x-3">
          <ComicButton className="bg-white text-sm px-4 py-1" onClick={handleSave}>
            <i className="ri-download-line mr-2"></i> Save
          </ComicButton>
          <ComicButton className="bg-white text-sm px-4 py-1" onClick={handleShare}>
            <i className="ri-share-line mr-2"></i> Share
          </ComicButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {panels?.map((panel, index) => (
          <ComicPanel 
            key={panel.id}
            className="aspect-square"
            panelNumber={index + 1}
            isLatest={index === panels.length - 1}
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
        
        {/* Empty panel for next contribution */}
        {panels && panels.length < 6 && (
          <ComicPanel isPending className="aspect-square bg-white border-dashed" onClick={() => setIsModalOpen(true)}>
            <div className="h-full flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mb-4">
                <i className="ri-add-line text-3xl text-neutral-medium"></i>
              </div>
              <h3 className="font-comic font-bold mb-2">Next Panel</h3>
              <p className="text-sm text-neutral-medium">Be the first to contribute to this panel!</p>
            </div>
          </ComicPanel>
        )}
      </div>

      {isModalOpen && (
        <AddPanelModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          challengeId={challengeId}
        />
      )}
    </section>
  );
}
