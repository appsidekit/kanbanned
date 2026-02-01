"use client";

import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteZoneProps {
  isVisible: boolean;
}

export function DeleteZone({ isVisible }: DeleteZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "delete-zone",
  });

  if (!isVisible) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 flex items-center justify-center",
        "rounded-md border-2 border-dashed transition-all duration-200",
        // Mobile: horizontal bar
        "w-full h-16 md:h-auto md:min-h-[calc(100vh-3rem)]",
        isOver
          ? "md:w-72 border-red-500 bg-red-500/10"
          : "md:w-12 border-red-400/50 bg-red-500/5"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2 transition-opacity duration-200",
          isOver ? "opacity-100" : "opacity-50"
        )}
      >
        <Trash2
          size={isOver ? 28 : 20}
          className={cn(
            "transition-all duration-200",
            isOver ? "text-red-500" : "text-red-400/70"
          )}
        />
        {isOver && (
          <span className="text-xs font-medium text-red-500">Drop to delete</span>
        )}
      </div>
    </div>
  );
}
