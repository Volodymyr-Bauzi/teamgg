// app/components/applications/ApplicationCard.tsx
import {useEffect, useState} from 'react';
import {trpc} from '@/lib/trpc/client';
import {toast} from 'react-hot-toast';
import Image from 'next/image';
import type { JsonValue } from '@prisma/client/runtime/library';

const normalizeTags = (tags: JsonValue): Record<string, unknown> => {
  try {
    if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
      return tags as Record<string, unknown>;
    }
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    return {};
  } catch (error) {
    console.error('Error normalizing tags:', error);
    return {};
  }
};

interface ApplicationCardProps {
  application: {
    id: string;
    userId: string;
    contact: string;
    tags: JsonValue;
    gameId: string;
    createdAt: Date;
  };
}

export default function ApplicationCard({application}: ApplicationCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{name?: string; image?: string} | null>(null);
  const utils = trpc.useUtils();

  // Fetch user data using TRPC
  const { data: userData, error: userError } = trpc.user.getById.useQuery(
    { id: application.userId },
    { enabled: !!application.userId }
  );

  useEffect(() => {
    if (userError) {
      console.error('Error fetching user:', userError);
    }
  }, [userError]);

  useEffect(() => {
    const flag = localStorage.getItem('admin');
    setIsAdmin(flag === 'true');
    
    if (userData) {
      setUser({
        name: userData.name || undefined,
        image: userData.image || undefined
      });
    }
  }, [application.userId, userData]);

  const deleteMutation = trpc.application.delete.useMutation({
    onSuccess: () => {
      toast.success('Application deleted successfully');
      // Invalidate the application list query to refresh the UI
      utils.application.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete application: ${error.message}`);
      console.error('Error deleting application:', error);
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate({id: application.id});
    }
  };

  // Safely handle tags
  const renderTags = () => {
    try {
      const tags = normalizeTags(application.tags);
      return Object.entries(tags).map(([k, v]) => (
        <li key={k}>
          {k}: {String(v)}
        </li>
      ));
    } catch (error) {
      console.error('Error rendering tags:', error);
      return null;
    }
  };

  return (
    <div className="application-card">
      <div className="flex items-center gap-3 mb-2">
        {user?.image && (
          <Image 
            src={user.image} 
            alt="User avatar" 
            width={32} 
            height={32} 
            className="rounded-full"
          />
        )}
        <p className="font-medium">
          {user?.name || 'Unknown User'}
        </p>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Contact: {application.contact}
      </p>
      <ul>
        {renderTags()}
      </ul>
      {isAdmin && (
        <button
          onClick={handleDelete}
          style={{color: 'red'}}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  );
}
