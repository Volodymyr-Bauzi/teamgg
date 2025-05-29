'use client';

import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface Game {
  id: string;
  name: string;
  image: string;
  tag?: string;
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
