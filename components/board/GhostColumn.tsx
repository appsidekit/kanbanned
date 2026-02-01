"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn, ghostStyles } from "@/lib/utils";

interface GhostColumnProps {
  onAddColumn: () => void;
}

export function GhostColumn({ onAddColumn }: GhostColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-full md:w-72 min-h-[120px] md:min-h-[calc(100vh-3rem)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={onAddColumn}
        className={cn(
          "w-full md:w-72 min-h-[120px] md:min-h-[calc(100vh-3rem)] rounded-md cursor-pointer",
          `border-2 border-dashed ${ghostStyles.border}`,
          "flex items-center justify-center",
          "transition-opacity duration-200 ease-out",
          // Always visible on mobile, hover-dependent on desktop
          "opacity-100 md:opacity-0",
          isHovered && "md:opacity-100 bg-muted/30"
        )}
      >
        <div className={cn("flex flex-col items-center gap-2", ghostStyles.text)}>
          <Plus size={24} />
          <span className="text-sm font-medium">Add Column</span>
        </div>
      </div>
    </div>
  );
}
