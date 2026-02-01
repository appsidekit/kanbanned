"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, Plus, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BoardData } from "@/lib/types";

const EMOJI_OPTIONS = [
  "🦀", "🚀", "✨", "🎯", "💡", "🔥", "⚡", "🌟",
  "📋", "📌", "🎨", "🛠️", "💻", "📱", "🌈", "🎮",
  "🏠", "💼", "📚", "🎵", "🌱", "🍕", "☕", "🎉",
];

interface SidebarProps {
  boards: BoardData[];
  selectedBoardId: string;
  onBoardChange: (boardId: string) => void;
  onEmojiChange?: (boardId: string, emoji: string) => void;
  onBoardNameChange?: (boardId: string, name: string) => void;
}

export function Sidebar({ boards, selectedBoardId, onBoardChange, onEmojiChange, onBoardNameChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleStartEditing = () => {
    if (selectedBoard) {
      setEditedName(selectedBoard.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (editedName.trim() && selectedBoard) {
      onBoardNameChange?.(selectedBoard.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  return (
    <aside
      className={cn(
        "shrink-0 transition-all duration-200 ease-in-out",
        "bg-sidebar",
        // Mobile: horizontal header
        "w-full h-14 sticky top-0 z-50",
        "border-b border-white/[0.06]",
        // Desktop: vertical sidebar
        "md:w-56 md:h-screen md:border-b-0 md:border-r",
        isCollapsed && "md:w-16"
      )}
    >
      <div
        className={cn(
          "flex items-center h-full px-3 gap-4",
          // Desktop: vertical layout
          "md:flex-col md:items-stretch md:py-4 md:space-y-4 md:gap-0",
          isCollapsed && "md:px-2"
        )}
      >
        {/* Board Selector */}
        <div className={cn("relative flex-1 md:flex-none", isCollapsed && "md:flex md:justify-center")} ref={dropdownRef}>
          {/* Collapsed state - desktop only */}
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "w-10 h-10 rounded-md bg-card border border-white/[0.06] items-center justify-center hover:bg-card/80 transition-colors",
              isCollapsed ? "hidden md:flex" : "hidden"
            )}
          >
            <span className="text-sm">
              {selectedBoard?.emoji || selectedBoard?.name.charAt(0).toUpperCase()}
            </span>
          </button>
          {/* Expanded state - always on mobile, conditional on desktop */}
          <div className={cn(isCollapsed ? "contents md:hidden" : "contents")}>
              <div
                className="w-full h-10 px-2 rounded-md bg-card border border-white/[0.06] flex items-center justify-between hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsEmojiPickerOpen(false);
                }}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEmojiPickerOpen(!isEmojiPickerOpen);
                      setIsDropdownOpen(false);
                    }}
                    className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors shrink-0 text-sm"
                  >
                    {selectedBoard?.emoji || selectedBoard?.name.charAt(0).toUpperCase()}
                  </button>
                  {isEditingName ? (
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveName}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm bg-transparent border-none outline-none"
                      style={{ width: `${Math.max(editedName.length, 1)}ch` }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditing();
                      }}
                      className="text-sm text-left truncate"
                    >
                      {selectedBoard?.name}
                    </button>
                  )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
              </div>

              {isEmojiPickerOpen && (
                <div className="absolute top-12 left-0 right-0 z-50 rounded-lg bg-card border border-white/[0.06] shadow-lg p-2 md:right-auto md:min-w-[200px]">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onEmojiChange?.(selectedBoardId, emoji);
                          setIsEmojiPickerOpen(false);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/[0.06] transition-colors text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isDropdownOpen && (
                <div className="absolute top-12 left-0 right-0 z-50 rounded-lg bg-card border border-white/[0.06] shadow-lg overflow-hidden md:right-auto md:min-w-[200px]">
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => {
                        onBoardChange(board.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-2 hover:bg-white/[0.06] transition-colors",
                        board.id === selectedBoardId && "bg-white/[0.04]"
                      )}
                    >
                      <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center shrink-0">
                        <span className="text-sm">
                          {board.emoji || board.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="flex-1 text-left text-sm">{board.name}</span>
                    </button>
                  ))}

                  <div className="border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        onBoardChange("__new__");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-7 h-7 rounded border border-dashed border-muted-foreground flex items-center justify-center shrink-0">
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">New board...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Navigation - hidden on mobile */}
        <nav className="hidden md:block flex-1 space-y-1 pt-4 border-t border-white/[0.03]">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center rounded-md transition-colors",
              isCollapsed
                ? "h-10 w-10 justify-center mx-auto"
                : "w-full gap-2.5 px-2 py-2",
              "text-sm",
              "bg-card text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Board</span>}
          </button>
        </nav>

        {/* Branding - hidden on mobile */}
        {!isCollapsed && (
          <div className="hidden md:block text-center text-sm font-mono select-none text-muted-foreground">
            kanbanned.com
          </div>
        )}
      </div>
    </aside>
  );
}
