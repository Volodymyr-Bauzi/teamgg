'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Crop, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './FileUploadModal.module.css';
import { ImageCropper } from './ImageCropper';
import debounce from 'lodash/debounce';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File, croppedUrl: string) => void;
  previewUrl?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
  isLoading?: boolean;
}

export const UploadModal = ({
  isOpen,
  onClose,
  onSave,
  previewUrl: initialPreviewUrl,
  maxSizeMB = 5,
  aspectRatio = 1,
  isLoading = false,
}: UploadModalProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const createAndTrackBlobUrl = useCallback((blob: Blob): string => {
    if (!blob) throw new Error('createAndTrackBlobUrl requires a valid blob');
    const url = URL.createObjectURL(blob);
    return url;
  }, []);

  useEffect(() => {
    const revokeUrl = (url: string) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };

    return () => {
      revokeUrl(previewUrl || '');
      revokeUrl(croppedImage || '');
    };
  }, [previewUrl, croppedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > maxSizeMB * 1024 * 1024) return;

    const url = createAndTrackBlobUrl(file);
    setPreviewUrl(url);
    setCroppedImage(null);
    setIsCropping(true);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = () => setIsCropping(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsCropping(true);
    if (e.dataTransfer.files?.length) {
      await handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const getCroppedImg = useCallback((src: string, pixelCrop: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!src || !pixelCrop) {
        reject(new Error('Invalid parameters'));
        return;
      }
  
      // If src is a blob URL that's been revoked, reject immediately
      if (src.startsWith('blob:') && !URL.createObjectURL) {
        reject(new Error('Blob URL no longer valid'));
        return;
      }
  
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }
  
          canvas.width = pixelCrop.width;
          canvas.height = pixelCrop.height;
          
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
          );
  
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const url = createAndTrackBlobUrl(blob);
            resolve(url);
          }, 'image/jpeg', 0.9);
        } catch (err) {
          reject(err);
        }
      };
  
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
  
      // Set src last to ensure event handlers are in place
      image.src = src;
    });
  }, [createAndTrackBlobUrl]);

  const handleCropComplete = useCallback(
    debounce(async (_: any, croppedPixels: any) => {
      if (!croppedPixels || !previewUrl) return;
      
      try {
        const croppedUrl = await getCroppedImg(previewUrl, croppedPixels);
        setCroppedImage(croppedUrl);
      } catch (err) {
        console.error('Error during crop:', err);
        // Don't set error state for crop operations to avoid UI flickering
      }
    }, 300), // 300ms debounce time
    [previewUrl, getCroppedImg]
  );

  useEffect(() => {
    return () => {
      // Cleanup debounced function
      handleCropComplete.cancel?.();
    };
  }, [handleCropComplete]);
  

  const handleSave = async () => {
    if (!croppedImage || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], previewUrl!.split('/').pop()!, {
        type: blob.type || 'image/jpeg',
      });
      onSave(file, croppedImage);
    } catch (err) {
      console.error('Error saving cropped image:', err);
      setError('Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelCropping = () => setIsCropping(false);

  const handleStartCropping = () => setIsCropping(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleClose = () => {
    setPreviewUrl(null);
    setCroppedImage(null);
    setIsCropping(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Upload Profile Picture</h3>
          <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div
          className={styles.modalBody}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className={styles.fileInput}
          />

          {isCropping && previewUrl ? (
            <div className={styles.cropperWrapper}>
              <ImageCropper
                image={previewUrl}
                aspect={aspectRatio}
                onCropComplete={handleCropComplete}
                onCancel={handleCancelCropping}
                onSave={handleSave}
              /> 
            </div>
          ) : (
            <>
              <div className={styles.dropZone} onClick={handleClick}>
                {previewUrl ? (
                  <div className={styles.previewContainer}>
                    <img src={croppedImage || previewUrl} alt="Preview" className={styles.previewImage} />
                  </div>
                ) : (
                  <div className={styles.dropZoneContent}>
                    <Upload size={48} className={styles.uploadIcon} />
                    <h3 className={styles.title}>Drag and drop your image here</h3>
                    <p className={styles.description}>or click to browse files</p>
                    <p className={styles.smallText}>Supports JPG, PNG up to {maxSizeMB}MB</p>
                  </div>
                )}
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              {previewUrl && (
                <div className={styles.actions}>
                  <Button onClick={handleClose}>Cancel</Button>
                  <div className={styles.actionGroup}>
                    <Button onClick={handleStartCropping} className={styles.cropButton}>
                      <Crop size={16} />
                      <span>Adjust</span>
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isLoading || isSaving} 
                      className={styles.uploadButton}
                    >
                      {isLoading || isSaving ? 'Saving...' : 'Save Picture'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
