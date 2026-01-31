export type Priority = "low" | "medium" | "high";

export interface CardData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
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
}

export interface AppData {
  version: number;
  boards: BoardData[];
}
