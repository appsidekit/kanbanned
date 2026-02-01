export type Priority = "low" | "medium" | "high";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

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
