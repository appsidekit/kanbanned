"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  TouchSensor,
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
import { Column } from "@/components/board/Column";
import { Sidebar } from "@/components/board/Sidebar";
import { GhostColumn } from "@/components/board/GhostColumn";
import { DeleteZone } from "@/components/board/DeleteZone";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CardModal } from "@/components/board/CardModal";
import { loadAppData, saveAppDataDebounced, flushPendingSave, generateId, defaultBoard, LoadResult } from "@/lib/storage";
import { AppData, BoardData, CardData, ColumnData, Tag, TAG_COLORS } from "@/lib/types";
import { DELETE_ZONE_ID, POINTER_SENSOR_OPTIONS, TOUCH_SENSOR_OPTIONS } from "@/lib/dnd";
import { useToast } from "@/components/ui/toast";

export default function HomePage() {
  // Start with null to avoid hydration mismatch - localStorage only available on client
  const [appData, setAppData] = useState<AppData | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const loadResultRef = useRef<LoadResult | null>(null);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnData | null>(null);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<ColumnData | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const { toast } = useToast();

  const handleSave = (data: AppData) => {
    saveAppDataDebounced(data, (result) => {
      if (!result.success) {
        if (result.error === "quota_exceeded") {
          toast("Storage full. Your changes may not be saved. Try deleting some boards or cards.", "error");
        } else {
          toast("Failed to save changes. Please try again.", "error");
        }
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS)
  );

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    const result = loadAppData();
    loadResultRef.current = result;
    setAppData(result.data);
    setSelectedBoardId(result.data.boards[0]?.id || "");

    // Notify user if data was recovered or reset
    const { discarded, recovered, usedDefaults } = result;
    const totalDiscarded = discarded.cards + discarded.columns + discarded.boards;
    const totalRecovered = recovered.cards + recovered.columns + recovered.boards;

    if (usedDefaults && totalDiscarded === 0 && totalRecovered === 0) {
      // Complete reset due to parse error or invalid structure
      toast("Could not load saved data. Starting fresh.", "error");
    } else if (totalDiscarded > 0) {
      const parts: string[] = [];
      if (discarded.boards > 0) parts.push(`${discarded.boards} board${discarded.boards > 1 ? "s" : ""}`);
      if (discarded.columns > 0) parts.push(`${discarded.columns} column${discarded.columns > 1 ? "s" : ""}`);
      if (discarded.cards > 0) parts.push(`${discarded.cards} card${discarded.cards > 1 ? "s" : ""}`);
      toast(`Removed ${parts.join(", ")} due to invalid data.`, "error");
    } else if (totalRecovered > 0) {
      const parts: string[] = [];
      if (recovered.boards > 0) parts.push(`${recovered.boards} board${recovered.boards > 1 ? "s" : ""}`);
      if (recovered.columns > 0) parts.push(`${recovered.columns} column${recovered.columns > 1 ? "s" : ""}`);
      if (recovered.cards > 0) parts.push(`${recovered.cards} card${recovered.cards > 1 ? "s" : ""}`);
      toast(`Fixed ${parts.join(", ")} with missing data.`, "warning");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush pending saves on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingSave();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushPendingSave();
    };
  }, []);

  const selectedBoard = appData?.boards.find((b) => b.id === selectedBoardId);

  const handleBoardChange = (boardId: string) => {
    if (!appData) return;
    if (boardId === "__new__") {
      const newBoard = {
        ...defaultBoard,
        id: generateId("board"),
        name: `New Board`,
        columns: defaultBoard.columns.map((col) => ({
          ...col,
          id: generateId("col"),
          cards: col.cards.map((card) => ({
            ...card,
            id: generateId("card"),
          })),
        })),
      };
      const newData = {
        ...appData,
        boards: [...appData.boards, newBoard],
      };
      setAppData(newData);
      handleSave(newData);
      setSelectedBoardId(newBoard.id);
      return;
    }
    setSelectedBoardId(boardId);
  };

  const handleEmojiChange = (boardId: string, emoji: string) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === boardId ? { ...b, emoji } : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
  };

  const handleBoardNameChange = (boardId: string, name: string) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === boardId ? { ...b, name } : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
  };

  const handleAddColumn = () => {
    if (!appData || !selectedBoard) return;

    const newColumn: ColumnData = {
      id: generateId("col"),
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
    handleSave(newData);
  };

  const handleColumnNameChange = (columnId: string, name: string) => {
    if (!appData) return;
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
    handleSave(newData);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? { ...b, columns: b.columns.filter((col) => col.id !== columnId) }
          : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
    setColumnToDelete(null);
  };

  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
  };

  const handleCardSave = (updatedCard: CardData) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? {
              ...b,
              columns: b.columns.map((col) => ({
                ...col,
                cards: col.cards.map((card) =>
                  card.id === updatedCard.id ? updatedCard : card
                ),
              })),
            }
          : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
  };

  const handleCardDelete = (cardId: string) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? {
              ...b,
              columns: b.columns.map((col) => ({
                ...col,
                cards: col.cards.filter((card) => card.id !== cardId),
              })),
            }
          : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
  };

  const handleCreateTag = (name: string): Tag => {
    // Return existing tag if name already exists
    const existingTag = selectedBoard?.tags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existingTag) return existingTag;

    const newTag: Tag = {
      id: generateId("tag"),
      name,
      color: TAG_COLORS[(selectedBoard?.tags.length ?? 0) % TAG_COLORS.length],
    };

    if (!appData) return newTag;

    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? { ...b, tags: [...b.tags, newTag] }
          : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
    return newTag;
  };

  const handleAddCard = (columnId: string, input: string) => {
    if (!appData) return;

    // Parse [tagname] syntax from start of input
    let tagId: string | undefined;
    let newTag: Tag | null = null;
    let title = input;
    const tagMatch = input.match(/^\[([^\]]+)\]\s*/);
    if (tagMatch) {
      const tagName = tagMatch[1].trim();
      if (tagName) {
        // Find the current board to check for existing tags
        const board = appData.boards.find((b) => b.id === selectedBoardId);
        const existingTag = board?.tags.find(
          (t) => t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (existingTag) {
          tagId = existingTag.id;
        } else if (board) {
          newTag = {
            id: generateId("tag"),
            name: tagName,
            color: TAG_COLORS[board.tags.length % TAG_COLORS.length],
          };
          tagId = newTag.id;
        }
      }
      title = input.slice(tagMatch[0].length);
    }

    if (!title.trim()) return;

    const newCard: CardData = {
      id: generateId("card"),
      title: title.trim(),
      description: "",
      priority: "low",
      ...(tagId && { tagId }),
    };

    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId
          ? {
              ...b,
              tags: newTag ? [...b.tags, newTag] : b.tags,
              columns: b.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: [...col.cards, newCard] }
                  : col
              ),
            }
          : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
  };

  const findColumnContainingCard = (cardId: string): ColumnData | undefined => {
    return selectedBoard?.columns.find((col) =>
      col.cards.some((card) => card.id === cardId)
    );
  };

  const isColumnId = (id: string): boolean => {
    return selectedBoard?.columns.some((col) => col.id === id) ?? false;
  };

  // Board state update helper
  const updateBoard = (updater: (board: BoardData) => BoardData) => {
    if (!appData) return;
    const newData = {
      ...appData,
      boards: appData.boards.map((b) =>
        b.id === selectedBoardId ? updater(b) : b
      ),
    };
    setAppData(newData);
    handleSave(newData);
    return newData;
  };

  const handleColumnDeletion = (columnId: string) => {
    if (!selectedBoard) return;
    const column = selectedBoard.columns.find((c) => c.id === columnId);
    if (column) {
      setColumnToDelete(column);
    }
  };

  const handleColumnReorder = (activeId: string, overId: string) => {
    if (!selectedBoard || activeId === overId) return;

    const oldIndex = selectedBoard.columns.findIndex((c) => c.id === activeId);
    const newIndex = selectedBoard.columns.findIndex((c) => c.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newColumns = arrayMove(selectedBoard.columns, oldIndex, newIndex);
    updateBoard((board) => ({ ...board, columns: newColumns }));
  };

  const handleCardMove = (activeId: string, over: { id: string | number; data: { current?: unknown } }) => {
    if (!selectedBoard) return;

    const activeColumn = findColumnContainingCard(activeId);
    if (!activeColumn) return;

    const overId = String(over.id);

    // Determine target column and tag assignment
    let targetColumnId: string | undefined;
    let newTagId: string | null | undefined = undefined; // undefined = no change, null = remove tag
    let droppedOnCard = false; // true if dropped on a specific card (allows reordering)

    // Get droppable data from the element we're dropping on
    const overData = over.data.current as { type?: string; columnId?: string; zoneTagId?: string | null } | undefined;

    if (overData?.type === "zone" && overData.columnId) {
      // Dropping on a swim lane zone - no reordering, just change tag
      targetColumnId = overData.columnId;
      newTagId = overData.zoneTagId ?? null;
    } else if (overData?.type === "card" && overData.columnId) {
      // Dropping on a card - use its zone data, allow reordering
      targetColumnId = overData.columnId;
      newTagId = overData.zoneTagId ?? null;
      droppedOnCard = true;
    } else if (overId.startsWith("column-")) {
      // Check if dropping on a column droppable area
      targetColumnId = overId.replace("column-", "");
    } else if (isColumnId(overId)) {
      // Dropping on the column itself
      targetColumnId = overId;
    } else {
      // Fallback - find which column the card is in
      const overColumn = findColumnContainingCard(overId);
      targetColumnId = overColumn?.id;
    }

    if (!targetColumnId) return;

    const targetColumn = selectedBoard.columns.find((c) => c.id === targetColumnId);
    if (!targetColumn) return;

    const activeCard = activeColumn.cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Prepare the card with potentially updated tag
    const movedCard: CardData = newTagId !== undefined
      ? newTagId === null
        ? { ...activeCard, tagId: undefined }
        : { ...activeCard, tagId: newTagId }
      : activeCard;

    // Notify user if tag was auto-changed due to swim lane move
    if (newTagId !== undefined && newTagId !== activeCard.tagId) {
      const oldTagName = selectedBoard.tags.find((t) => t.id === activeCard.tagId)?.name;
      const newTagName = newTagId ? selectedBoard.tags.find((t) => t.id === newTagId)?.name : null;

      if (oldTagName && newTagName) {
        toast(`Tag changed from "${oldTagName}" to "${newTagName}"`, "info");
      } else if (oldTagName && !newTagName) {
        toast(`Tag "${oldTagName}" removed`, "info");
      } else if (!oldTagName && newTagName) {
        toast(`Tag "${newTagName}" applied`, "info");
      }
    }

    // Check if tag is actually changing
    const isTagChanging = newTagId !== undefined && newTagId !== activeCard.tagId;

    // Same column
    if (activeColumn.id === targetColumn.id) {
      const oldIndex = activeColumn.cards.findIndex((c) => c.id === activeId);

      // Only allow reordering if dropped on a card AND staying in same zone
      let newCards: CardData[];
      if (droppedOnCard && !isTagChanging) {
        const newIndex = activeColumn.cards.findIndex((c) => c.id === overId);
        if (oldIndex === newIndex) return; // No change
        if (newIndex !== -1) {
          newCards = arrayMove(activeColumn.cards, oldIndex, newIndex).map((c) =>
            c.id === activeId ? movedCard : c
          );
        } else {
          return; // Dropped on card but can't find it
        }
      } else if (isTagChanging) {
        // Changing zones - just update the tag, keep position
        newCards = activeColumn.cards.map((c) =>
          c.id === activeId ? movedCard : c
        );
      } else {
        return; // No meaningful change
      }

      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((col) =>
          col.id === activeColumn.id ? { ...col, cards: newCards } : col
        ),
      }));
    } else {
      // Moving card to different column
      const sourceCards = activeColumn.cards.filter((c) => c.id !== activeId);

      // Only allow reordering if dropped on a card in the same zone
      let insertIndex = targetColumn.cards.length;
      if (droppedOnCard && !isTagChanging) {
        const overIndex = targetColumn.cards.findIndex((c) => c.id === overId);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      const targetCards = [...targetColumn.cards];
      targetCards.splice(insertIndex, 0, movedCard);

      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((col) => {
          if (col.id === activeColumn.id) {
            return { ...col, cards: sourceCards };
          }
          if (col.id === targetColumn.id) {
            return { ...col, cards: targetCards };
          }
          return col;
        }),
      }));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    if (isColumnId(activeId)) {
      setIsDraggingColumn(true);
      const column = selectedBoard?.columns.find((c) => c.id === activeId);
      setActiveColumn(column || null);
    } else {
      // Only track card drags for overlay
      const column = findColumnContainingCard(activeId);
      const card = column?.cards.find((c) => c.id === activeId);
      setActiveCard(card || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    setActiveColumn(null);
    setIsDraggingColumn(false);

    const { active, over } = event;
    if (!appData || !over || !selectedBoard) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Deletion
    if (overId === DELETE_ZONE_ID) {
      if (isColumnId(activeId)) {
        handleColumnDeletion(activeId);
      } else {
        handleCardDelete(activeId);
      }
      return;
    }

    // Column reordering
    if (isColumnId(activeId)) {
      handleColumnReorder(activeId, overId);
      return;
    }

    // Card movement
    handleCardMove(activeId, over);
  };

  // Wait for client-side data load
  if (!appData || !selectedBoard) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        boards={appData.boards}
        selectedBoardId={selectedBoardId}
        onBoardChange={handleBoardChange}
        onEmojiChange={handleEmojiChange}
        onBoardNameChange={handleBoardNameChange}
      />

      <main className="flex-1 p-4 md:p-6 overflow-x-auto md:overflow-x-auto overflow-y-auto">
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
            <div className="flex flex-col gap-4 md:flex-row md:gap-3 md:w-max">
              <DeleteZone isVisible={isDraggingColumn || activeCard !== null} />
              {selectedBoard.columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tags={selectedBoard.tags}
                  onNameChange={handleColumnNameChange}
                  onCardClick={handleCardClick}
                  onAddCard={handleAddCard}
                />
              ))}
              <GhostColumn onAddColumn={handleAddColumn} />
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCard ? (
              <Card title={activeCard.title} priority={activeCard.priority} hasDescription={!!activeCard.description} className="rotate-3 shadow-lg" />
            ) : activeColumn ? (
              <Column title={activeColumn.name} count={activeColumn.cards.length} className="rotate-2 shadow-xl">
                {activeColumn.cards.map((card) => (
                  <Card key={card.id} title={card.title} priority={card.priority} hasDescription={!!card.description} />
                ))}
              </Column>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <ConfirmDialog
        open={columnToDelete !== null}
        onOpenChange={(open) => !open && setColumnToDelete(null)}
        title={`Delete "${columnToDelete?.name}"?`}
        description={
          columnToDelete?.cards.length
            ? `This will permanently delete this column and ${columnToDelete.cards.length} card${columnToDelete.cards.length === 1 ? "" : "s"}.`
            : "This will permanently delete this empty column."
        }
        onConfirm={() => columnToDelete && handleDeleteColumn(columnToDelete.id)}
      />

      <CardModal
        card={selectedCard}
        tags={selectedBoard.tags}
        open={selectedCard !== null}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}
