'use client';

import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Moon, Sun} from 'lucide-react';
import {useSession, signIn, signOut} from 'next-auth/react';

const Header = () => {
  const [theme, setTheme] = useTheme();
  const {data: session} = useSession();

  return (
    <div className="header">
      <div className="header-container">
        <h1>Team GG</h1>
        <div className="theme-toggle">
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-button"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          {session ? (
            <Button variant="outline" onclick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
