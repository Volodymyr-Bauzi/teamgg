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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: sessionData, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  // Create a preview URL for the selected image
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsUploadModalOpen(true);
  }, []);
  
  const handleUpload = useCallback(() => {
    if (selectedFile) {
      uploadProfilePicture(selectedFile);
      setIsUploadModalOpen(false);
    }
  }, [selectedFile]);

  const uploadProfilePicture = async (file: File) => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
        // Important: Don't set Content-Type header, let the browser set it with the boundary
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
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
      
      // Show success message (optional)
      // You can add a toast notification here if you have one
      console.log('Profile picture updated successfully');
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      setError(err.message || 'Failed to upload profile picture. Please try again.');
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
        onClose={() => {
          setIsUploadModalOpen(false);
          setPreviewUrl('');
          setSelectedFile(null);
        }}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        accept="image/*"
        maxSizeMB={5}
        previewUrl={previewUrl}
        isLoading={isLoading}
      />
    </div>
  );
}
