import { Link } from 'wouter';
import { ComicButton } from './ui/comic-button';
import { useQuery } from '@tanstack/react-query';
import { CommunityChallenge } from '@shared/schema';

export default function CommunityChallenges() {
  const { data: challenges, isLoading } = useQuery<CommunityChallenge[]>({
    queryKey: ['/api/challenges/community'],
  });

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bangers text-3xl tracking-wide">Community Challenges</h2>
          <div className="animate-pulse h-10 w-40 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse border-2 border-black shadow-comic-sm rounded-xl overflow-hidden">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bangers text-3xl tracking-wide">Community Challenges</h2>
        <div className="relative">
          <ComicButton className="bg-primary text-white text-sm px-4 py-1">
            <i className="ri-add-line mr-2"></i> Create Challenge
          </ComicButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-comic-sm hover:shadow-comic transition-shadow">
            <div className={`h-32 bg-gradient-to-r ${getChallengeColors(challenge.id)} relative`}>
              <div className="absolute inset-0 opacity-20">
                <img 
                  src={challenge.coverImage} 
                  alt={challenge.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute top-3 left-3 bg-white/90 border-2 border-black rounded-lg px-2 py-1 text-xs font-bold">
                {getTimeLabel(challenge.status, challenge.daysLeft)}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-comic font-bold">{challenge.title}</h3>
              <p className="text-sm text-neutral-medium mb-3">{challenge.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span>{challenge.contributors} contributors</span>
                <span className={`${getStatusStyles(challenge.status)} px-2 py-0.5 rounded-full font-bold`}>
                  {challenge.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Helper functions
function getChallengeColors(id: number) {
  const options = [
    'from-violet-400 to-pink-400',
    'from-blue-400 to-violet-400',
    'from-pink-400 to-orange-400',
    'from-green-400 to-blue-400',
  ];
  
  return options[id % options.length];
}

function getTimeLabel(status: string, daysLeft: number) {
  if (status === 'Completed') return `${daysLeft} days ago`;
  if (status === 'Coming Soon') return 'Tomorrow';
  return `${daysLeft} days left`;
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-success/20 text-success';
    case 'Coming Soon':
      return 'bg-neutral-medium/20 text-neutral-medium';
    case 'Completed':
      return 'bg-neutral-dark/20 text-neutral-dark';
    default:
      return 'bg-neutral-medium/20 text-neutral-medium';
  }
}
