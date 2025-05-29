'use client';

import {useSession, signIn, signOut} from 'next-auth/react';

export default function AuthStatus() {
  const {data: session, status} = useSession();

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    return (
      <button onClick={() => signIn('discord')}>Sign in with Discord</button>
    );
  }

  return (
    <div>
      <p>Signed in as {session.user?.name}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
