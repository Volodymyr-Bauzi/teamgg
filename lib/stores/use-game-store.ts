// lib/stores/use-game-store.ts
import {create} from 'zustand';

interface GameStore {
  gameId: string | null;
  setGameId: (id: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameId: null,
  setGameId: (id) => set({gameId: id}),
  resetGame: () => set({gameId: null}),
}));
