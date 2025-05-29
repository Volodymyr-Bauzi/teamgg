'use client';

import {useState} from 'react';
import {gameFilterConfig} from '../../app/utils/gameFilterConfig';
import {trpc} from '@/lib/trpc/client';
import {useGameStore} from '@/lib/stores/use-game-store';
import {toast} from 'sonner';
import '../styles/ApplicationForm.css'; // Assuming you have a CSS file for styles

export default function ApplicationForm() {
  const gameId = useGameStore((state) => state.gameId);
  if (!gameId) return null;

  const config = gameFilterConfig[gameId];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [contact, setContact] = useState('');

  const utils = trpc.useUtils();
  const createApp = trpc.application.create.useMutation({
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      utils.application.list.invalidate();
      setFormData({});
      setContact('');
    },
    onError: (error) => {
      toast.error(`Error submitting application: ${error.message}`);
      console.error('Error submitting application:', error);
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({...prev, [key]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createApp.mutate({
      gameId,
      contact,
      tags: {...formData},
    });
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <h3 className="form-title">Leave an Application</h3>
      {config.fields.map((field) => (
        <div key={field.key} className="form-field">
          <label className="field-label">{field.label}</label>
          {field.type === 'select' ? (
            <select
              className="field-select"
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            >
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
              className="field-input"
              value={formData[field.key] || ''}
              placeholder={`Enter ${field.label}`}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="contact-field">
        <label className="field-label">
          Contact Info (Discord, Steam, etc):
        </label>
        <input
          type="text"
          className="field-input"
          value={contact}
          placeholder="Enter your contact info"
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={createApp.status === 'pending'}
        className={`submit-button ${
          createApp.status === 'pending' ? 'submitting' : ''
        }`}
      >
        {createApp.status === 'pending' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
