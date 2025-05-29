import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ComicButton } from './ui/comic-button';
import { CompletedStoryboard } from '@shared/schema';
import { formatTimeAgo } from '@/utils/date-utils';

export default function PastStoryboards() {
  const { data: completedStoryboards, isLoading } = useQuery<CompletedStoryboard[]>({
    queryKey: ['/api/storyboards/completed'],
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bangers text-3xl tracking-wide">Completed Storyboards</h2>
          <div className="animate-pulse h-10 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-4 border-black shadow-comic rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="w-8 h-8 rounded-full bg-gray-200"></div>
                    ))}
                  </div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!completedStoryboards || completedStoryboards.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bangers text-3xl tracking-wide">Completed Storyboards</h2>
        <Link href="/storyboards">
          <ComicButton className="bg-white text-sm px-4 py-1">
            <i className="ri-archive-line mr-2"></i> View All
          </ComicButton>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedStoryboards.map((storyboard) => (
          <div key={storyboard.id} className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-comic hover:shadow-comic-hover transition-shadow">
            <div className="aspect-video bg-neutral-light overflow-hidden">
              <img 
                src={storyboard.coverImage} 
                alt={storyboard.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-4">
              <h3 className="font-comic font-bold text-lg mb-1">{storyboard.title}</h3>
              <div className="flex items-center text-sm mb-3">
                <span className={`bg-${storyboard.category === 'Sci-Fi' ? 'primary' : storyboard.category === 'Fantasy' ? 'secondary' : 'accent'}-light/20 rounded-full px-2 py-0.5 mr-2`}>
                  {storyboard.category}
                </span>
                <span className="text-neutral-medium">{storyboard.panelCount} panels</span>
                <span className="text-neutral-medium ml-auto">{formatTimeAgo(storyboard.completedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {storyboard.contributors.slice(0, 3).map((contributor, index) => (
                    <div 
                      key={`${storyboard.id}-${contributor}-${index}`} 
                      className={`w-8 h-8 rounded-full border-2 border-white bg-${
                        index % 3 === 0 ? 'primary' : 
                        index % 3 === 1 ? 'secondary' : 
                        'accent'
                      } flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {contributor.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {storyboard.contributors.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-dark flex items-center justify-center text-white text-xs font-bold">
                      +{storyboard.contributors.length - 3}
                    </div>
                  )}
                </div>
                <Link href={`/storyboard/${storyboard.id}`}>
                  <ComicButton className="bg-white text-sm px-3 py-1">
                    View
                  </ComicButton>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
