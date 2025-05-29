// /lib/trpc/context.ts

import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/api/auth/[...nextauth]/route'; // adjust path as needed
import {db} from '@/lib/db';
import {type NextRequest} from 'next/server';
import {type Session} from 'next-auth';

export type Context = {
  session: Session | null;
  db: typeof db;
  headers: Headers;
  user?: Session['user'];
};

export async function createContext(opts: {req: Request}): Promise<Context> {
  const session = await getServerSession(authOptions);
  return {
    session,
    db,
    headers: opts.req.headers,
    user: session?.user,
  };
}
