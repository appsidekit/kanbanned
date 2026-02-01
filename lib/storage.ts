import { AppData, BoardData, ColumnData, CardData, Priority } from "./types";

const STORAGE_KEY = "kanbanned-data";

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];

function isValidPriority(value: unknown): value is Priority {
  return typeof value === "string" && VALID_PRIORITIES.includes(value as Priority);
}

function isValidCard(card: unknown): card is CardData {
  if (typeof card !== "object" || card === null) return false;
  const c = card as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    typeof c.description === "string" &&
    isValidPriority(c.priority)
  );
}

function isValidColumn(column: unknown): column is ColumnData {
  if (typeof column !== "object" || column === null) return false;
  const col = column as Record<string, unknown>;
  return (
    typeof col.id === "string" &&
    typeof col.name === "string" &&
    Array.isArray(col.cards) &&
    col.cards.every(isValidCard)
  );
}

function isValidBoard(board: unknown): board is BoardData {
  if (typeof board !== "object" || board === null) return false;
  const b = board as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.name === "string" &&
    (b.emoji === undefined || typeof b.emoji === "string") &&
    Array.isArray(b.columns) &&
    b.columns.every(isValidColumn)
  );
}

function isValidAppData(data: unknown): data is AppData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === "number" &&
    Array.isArray(d.boards) &&
    d.boards.every(isValidBoard)
  );
}

export const defaultBoard: BoardData = {
  id: "default-board",
  name: "kanbanned.com",
  emoji: "🦀",
  columns: [
    {
      id: "col-todo",
      name: "To Do",
      cards: [
        {
          id: "card-1",
          title: "Fix bug that only happens on Fridays",
          description: "It works on my machine, I swear",
          priority: "high",
        },
        {
          id: "card-2",
          title: "Delete node_modules and pray",
          description: "The ancient ritual of JavaScript developers",
          priority: "medium",
        },
        {
          id: "card-3",
          title: "Read the documentation",
          description: "Just kidding, Stack Overflow it is",
          priority: "low",
        },
      ],
    },
    {
      id: "col-doing",
      name: "Doing",
      cards: [
        {
          id: "card-4",
          title: "Mass procrastinating",
          description: "Reorganizing my desktop icons for maximum productivity",
          priority: "high",
        },
        {
          id: "card-5",
          title: "Googling how to exit Vim",
          description: "Day 47: Still trapped. Send help.",
          priority: "high",
        },
      ],
    },
    {
      id: "col-review",
      name: "In Review",
      cards: [
        {
          id: "card-6",
          title: "PR with 2000 lines changed",
          description: "LGTM, I definitely read all of it",
          priority: "medium",
        },
      ],
    },
    {
      id: "col-done",
      name: "Done",
      cards: [
        {
          id: "card-7",
          title: "Added console.log for debugging",
          description: "Forgot to remove them. They're in production now.",
          priority: "low",
        },
        {
          id: "card-8",
          title: "Mass touched grass",
          description: "Outside has great graphics but the gameplay is boring",
          priority: "low",
        },
      ],
    },
  ],
};

export const defaultAppData: AppData = {
  version: 1,
  boards: [defaultBoard],
};

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return defaultAppData;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultAppData;
    }
    const parsed = JSON.parse(stored);
    if (!isValidAppData(parsed)) {
      console.warn("Invalid app data structure in localStorage, using defaults");
      return defaultAppData;
    }
    if (parsed.boards.length === 0) {
      return defaultAppData;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to load app data:", error);
    return defaultAppData;
  }
}

export type SaveResult = { success: true } | { success: false; error: "quota_exceeded" | "unknown" };

export function saveAppData(data: AppData): SaveResult {
  if (typeof window === "undefined") {
    return { success: true };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded. Unable to save data.");
      return { success: false, error: "quota_exceeded" };
    }
    console.error("Failed to save app data:", error);
    return { success: false, error: "unknown" };
  }
}
