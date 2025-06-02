'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useCallback, useEffect } from 'react';
import { UploadModal } from '@/components/ui/FileUploadModal';
import { EditableAvatar } from '@/components/ui/EditableAvatar';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sessionData, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  // Create a preview URL for the selected image
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(async (file: File, croppedImageUrl: string) => {
    if (!file || !session) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update the preview URL with the cropped version
      setPreviewUrl(croppedImageUrl);
      
      // Update the user's profile with the new image URL
      await update({
        ...session,
        user: {
          ...session.user,
          image: data.url,
        },
      });
      
      // Update the preview URL with the cropped version
      setPreviewUrl(croppedImageUrl);
      
      // Show success message
      if (typeof window !== 'undefined') {
        const { toast } = await import('react-hot-toast');
        toast.success('Profile picture updated successfully');
      }
      
      // Close the modal
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [session, update]);
  
  // Clean up object URLs when component unmounts or previewUrl changes
  useEffect(() => {
    const currentPreviewUrl = previewUrl;
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [previewUrl]);

  if (status === 'loading' || !sessionData) {
    return <div>Loading...</div>;
  }

  const user = sessionData.user;
  const avatarUrl = previewUrl || user?.image || '';

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <EditableAvatar
              src={avatarUrl}
              alt={user?.name || 'User'}
              size="lg"
              onChange={handleFileSelect}
            />
          </div>
          <div className={styles.userInfo}>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Account Settings</h2>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.button}
              onClick={() => setIsModalOpen(true)}
            >
              Change Profile Picture
            </button>
            <button className={styles.button}>
              Edit Profile
            </button>
            <button 
              className={`${styles.button} ${styles.dangerButton}`}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </button>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl('');
          setSelectedFile(null);
          setIsModalOpen(false);
        }}
        onSave={handleSave}
        previewUrl={previewUrl}
        maxSizeMB={5}
        aspectRatio={1}
        isLoading={isUploading}
      />
    </div>
  );
}
