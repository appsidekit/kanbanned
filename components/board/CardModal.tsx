"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";
import { CardData, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CardModalProps {
  card: CardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: CardData) => void;
  onDelete?: (cardId: string) => void;
}

const priorities: Priority[] = ["low", "medium", "high"];

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export function CardModal({ card, open, onOpenChange, onSave, onDelete }: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setPriority(card.priority);
    }
  }, [card]);

  const hasChanges = card && (
    title !== card.title ||
    description !== card.description ||
    priority !== card.priority
  );

  const handleSave = () => {
    if (!card) return;
    onSave({
      ...card,
      title: title.trim() || "Untitled",
      description,
      priority,
    });
    onOpenChange(false);
  };

  const handleDiscard = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && handleDiscard()}>
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

          <div className="flex items-center justify-between px-3 py-3 border-t border-white/[0.06]">
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
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(card!.id);
                    onOpenChange(false);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  hasChanges
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/20 text-white/40 cursor-not-allowed"
                )}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
