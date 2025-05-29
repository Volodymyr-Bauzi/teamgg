import {Session} from 'next-auth';
import {db} from '@/lib/db';

export type Context = {
  session: Session | null;
  headers: Headers;
  db: typeof db;
  user?: Session['user'];
};
