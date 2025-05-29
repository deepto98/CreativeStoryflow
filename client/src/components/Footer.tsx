import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white py-8 border-t-4 border-black mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <i className="ri-movie-2-fill text-white text-sm"></i>
              </div>
              <Link href="/">
                <h2 className="font-bangers text-2xl tracking-wider cursor-pointer">AI Storyboard</h2>
              </Link>
            </div>
            <p className="text-sm text-neutral-light/80 max-w-md text-center md:text-left">
              A collaborative platform for creating comic strips and storyboards using AI-generated images based on your prompts.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-comic font-bold mb-3">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-primary-light">Daily Challenges</Link></li>
                <li><Link href="/storyboards" className="hover:text-primary-light">Community Stories</Link></li>
                <li><Link href="/artists" className="hover:text-primary-light">Featured Artists</Link></li>
                <li><Link href="/tutorials" className="hover:text-primary-light">Tutorials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-comic font-bold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/guides/prompts" className="hover:text-primary-light">Prompt Guide</Link></li>
                <li><Link href="/about/ethics" className="hover:text-primary-light">AI Ethics</Link></li>
                <li><Link href="/faq" className="hover:text-primary-light">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-primary-light">Support</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-comic font-bold mb-3">Connect</h3>
              <div className="flex space-x-3 mb-3">
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary">
                  <i className="ri-twitter-fill text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary">
                  <i className="ri-instagram-fill text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary">
                  <i className="ri-discord-fill text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary">
                  <i className="ri-github-fill text-white"></i>
                </a>
              </div>
              <p className="text-xs text-neutral-light/60">Join our community to stay updated</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-light/60">
          <p>© {new Date().getFullYear()} AI Storyboard. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
