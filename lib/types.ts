export type Priority = "low" | "medium" | "high";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

export interface CardData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tagId?: string;
}

export interface ColumnData {
  id: string;
  name: string;
  cards: CardData[];
}

export interface BoardData {
  id: string;
  name: string;
  emoji?: string;
  columns: ColumnData[];
  tags: Tag[];
}

export interface AppData {
  version: number;
  boards: BoardData[];
}
