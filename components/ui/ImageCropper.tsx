'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './CustomButton';
import { Slider } from './slider';
import { ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react';
import styles from './ImageCropper.module.css';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onCancel: () => void;
  onSave: () => void;
  aspect?: number;
  shape?: 'rect' | 'round';
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  onSave,
  aspect = 1,
  shape = 'round',
  zoomSpeed = 0.1,
  minZoom = 1,
  maxZoom = 3,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    onCropComplete(croppedArea, croppedAreaPixels);
  }, [onCropComplete]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const x = e.clientX - startPos.x;
    const y = e.clientY - startPos.y;
    
    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const x = touch.clientX - startPos.x;
    const y = touch.clientY - startPos.y;
    setPosition({ x, y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add/remove event listeners for mouse and touch
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + zoomSpeed, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - zoomSpeed, minZoom));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.cropperContainer} ${isDragging ? styles.dragging : ''}`}
        ref={cropContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={styles.cropArea}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            cropShape={shape}
            showGrid={false}
            objectFit="contain"
            classes={{
              containerClassName: styles.cropper,
              mediaClassName: styles.media,
            }}
          />
        </div>
        <div className={styles.circleMask} />
        <div className={styles.dragHint}>
          <Move size={24} />
          <span>Drag to position</span>
        </div>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.zoomControls}>
          <Button 
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </Button>
          
          <Slider
            value={[zoom]}
            min={minZoom}
            max={maxZoom}
            step={0.1}
            onChange={(value) => setZoom(value[0])}
            className={styles.zoomSlider}
          />
          
          <Button 
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </Button>
          
          <Button 
            onClick={handleRotate}
            aria-label="Rotate"
          >
            <RotateCw size={20} />
          </Button>
        </div>
        
        <div className={styles.actionButtons}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
