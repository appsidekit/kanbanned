"use client";

import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, Plus, X, ChevronDown } from "lucide-react";
import { CardData, Priority, Tag, TAG_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CardModalProps {
  card: CardData | null;
  tags: Tag[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: CardData) => void;
  onDelete?: (cardId: string) => void;
  onCreateTag?: (name: string) => Tag;
  onUpdateTag?: (tagId: string, updates: Partial<Tag>) => void;
}

const priorities: Priority[] = ["low", "medium", "high"];

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export function CardModal({ card, tags, open, onOpenChange, onSave, onDelete, onCreateTag, onUpdateTag }: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [editingColorTagId, setEditingColorTagId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setPriority(card.priority);
      setTagId(card.tagId);
    }
  }, [card]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
        setEditingColorTagId(null);
      }
    };
    if (tagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagDropdownOpen]);

  const handleClose = () => {
    if (card) {
      onSave({
        ...card,
        title: title.trim() || "Untitled",
        description,
        priority,
        tagId,
      });
    }
    setIsCreatingTag(false);
    setNewTagName("");
    setTagDropdownOpen(false);
    setEditingColorTagId(null);
    onOpenChange(false);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim() || !onCreateTag) return;
    const newTag = onCreateTag(newTagName.trim());
    setTagId(newTag.id);
    setNewTagName("");
    setIsCreatingTag(false);
  };

  const currentTag = tags.find((t) => t.id === tagId);

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-lg bg-background border border-gray-600 shadow-lg overflow-hidden">
          <Dialog.Title className="sr-only">Edit Card</Dialog.Title>

          <div className="p-5 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground"
              placeholder="Untitled"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none resize-none placeholder:text-muted-foreground"
              placeholder="Add notes..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Priority</span>
              <div className="flex items-center gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      priorityColors[p],
                      priority === p ? "ring-2 ring-white ring-offset-2 ring-offset-background" : "opacity-40 hover:opacity-70"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <span className="text-xs text-muted-foreground">Tag</span>
              {isCreatingTag ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTag();
                      if (e.key === "Escape") {
                        setIsCreatingTag(false);
                        setNewTagName("");
                      }
                    }}
                    placeholder="Tag name..."
                    maxLength={14}
                    className="w-24 px-2 py-0.5 text-xs bg-white/10 rounded border border-white/20 focus:outline-none focus:border-white/40"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateTag}
                    className="p-0.5 rounded hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingTag(false);
                      setNewTagName("");
                    }}
                    className="p-0.5 rounded hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-md",
                      "border border-white/10 hover:border-white/20 transition-colors"
                    )}
                  >
                    {currentTag ? (
                      <>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: currentTag.color }}
                        />
                        <span style={{ color: currentTag.color }}>{currentTag.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {tagDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-1 w-56 py-1 bg-card border border-white/10 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setTagId(undefined);
                          setTagDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 py-1.5 text-xs text-left hover:bg-white/5 flex items-center gap-2",
                          !tagId && "bg-white/5"
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-muted-foreground">None</span>
                      </button>
                      {tags.map((tag) => (
                        <div key={tag.id} className="relative">
                          {editingColorTagId === tag.id ? (
                            <div className="px-3 py-1.5 flex gap-1">
                              {TAG_COLORS.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    onUpdateTag?.(tag.id, { color });
                                    setEditingColorTagId(null);
                                  }}
                                  className={cn(
                                    "w-4 h-4 rounded-full transition-all",
                                    "hover:scale-110 hover:ring-2 hover:ring-white/40",
                                    tag.color === color && "ring-2 ring-white"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                              <button
                                onClick={() => setEditingColorTagId(null)}
                                className="ml-auto p-0.5 rounded hover:bg-white/10 text-muted-foreground"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setTagId(tag.id);
                                setTagDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full px-3 py-1.5 text-xs text-left hover:bg-white/5 flex items-center gap-2",
                                tagId === tag.id && "bg-white/5"
                              )}
                            >
                              <span
                                onClick={(e) => {
                                  if (onUpdateTag) {
                                    e.stopPropagation();
                                    setEditingColorTagId(tag.id);
                                  }
                                }}
                                className={cn(
                                  "w-3 h-3 rounded-full flex-shrink-0",
                                  onUpdateTag && "hover:ring-2 hover:ring-white/40 cursor-pointer"
                                )}
                                style={{ backgroundColor: tag.color }}
                              />
                              <span style={{ color: tag.color }}>{tag.name}</span>
                            </button>
                          )}
                        </div>
                      ))}
                      {onCreateTag && (
                        <button
                          onClick={() => {
                            setIsCreatingTag(true);
                            setTagDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left hover:bg-white/5 flex items-center gap-2 border-t border-white/5 mt-1 pt-1.5"
                        >
                          <Plus className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">New tag</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {onDelete && (
              <>
                <div className="flex-1" />
                <button
                  onClick={() => {
                    onDelete(card!.id);
                    onOpenChange(false);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
