// app/components/GameList.tsx
'use client';

import Link from 'next/link';
import styles from '../app/styles/Home.module.css';

interface Game {
  id: string;
  name: string;
}

export default function GameList({games}: {games: Game[]}) {
  return (
    <div className={styles.grid}>
      {games.map((game) => (
        <Link key={game.id} href={`/${game.id}`}>
          <div className={styles.card}>{game.name}</div>
        </Link>
      ))}
    </div>
  );
}
