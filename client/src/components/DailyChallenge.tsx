import { useState } from 'react';
import { ComicButton } from './ui/comic-button';
import { useQuery } from '@tanstack/react-query';
import { Challenge } from '@shared/schema';
import { AddPanelModal } from './AddPanelModal';
import { formatTimeRemaining } from '@/utils/date-utils';

export default function DailyChallenge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: challenge, isLoading } = useQuery<Challenge>({
    queryKey: ['/api/challenges/daily'],
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bangers text-3xl tracking-wide">Daily Challenge</h2>
          <div className="bg-white border-2 border-black rounded-full px-4 py-1 flex items-center shadow-comic-sm animate-pulse">
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="bg-white border-4 border-black rounded-xl p-6 shadow-comic animate-pulse">
          <div className="h-48"></div>
        </div>
      </section>
    );
  }

  if (!challenge) {
    return null;
  }

  const { title, description, tags, timeRemaining, panelCount, totalPanels, contributors } = challenge;
  
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bangers text-3xl tracking-wide">Daily Challenge</h2>
        <div className="bg-white border-2 border-black rounded-full px-4 py-1 flex items-center shadow-comic-sm">
          <i className="ri-time-line mr-2"></i>
          <span className="font-comic font-bold">{formatTimeRemaining(timeRemaining)}</span>
        </div>
      </div>
      
      <div className="bg-white border-4 border-black rounded-xl p-6 shadow-comic">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-7/12">
            <h3 className="font-bangers text-2xl mb-3">{title}</h3>
            <p className="mb-4">{description}</p>
            
            <div className="flex items-center space-x-2 mb-6">
              {tags.map((tag, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-1 ${
                    index % 3 === 0 ? 'bg-primary-light/20' : 
                    index % 3 === 1 ? 'bg-accent-light/20' : 
                    'bg-secondary-light/20'
                  } rounded-full text-sm`}
                >
                  {tag}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <ComicButton 
                className="bg-primary text-white" 
                onClick={() => setIsModalOpen(true)}
              >
                <i className="ri-add-line mr-2"></i> Add Your Panel
              </ComicButton>
              <ComicButton className="bg-white">
                <i className="ri-heart-line mr-2"></i> Vote
              </ComicButton>
            </div>
          </div>
          
          <div className="w-full md:w-5/12">
            <div className="bg-neutral-light border-2 border-black rounded-lg p-3 shadow-comic-sm">
              <h4 className="font-comic font-bold text-center mb-2">Community Progress</h4>
              <div className="flex space-x-2 mb-3">
                {Array.from({ length: totalPanels }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold ${
                      index < panelCount 
                        ? (index === panelCount - 1 ? 'bg-accent' : 'bg-primary-light') 
                        : 'border-2 border-dashed border-neutral-medium text-neutral-medium bg-transparent'
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{panelCount}/{totalPanels} Panels</span>
                <span>{contributors} Contributors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <AddPanelModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          challengeId={challenge.id}
        />
      )}
    </section>
  );
}
