// Create button component for my project
'use client';

import {ButtonHTMLAttributes, forwardRef} from 'react';

const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({className, ...props}, ref) => {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export {Button};
