// types/index.ts
import {User} from 'next-auth';

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  genre: string[];
  rating: number;
}

export type SafeUser = Omit<User, 'id'> & {
  id: string;
};

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  success: boolean;
}
