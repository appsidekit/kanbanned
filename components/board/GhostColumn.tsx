"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostColumnProps {
  onAddColumn: () => void;
}

export function GhostColumn({ onAddColumn }: GhostColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-72 min-h-[calc(100vh-3rem)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={onAddColumn}
        className={cn(
          "w-72 min-h-[calc(100vh-3rem)] rounded-md cursor-pointer",
          "border-2 border-dashed border-gray-500",
          "flex items-center justify-center",
          "transition-opacity duration-200 ease-out",
          isHovered
            ? "opacity-100 bg-muted/30 border-gray-400"
            : "opacity-0"
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
          <Plus size={24} />
          <span className="text-sm font-medium">Add Column</span>
        </div>
      </div>
    </div>
  );
}
