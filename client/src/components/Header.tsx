import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function Header() {
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  const initials = currentUser ? 
    `${currentUser.username.charAt(0)}${currentUser.username.charAt(1)}`.toUpperCase() : 
    "JS";

  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-comic-sm">
            <i className="ri-movie-2-fill text-white text-xl"></i>
          </div>
          <Link href="/">
            <h1 className="font-bangers text-3xl md:text-4xl tracking-wider text-neutral-dark cursor-pointer">
              AI Storyboard
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-neutral-light">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <span className="hidden md:inline font-semibold">
              {currentUser?.username || "Guest User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
