'use client';

import styles from './styles/Home.module.css';
import GameList from './components/GameList';
import {games} from './data/games';

export default function Home() {
  return (
    <main className={styles.container}>
      <h1>Choose a Game</h1>
      <GameList games={games} />
    </main>
  );
}
