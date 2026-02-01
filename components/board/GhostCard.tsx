"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostCardProps {
  visible: boolean;
  onAddCard: () => void;
}

export function GhostCard({ visible, onAddCard }: GhostCardProps) {
  return (
    <div
      onClick={onAddCard}
      className={cn(
        "rounded-md cursor-pointer px-3 py-2.5",
        "border-2 border-dashed border-gray-600",
        "flex items-center justify-center",
        "transition-opacity duration-200 ease-out",
        visible
          ? "opacity-100 bg-muted/20"
          : "opacity-0 pointer-events-none"
      )}
    >
      <Plus size={14} className="text-gray-600" />
    </div>
  );
}
