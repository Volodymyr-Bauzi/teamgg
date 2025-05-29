import {prisma} from '@/lib/db';

export async function createContext() {
  return {
    db: prisma,
  };
}
export type Context = ReturnType<typeof createContext>;
