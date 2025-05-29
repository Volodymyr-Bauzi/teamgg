import {signIn, signOut, useSession} from 'next-auth/react';

export default function LoginButton() {
  const {data: session, status} = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <button onClick={() => signIn('discord')}>Sign in with Discord.</button>
    );
  }

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
}
