import { AppData, BoardData, ColumnData, CardData, Priority, Tag } from "./types";

const STORAGE_KEY = "kanbanned-data";

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];

// Schema-based normalization
type FieldDef<T> = {
  check: (v: unknown) => v is T;
  fallback: T;
};

type Schema = Record<string, FieldDef<unknown>>;

function normalize<T extends { id: string }>(
  raw: { id: string },
  schema: Schema,
  extra: Partial<T> = {}
): { result: T; recovered: boolean } {
  const obj = raw as Record<string, unknown>;
  const result: Record<string, unknown> = { id: raw.id, ...extra };
  let recovered = false;

  for (const [key, def] of Object.entries(schema)) {
    if (def.check(obj[key])) {
      result[key] = obj[key];
    } else {
      result[key] = def.fallback;
      recovered = true;
    }
  }

  return { result: result as T, recovered };
}

// Type checkers
const isString = (v: unknown): v is string => typeof v === "string";
const isOptionalString = (v: unknown): v is string | undefined =>
  v === undefined || typeof v === "string";
const isValidPriority = (v: unknown): v is Priority =>
  typeof v === "string" && VALID_PRIORITIES.includes(v as Priority);

// Schemas define valid fields and their fallback values
const cardSchema: Schema = {
  title: { check: isString, fallback: "Untitled" },
  description: { check: isString, fallback: "" },
  priority: { check: isValidPriority, fallback: "medium" as Priority },
  tagId: { check: isOptionalString, fallback: undefined },
};

const columnSchema: Schema = {
  name: { check: isString, fallback: "Untitled Column" },
};

const boardSchema: Schema = {
  name: { check: isString, fallback: "Untitled Board" },
  emoji: { check: isOptionalString, fallback: undefined },
};

// Helpers
function hasId(obj: unknown): obj is { id: string } {
  return typeof obj === "object" && obj !== null && typeof (obj as Record<string, unknown>).id === "string";
}

function getArray(obj: unknown, field: string): unknown[] | null {
  if (typeof obj !== "object" || obj === null) return null;
  const arr = (obj as Record<string, unknown>)[field];
  return Array.isArray(arr) ? arr : null;
}

function isValidAppDataStructure(data: unknown): data is { version: number; boards: unknown[] } {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.version === "number" && Array.isArray(d.boards);
}

export type LoadResult = {
  data: AppData;
  discarded: {
    cards: number;
    columns: number;
    boards: number;
  };
  recovered: {
    cards: number;
    columns: number;
    boards: number;
  };
  usedDefaults: boolean;
};

// Sanitize data by keeping valid items and discarding invalid ones
function sanitizeAppData(raw: unknown): LoadResult {
  const discarded = { cards: 0, columns: 0, boards: 0 };
  const recovered = { cards: 0, columns: 0, boards: 0 };

  if (!isValidAppDataStructure(raw)) {
    return { data: defaultAppData, discarded, recovered, usedDefaults: true };
  }

  const validBoards: BoardData[] = [];

  for (const rawBoard of raw.boards) {
    if (!hasId(rawBoard)) {
      discarded.boards++;
      continue;
    }

    const rawColumns = getArray(rawBoard, "columns");
    const validColumns: ColumnData[] = [];

    // Missing columns array counts as recovery
    if (!rawColumns) {
      recovered.boards++;
    }

    for (const rawColumn of rawColumns ?? []) {
      if (!hasId(rawColumn)) {
        discarded.columns++;
        continue;
      }

      const rawCards = getArray(rawColumn, "cards");
      const validCards: CardData[] = [];

      // Missing cards array counts as recovery
      if (!rawCards) {
        recovered.columns++;
      }

      for (const rawCard of rawCards ?? []) {
        if (!hasId(rawCard)) {
          discarded.cards++;
          continue;
        }

        const card = normalize<CardData>(rawCard, cardSchema);
        validCards.push(card.result);
        if (card.recovered) recovered.cards++;
      }

      const col = normalize<ColumnData>(rawColumn, columnSchema, { cards: validCards });
      validColumns.push(col.result);
      if (col.recovered) recovered.columns++;
    }

    // Validate tags array
    const rawTags = getArray(rawBoard, "tags");
    const validTags: Tag[] = [];
    for (const rawTag of rawTags ?? []) {
      if (
        hasId(rawTag) &&
        typeof (rawTag as Record<string, unknown>).name === "string" &&
        typeof (rawTag as Record<string, unknown>).color === "string"
      ) {
        validTags.push(rawTag as Tag);
      }
    }

    const board = normalize<BoardData>(rawBoard, boardSchema, { columns: validColumns, tags: validTags });
    validBoards.push(board.result);
    if (board.recovered) recovered.boards++;
  }

  if (validBoards.length === 0) {
    return { data: defaultAppData, discarded, recovered, usedDefaults: true };
  }

  return {
    data: { version: raw.version, boards: validBoards },
    discarded,
    recovered,
    usedDefaults: false,
  };
}

export const defaultBoard: BoardData = {
  id: "default-board",
  name: "kanbanned.com",
  emoji: "🦀",
  tags: [
    { id: "tag-bug", name: "bug", color: "#ef4444" },
    { id: "tag-chore", name: "chore", color: "#8b5cf6" },
  ],
  columns: [
    {
      id: "col-todo",
      name: "To Do",
      cards: [
        {
          id: "card-3",
          title: "Read the documentation",
          description: "Just kidding, Stack Overflow it is",
          priority: "low",
        },
        {
          id: "card-1",
          title: "Fix bug that only happens on Fridays",
          description: "It works on my machine, I swear",
          priority: "high",
          tagId: "tag-bug",
        },
        {
          id: "card-2",
          title: "Delete node_modules and pray",
          description: "The ancient ritual of JavaScript developers",
          priority: "medium",
          tagId: "tag-chore",
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
          tagId: "tag-bug",
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

export function loadAppData(): LoadResult {
  if (typeof window === "undefined") {
    return { data: defaultAppData, discarded: { cards: 0, columns: 0, boards: 0 }, recovered: { cards: 0, columns: 0, boards: 0 }, usedDefaults: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { data: defaultAppData, discarded: { cards: 0, columns: 0, boards: 0 }, recovered: { cards: 0, columns: 0, boards: 0 }, usedDefaults: false };
    }
    const parsed = JSON.parse(stored);
    return sanitizeAppData(parsed);
  } catch (error) {
    console.error("Failed to load app data:", error);
    return { data: defaultAppData, discarded: { cards: 0, columns: 0, boards: 0 }, recovered: { cards: 0, columns: 0, boards: 0 }, usedDefaults: true };
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

// Debounced save implementation
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingData: AppData | null = null;
let pendingCallback: ((result: SaveResult) => void) | null = null;

export function saveAppDataDebounced(
  data: AppData,
  onComplete?: (result: SaveResult) => void,
  delay: number = 300
): void {
  pendingData = data;
  if (onComplete) {
    pendingCallback = onComplete;
  }

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    if (pendingData) {
      const result = saveAppData(pendingData);
      if (pendingCallback) {
        pendingCallback(result);
      }
      pendingData = null;
      pendingCallback = null;
    }
    saveTimeout = null;
  }, delay);
}

// Flush any pending debounced save immediately
export function flushPendingSave(): SaveResult | null {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  if (pendingData) {
    const result = saveAppData(pendingData);
    if (pendingCallback) {
      pendingCallback(result);
    }
    pendingData = null;
    pendingCallback = null;
    return result;
  }
  return null;
}

// Generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
