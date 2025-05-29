// lib/auth.ts
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/api/auth/[...nextauth]/route'; // adjust path

export function getAuthSession() {
  return getServerSession(authOptions);
}
