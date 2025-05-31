'use client';

import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Moon, Sun} from 'lucide-react';
import {useSession, signIn, signOut} from 'next-auth/react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

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
    <div className="header">
      <div className="header-container">
        <h1 onClick={navigateHome} style={{ cursor: 'pointer' }}>Team GG</h1>
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
