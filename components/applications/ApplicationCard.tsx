// app/components/applications/ApplicationCard.tsx
import {useEffect, useState} from 'react';
import {trpc} from '@/lib/trpc/client';
import {toast} from 'react-hot-toast';
import type {TRPCClientError} from '@trpc/client';

interface ApplicationCardProps {
  application: {
    id: string;
    user: string;
    contact: string;
    tags: Record<string, unknown>;
  };
}

export default function ApplicationCard({application}: ApplicationCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    const flag = localStorage.getItem('admin');
    setIsAdmin(flag === 'true');
  }, []);

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

  return (
    <div className="application-card">
      <p>
        <strong>{application.user}</strong>: {application.contact}
      </p>
      <ul>
        {Object.entries(application.tags).map(([k, v]) => (
          <li key={k}>
            {k}: {String(v)}
          </li>
        ))}
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
