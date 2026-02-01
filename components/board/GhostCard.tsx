"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostCardProps {
  visible: boolean;
  onAddCard: (title: string) => void;
}

export function GhostCard({ visible, onAddCard }: GhostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = (keepOpen: boolean = false) => {
    const trimmed = title.trim();
    if (trimmed) {
      onAddCard(trimmed);
      setTitle("");
      if (!keepOpen) {
        setIsEditing(false);
      }
    } else {
      setTitle("");
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(true);
    } else if (e.key === "Escape") {
      setTitle("");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="rounded-md bg-card border border-white/[0.06] px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => handleSave()}
            placeholder="Card title..."
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
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
