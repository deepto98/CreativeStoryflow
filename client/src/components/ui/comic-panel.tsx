import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ComicPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isPending?: boolean;
  panelNumber?: number;
  isLatest?: boolean;
  username?: string;
  votes?: number;
}

const ComicPanel = forwardRef<HTMLDivElement, ComicPanelProps>(
  ({ 
    className, 
    children, 
    isPending = false, 
    panelNumber, 
    isLatest = false, 
    username, 
    votes, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col border-3 border-black shadow-comic bg-white overflow-hidden",
          isPending ? "border-dashed" : "border-solid",
          className
        )}
        {...props}
      >
        {/* Panel Content */}
        <div className="relative h-full flex-1 overflow-hidden">
          {panelNumber && !isPending && (
            <div className="absolute top-2 left-2 w-8 h-8 bg-primary font-bangers text-white flex items-center justify-center rounded-full border-2 border-black text-xl z-10">
              {panelNumber}
            </div>
          )}

          {isLatest && (
            <div className="absolute -top-2 -right-2 bg-accent text-white px-3 py-1 rounded-full border-2 border-black text-xs font-bold z-10">
              Latest
            </div>
          )}

          {children}
        </div>

        {/* Panel Footer */}
        {!isPending && votes !== undefined && username && (
          <div className="bg-neutral-light p-2 border-t-2 border-black flex justify-between items-center text-sm">
            <div className="flex items-center">
              <i className="ri-heart-fill text-red-500 mr-1"></i>
              <span>{votes}</span>
            </div>
            <span className="text-xs">By @{username}</span>
          </div>
        )}
      </div>
    );
  }
);

ComicPanel.displayName = "ComicPanel";

export { ComicPanel };
