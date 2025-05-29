'use client';

import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Moon, Sun} from 'lucide-react';
import {useSession, signIn, signOut} from 'next-auth/react';
import {useEffect, useState} from 'react';

const Header = () => {
  const {theme, setTheme} = useTheme();
  const {data: session} = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Prevents hydration mismatch by ensuring the component is mounted before rendering
    return null;
  }

  return (
    <div className="header">
      <div className="header-container">
        <h1>Team GG</h1>
        <div className="theme-toggle">
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-button"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          {session ? (
            <Button onClick={() => signOut()}>Sign Out</Button>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
