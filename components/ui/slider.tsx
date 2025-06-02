'use client';

import * as React from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = '',
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(value[0]);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);

  // Update internal value when prop changes
  React.useEffect(() => {
    setInternalValue(value[0]);
  }, [value[0]]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    updateValueFromEvent(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || disabled) return;
    updateValueFromEvent(e as unknown as React.MouseEvent);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    updateValueFromEvent(e);
  };

  const updateValueFromEvent = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    let newValue = ((e.clientX - rect.left) / rect.width) * (max - min) + min;
    
    // Clamp the value between min and max
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Apply step
    const steps = Math.round((newValue - min) / step);
    newValue = steps * step + min;
    
    setInternalValue(newValue);
    onChange?.([newValue]);
  };

  const percentage = ((internalValue - min) / (max - min)) * 100;
  
  return (
    <div 
      ref={sliderRef}
      className={`${styles.slider} ${className} ${disabled ? styles.disabled : ''}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={internalValue}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <div className={styles.track}>
        <div 
          className={styles.range} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div 
        className={styles.thumb}
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}
