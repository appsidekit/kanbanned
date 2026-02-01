"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { GhostCard } from "./GhostCard";

interface ColumnProps {
  title: string;
  count?: number;
  children?: React.ReactNode;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  droppableRef?: (node: HTMLElement | null) => void;
  onNameChange?: (name: string) => void;
  onAddCard?: (title: string) => void;
}

export function Column({ title, count = 0, children, className, dragHandleProps, droppableRef, onNameChange, onAddCard }: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditedName(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedName.trim() && editedName.trim() !== title) {
      onNameChange?.(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-column rounded-md",
        // Mobile: full width, compact height
        "w-full min-h-[200px] max-h-[400px]",
        // Desktop: fixed width, full height
        "md:w-72 md:min-h-[calc(100vh-3rem)] md:max-h-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-1">
          {dragHandleProps && (
            <button
              className="text-muted-foreground cursor-grab active:cursor-grabbing -ml-1"
              {...dragHandleProps}
            >
              <GripVertical size={14} />
            </button>
          )}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground bg-transparent border-none outline-none"
              style={{ width: `${Math.max(editedName.length, 1)}ch` }}
            />
          ) : (
            <h2
              onClick={handleStartEditing}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              {title}
            </h2>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div ref={droppableRef} className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto min-h-[100px]">
        {children}
        {onAddCard && <GhostCard visible={isHovered} onAddCard={onAddCard} />}
      </div>
    </div>
  );
}
