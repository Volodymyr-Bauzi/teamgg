'use client';

import {useState} from 'react';
import {gameFilterConfig} from '../../app/utils/gameFilterConfig';
import {trpc} from '@/lib/trpc/client';
import {useSession} from 'next-auth/react';
import {useGameStore} from '@/lib/stores/use-game-store';

export default function ApplicationForm() {
  const gameId = useGameStore((state) => state.gameId);
  if (!gameId) return null;
  const config = gameFilterConfig[gameId];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [contact, setContact] = useState('');
  const mutation = trpc.application.create.useMutation();
  const utils = trpc.useUtils();

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({...prev, [key]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const application = {
      id: Date.now(),
      gameId,
      contact,
      tags: {...formData},
    };

    mutation.mutate(application, {
      onSuccess: () => {
        utils.application.list.invalidate();
        console.log('Application submitted successfully:', application);
        // Optionally reset form or show success message
        setFormData({});
        setContact('');
      },
      onError: (error) => {
        console.error('Error submitting application:', error);
        // Optionally show error message to user
      },
    });

    console.log('Submitting application:', application);
    // Later: POST to API
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Leave an Application</h3>
      {config.fields.map((field) => (
        <div key={field.key}>
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select onChange={(e) => handleChange(field.key, e.target.value)}>
              <option value="">Select</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
      <div>
        <label>Contact Info (Discord, Steam, etc):</label>
        <input type="text" onChange={(e) => setContact(e.target.value)} />
      </div>
      <button type="submit">
        {mutation.status === 'pending' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
