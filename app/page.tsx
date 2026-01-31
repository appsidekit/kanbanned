"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableColumn } from "@/components/board/SortableColumn";
import { Card } from "@/components/board/Card";
import { Sidebar } from "@/components/board/Sidebar";
import { GhostColumn } from "@/components/board/GhostColumn";
import { loadAppData, saveAppData, defaultAppData, defaultBoard } from "@/lib/storage";
import { AppData, CardData, ColumnData } from "@/lib/types";

export default function HomePage() {
  const [appData, setAppData] = useState<AppData>(defaultAppData);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const data = loadAppData();
    setAppData(data);
    setSelectedBoardId(data.boards[0]?.id || "");
    setIsLoaded(true);
  }, []);

  const selectedBoard = appData.boards.find((b) => b.id === selectedBoardId);

  const handleBoardChange = (boardId: string) => {
    if (boardId === "__new__") {
      const timestamp = Date.now();
      const newBoard = {
        ...defaultBoard,
        id: `board-${timestamp}`,
        name: `New Board`,
        columns: defaultBoard.columns.map((col, colIndex) => ({
          ...col,
          id: `col-${timestamp}-${colIndex}`,
          cards: col.cards.map((card, cardIndex) => ({
            ...card,
            id: `card-${timestamp}-${colIndex}-${cardIndex}`,
          })),
        })),
      };
      const newData = {
        ...appData,
        boards: [...appData.boards, newBoard],
      };
      setAppData(newData);
      saveAppData(newData);
      setSelectedBoardId(newBoard.id);
      return;
    }
    setSelectedBoardId(boardId);
  };

  const handleEmojiChange = (boardId: string, emoji: string) => {
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === boardId ? { ...b, emoji } : b
      ),
    };
    setAppData(newData);
    saveAppData(newData);
  };

  const handleBoardNameChange = (boardId: string, name: string) => {
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === boardId ? { ...b, name } : b
      ),
    };
    setAppData(newData);
    saveAppData(newData);
  };

  const handleAddColumn = () => {
    if (!selectedBoard) return;

    const timestamp = Date.now();
    const newColumn: ColumnData = {
      id: `col-${timestamp}`,
      name: "New Column",
      cards: [],
    };

    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? { ...b, columns: [...b.columns, newColumn] }
          : b
      ),
    };
    setAppData(newData);
    saveAppData(newData);
  };

  const handleColumnNameChange = (columnId: string, name: string) => {
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? {
              ...b,
              columns: b.columns.map((col) =>
                col.id === columnId ? { ...col, name } : col
              ),
            }
          : b
      ),
    };
    setAppData(newData);
    saveAppData(newData);
  };

  const findColumnContainingCard = (cardId: string): ColumnData | undefined => {
    return selectedBoard?.columns.find((col) =>
      col.cards.some((card) => card.id === cardId)
    );
  };

  const isColumnId = (id: string): boolean => {
    return selectedBoard?.columns.some((col) => col.id === id) ?? false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    // Only track card drags for overlay
    if (!isColumnId(activeId)) {
      const column = findColumnContainingCard(activeId);
      const card = column?.cards.find((c) => c.id === activeId);
      setActiveCard(card || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;

    if (!over || !selectedBoard) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle column reordering
    if (isColumnId(activeId)) {
      if (activeId === overId) return;

      const oldIndex = selectedBoard.columns.findIndex((c) => c.id === activeId);
      const newIndex = selectedBoard.columns.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newColumns = arrayMove(selectedBoard.columns, oldIndex, newIndex);

      const newData = {
        ...appData,
        boards: appData.boards.map((b) =>
          b.id === selectedBoardId ? { ...b, columns: newColumns } : b
        ),
      };

      setAppData(newData);
      saveAppData(newData);
      return;
    }

    // Handle card reordering/moving
    const activeColumn = findColumnContainingCard(activeId);
    if (!activeColumn) return;

    // Determine target column
    let targetColumnId: string | undefined;

    // Check if dropping on a column droppable area
    if (overId.startsWith("column-")) {
      targetColumnId = overId.replace("column-", "");
    } else if (isColumnId(overId)) {
      // Dropping on the column itself
      targetColumnId = overId;
    } else {
      // Dropping on another card - find which column it's in
      const overColumn = findColumnContainingCard(overId);
      targetColumnId = overColumn?.id;
    }

    if (!targetColumnId) return;

    const targetColumn = selectedBoard.columns.find((c) => c.id === targetColumnId);
    if (!targetColumn) return;

    const activeCard = activeColumn.cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Same column reordering
    if (activeColumn.id === targetColumn.id) {
      const oldIndex = activeColumn.cards.findIndex((c) => c.id === activeId);
      const newIndex = activeColumn.cards.findIndex((c) => c.id === overId);

      if (oldIndex === newIndex) return;

      const newCards = arrayMove(activeColumn.cards, oldIndex, newIndex);

      const newColumns = selectedBoard.columns.map((col) =>
        col.id === activeColumn.id ? { ...col, cards: newCards } : col
      );

      const newData = {
        ...appData,
        boards: appData.boards.map((b) =>
          b.id === selectedBoardId ? { ...b, columns: newColumns } : b
        ),
      };

      setAppData(newData);
      saveAppData(newData);
    } else {
      // Moving card to different column
      const sourceCards = activeColumn.cards.filter((c) => c.id !== activeId);

      // Find insertion index in target column
      let insertIndex = targetColumn.cards.length;
      if (!overId.startsWith("column-") && !isColumnId(overId)) {
        const overIndex = targetColumn.cards.findIndex((c) => c.id === overId);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      const targetCards = [...targetColumn.cards];
      targetCards.splice(insertIndex, 0, activeCard);

      const newColumns = selectedBoard.columns.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, cards: sourceCards };
        }
        if (col.id === targetColumn.id) {
          return { ...col, cards: targetCards };
        }
        return col;
      });

      const newData = {
        ...appData,
        boards: appData.boards.map((b) =>
          b.id === selectedBoardId ? { ...b, columns: newColumns } : b
        ),
      };

      setAppData(newData);
      saveAppData(newData);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!selectedBoard) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        boards={appData.boards}
        selectedBoardId={selectedBoardId}
        onBoardChange={handleBoardChange}
        onEmojiChange={handleEmojiChange}
        onBoardNameChange={handleBoardNameChange}
      />

      <main className="flex-1 p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedBoard.columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 w-max">
              {selectedBoard.columns.map((column) => (
                <SortableColumn key={column.id} column={column} onNameChange={handleColumnNameChange} />
              ))}
              <GhostColumn onAddColumn={handleAddColumn} />
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCard ? <Card title={activeCard.title} className="rotate-3 shadow-lg" /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
