"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface ColumnProps {
  title: string;
  count?: number;
  children?: React.ReactNode;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  droppableRef?: (node: HTMLElement | null) => void;
  onNameChange?: (name: string) => void;
}

export function Column({ title, count = 0, children, className, dragHandleProps, droppableRef, onNameChange }: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title);
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
        "flex flex-col w-72 bg-column rounded-md",
        "min-h-[calc(100vh-3rem)]",
        className
      )}
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
      </div>
    </div>
  );
}
