"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./Card";
import { CardData } from "@/lib/types";

interface SortableCardProps {
  card: CardData;
  columnId: string;
  zoneTagId: string | null; // null for untagged zone
  onCardClick?: (card: CardData) => void;
}

export function SortableCard({ card, columnId, zoneTagId, onCardClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId, zoneTagId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging (drag has distance threshold of 8px)
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <Card title={card.title} priority={card.priority} hasDescription={!!card.description} />
    </div>
  );
}
