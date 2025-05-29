'use client';

import {useParams} from 'next/navigation';
import {useSession} from 'next-auth/react';
import ApplicationForm from '@/components/applications/ApplicationForm';
import styles from '@/app/styles/GamePage.module.css';

export default function ApplicationFormPage() {
  const {game} = useParams();
  const {status} = useSession();

  if (status === 'loading') {
    return <p>Loading session...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>You must be signed in to submit an application.</p>;
  }

  return (
    <div className={styles.content}>
      <h2>Submit Application</h2>
      <ApplicationForm gameId={game as string} />
    </div>
  );
}
