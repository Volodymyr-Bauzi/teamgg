'use client';

import {useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import styles from '../styles/GamePage.module.css';
import {games} from '../data/games';
import ApplicationList from '../../components/applications/ApplicationList';
import FilterForm from '../../components/filters/FilterForm';
import {FilterProvider} from '../context/FilterContext';
import {useSession} from 'next-auth/react';
import {useGameStore} from '@/lib/stores/use-game-store';

export default function GamePage() {
  const {game} = useParams();
  const gameConfig = games.find((g) => g.id === game);
  const router = useRouter();
  const {status} = useSession();
  const setGameId = useGameStore((state) => state.setGameId);
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    if (typeof game === 'string') {
      setGameId(game);
    }
  }, [game, setGameId]);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  const handleStartApplication = () => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else {
      router.push(`/${game}/application`);
    }
  };

  return (
    <FilterProvider>
      <div className={styles.container}>
        <aside className={styles.leftSidebar}>
          <FilterForm gameId={game as string} />
        </aside>
        <section className={styles.content}>
          <h2>{gameConfig?.name} – Applications</h2>
          <ApplicationList gameId={game as string} />
        </section>
        <aside className={styles.rightSidebar}>
          <button
            onClick={handleStartApplication}
            className={styles.startApplicationButton}
          >
            Start Application
          </button>
        </aside>
      </div>
    </FilterProvider>
  );
}
