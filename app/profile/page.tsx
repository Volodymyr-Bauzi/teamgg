'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { FileUploadModal } from '@/components/ui/FileUploadModal';
import { EditableAvatar } from '@/components/ui/EditableAvatar';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const { data: sessionData, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  // Create a preview URL for the selected image
  const handleFileSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Here you would typically upload the file to your server
    // and update the user's profile picture URL
    uploadProfilePicture(file);
  }, []);

  const uploadProfilePicture = async (file: File) => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Replace this with your actual API endpoint
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update the session with the new image URL
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.url,
        },
      });
      
      // Clear the preview URL after successful upload
      setPreviewUrl('');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              onChange={(file) => {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                setIsUploadModalOpen(true);
              }}
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
              onClick={() => setIsUploadModalOpen(true)}
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

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileSelect={handleFileSelect}
        accept="image/*"
        maxSizeMB={5}
      />
    </div>
  );
}
