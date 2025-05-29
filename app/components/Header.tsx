'use client';

import {useState} from 'react';
import LoginButton from './LoginButton';

const Header = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
    document.documentElement.classList.toggle('dark', !isDarkTheme);
  };

  return (
    <div className="header">
      <h1>Team GG</h1>
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-button">
          {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
        </button>
        <LoginButton />
      </div>
    </div>
  );
};
export default Header;
