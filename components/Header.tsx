'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuItem } from './ui/DropdownMenu';
import Avatar from './ui/Avatar';
import styles from './Header.module.css';

const Header = () => {
  const router = useRouter();
  const {theme, setTheme} = useTheme();
  const {data: session} = useSession();
  const [isMounted, setIsMounted] = useState(false);

  const navigateHome = () => {
    router.push('/');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent flash of incorrect theme
  if (!isMounted) {
    return (
      <div className="header">
        <div className="header-container">
          <h1 onClick={navigateHome} style={{ cursor: 'pointer' }}>Team GG</h1>
          <div className="theme-toggle">
            <Button className="theme-button">
              <Sun />
            </Button>
            <Button disabled>Loading...</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title} onClick={navigateHome}>Team GG</h1>
        <div className={styles.controls}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={styles.themeButton}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          
          {session ? (
            <DropdownMenu
              trigger={
                <button className={styles.userButton} aria-label="User menu">
                  <Avatar 
                    src={session.user?.image || ''} 
                    alt={session.user?.name || 'User'}
                    size="md"
                  />
                </button>
              }
              align="right"
            >
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className={styles.menuIcon} />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile/settings')}>
                <Settings className={styles.menuIcon} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="danger"
              >
                <LogOut className={styles.menuIcon} />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
