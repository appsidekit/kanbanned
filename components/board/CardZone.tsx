"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableCard } from "./SortableCard";
import { CardData, Tag } from "@/lib/types";
import { createZoneId } from "@/lib/dnd";

interface CardZoneProps {
  columnId: string;
  tag?: Tag;           // undefined = untagged zone
  cards: CardData[];
  onCardClick?: (card: CardData) => void;
}

export function CardZone({ columnId, tag, cards, onCardClick }: CardZoneProps) {
  const zoneId = createZoneId(columnId, tag?.id ?? null);
  const { setNodeRef, isOver } = useDroppable({
    id: zoneId,
    data: { type: "zone", columnId, zoneTagId: tag?.id ?? null },
  });

  const isTagged = !!tag;

  return (
    <div
      ref={setNodeRef}
      className={`${isTagged ? "mt-2" : ""} space-y-2 ${!isTagged ? "min-h-[8px]" : ""} rounded-md transition-colors ${isOver ? "bg-accent/50" : ""}`}
    >
      {isTagged && (
        <div className="flex items-center gap-2 px-1 py-1.5 text-xs text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <span>{tag.name}</span>
          <span className="opacity-50">({cards.length})</span>
        </div>
      )}
      {cards.map((card) => (
        <SortableCard
          key={card.id}
          card={card}
          columnId={columnId}
          zoneTagId={tag?.id ?? null}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
