export interface Application {
  id: number;
  gameId: string;
  user: string;
  contacts: string[];
  tags: Record<string, string>;
  createdAt?: string;
}
