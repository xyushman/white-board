export type BoardSummary = {
  id: string;
  title: string;
  thumbnail: string | null;
  favorited: boolean;
  archived: boolean;
  deleted: boolean;
  trashed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BoardData = {
  id: string;
  title: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
  thumbnail: string | null;
  shareToken: string | null;
  favorited: boolean;
  updatedAt: string;
};

