"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "./Column";
import { SortableCard } from "./SortableCard";
import { CardData, ColumnData } from "@/lib/types";

interface SortableColumnProps {
  column: ColumnData;
  onNameChange?: (columnId: string, name: string) => void;
  onCardClick?: (card: CardData) => void;
  onAddCard?: (columnId: string) => void;
}

export function SortableColumn({ column, onNameChange, onCardClick, onAddCard }: SortableColumnProps) {
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

  return (
    <div ref={setSortableRef} style={style}>
      <Column
        title={column.name}
        count={column.cards.length}
        dragHandleProps={{ ...attributes, ...listeners }}
        droppableRef={setDroppableRef}
        onNameChange={onNameChange ? (name) => onNameChange(column.id, name) : undefined}
        onAddCard={onAddCard ? () => onAddCard(column.id) : undefined}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onCardClick={onCardClick} />
          ))}
        </SortableContext>
      </Column>
    </div>
  );
}
