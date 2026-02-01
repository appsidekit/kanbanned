"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "./Column";
import { SortableCard } from "./SortableCard";
import { CardData, ColumnData, Tag } from "@/lib/types";

interface SortableColumnProps {
  column: ColumnData;
  tags: Tag[];
  onNameChange?: (columnId: string, name: string) => void;
  onCardClick?: (card: CardData) => void;
  onAddCard?: (columnId: string, title: string) => void;
}

interface TagZoneProps {
  columnId: string;
  tag: Tag;
  cards: CardData[];
  onCardClick?: (card: CardData) => void;
}

function TagZone({ columnId, tag, cards, onCardClick }: TagZoneProps) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 px-1 py-1.5 text-xs text-muted-foreground">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <span>{tag.name}</span>
        <span className="opacity-50">({cards.length})</span>
      </div>
      {cards.map((card) => (
        <SortableCard
          key={card.id}
          card={card}
          columnId={columnId}
          zoneTagId={tag.id}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

interface UntaggedZoneProps {
  columnId: string;
  cards: CardData[];
  onCardClick?: (card: CardData) => void;
}

function UntaggedZone({ columnId, cards, onCardClick }: UntaggedZoneProps) {
  return (
    <div className="space-y-2 min-h-[8px]">
      {cards.map((card) => (
        <SortableCard
          key={card.id}
          card={card}
          columnId={columnId}
          zoneTagId={null}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

export function SortableColumn({ column, tags, onNameChange, onCardClick, onAddCard }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  // Group cards: untagged first, then by tag (sorted alphabetically)
  const untaggedCards = column.cards.filter((c) => !c.tagId);

  // Get unique tag IDs present in this column
  const tagIdsInColumn = [...new Set(column.cards.map((c) => c.tagId).filter(Boolean))] as string[];

  // Get tags that are in this column, sorted alphabetically by name
  const tagsInColumn = tags
    .filter((t) => tagIdsInColumn.includes(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Build sorted card list for SortableContext
  const sortedCards = [
    ...untaggedCards,
    ...tagsInColumn.flatMap((tag) => column.cards.filter((c) => c.tagId === tag.id)),
  ];

  return (
    <div ref={setSortableRef} style={style}>
      <Column
        title={column.name}
        count={column.cards.length}
        dragHandleProps={{ ...attributes, ...listeners }}
        droppableRef={setDroppableRef}
        onNameChange={onNameChange ? (name) => onNameChange(column.id, name) : undefined}
        onAddCard={onAddCard ? (title) => onAddCard(column.id, title) : undefined}
      >
        <SortableContext
          items={sortedCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Untagged cards zone */}
          <UntaggedZone
            columnId={column.id}
            cards={untaggedCards}
            onCardClick={onCardClick}
          />

          {/* Tagged groups with headers */}
          {tagsInColumn.map((tag) => {
            const tagCards = column.cards.filter((c) => c.tagId === tag.id);
            return (
              <TagZone
                key={tag.id}
                columnId={column.id}
                tag={tag}
                cards={tagCards}
                onCardClick={onCardClick}
              />
            );
          })}
        </SortableContext>
      </Column>
    </div>
  );
}
