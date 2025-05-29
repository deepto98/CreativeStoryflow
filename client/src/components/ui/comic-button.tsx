import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

export interface ComicButtonProps extends ButtonProps {}

const ComicButton = forwardRef<HTMLButtonElement, ComicButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "border-2 border-black transform transition-all duration-100 ease-in-out",
          "shadow-comic-sm hover:shadow-comic hover:-translate-y-1 active:shadow-none active:translate-y-1",
          "font-bold flex items-center",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ComicButton.displayName = "ComicButton";

export { ComicButton };
