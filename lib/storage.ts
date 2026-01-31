import { AppData, BoardData } from "./types";

const STORAGE_KEY = "kanbanned-data";

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
    const parsed = JSON.parse(stored) as AppData;
    if (!parsed.boards || parsed.boards.length === 0) {
      return defaultAppData;
    }
    return parsed;
  } catch {
    return defaultAppData;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
