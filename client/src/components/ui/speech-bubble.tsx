import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SpeechBubble = forwardRef<HTMLDivElement, SpeechBubbleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative border-2 border-black rounded-[20px] p-3 bg-white",
          "after:content-[''] after:absolute after:bottom-[-10px] after:left-5 after:w-5 after:h-[10px]",
          "after:bg-white after:border-l-2 after:border-b-2 after:border-black after:skew-x-[20deg]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SpeechBubble.displayName = "SpeechBubble";

export { SpeechBubble };
