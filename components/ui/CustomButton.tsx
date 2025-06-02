import React from 'react';
import styles from './CustomButton.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    className = '',
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
