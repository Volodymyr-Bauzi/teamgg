'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './CustomButton';
import { Slider } from './slider';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    onCropComplete(croppedArea, croppedAreaPixels);
  }, [onCropComplete]);

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
      <div className={styles.cropperContainer}>
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
