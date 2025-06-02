'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {gameFilterConfig} from '../../app/utils/gameFilterConfig';
import {trpc} from '@/lib/trpc/client';
import {toast} from 'sonner';
import styles from './ApplicationForm.module.css';

export default function ApplicationForm() {
  // All hooks must be called unconditionally at the top level
  const params = useParams();
  const gameId = params?.game as string;
  const [isLoading, setIsLoading] = useState(true);
  interface FormDataState extends Record<string, any> {
    [key: string]: string | string[] | boolean | undefined;
  }

  const [formData, setFormData] = useState<FormDataState>({});
  const [contact, setContact] = useState('');
  const { data: session } = useSession();
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

  useEffect(() => {
    if (gameId) {
      setIsLoading(false);
    }
  }, [gameId]);

  // Early returns after all hooks
  if (isLoading) {
    return <div className={styles.loadingMessage}>Loading game data...</div>;
  }

  if (!gameId) {
    return <div className={styles.errorMessage}>Game ID not found in URL.</div>;
  }

  const config = gameFilterConfig[gameId];
  if (!config) {
    return (
      <div className={styles.errorMessage}>
        Configuration not found for this game. Please try another game.
      </div>
    );
  }

  const handleChange = (key: string, value: string | string[]) => {
    setFormData((prev) => ({...prev, [key]: value}));
  };

  const handleMultiSelectChange = (key: string, selected: string[]) => {
    setFormData(prev => {
      const newState = { ...prev };
      newState[key] = selected;
      newState[`${key}Open`] = false; // Close dropdown after selection
      return newState;
    });
  };

  const toggleDropdown = (key: string) => {
    setFormData(prev => {
      const isOpen = !!prev[`${key}Open`];
      return { ...prev, [`${key}Open`]: !isOpen };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to strings for the API
    const tags: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      // Skip UI state fields (those ending with 'Open')
      if (key.endsWith('Open')) return;
      
      if (Array.isArray(value)) {
        tags[key] = value.join(', '); // Convert array to comma-separated string
      } else if (value !== undefined) {
        tags[key] = String(value); // Convert other values to string
      }
    });

    if (!session?.user?.id) {
      toast.error('You must be logged in to submit an application');
      return;
    }

    createApp.mutate({
      gameId,
      contact,
      tags,
      userId: session.user.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.applicationForm}>
      <h3 className={styles.formTitle}>Leave an Application</h3>
      {config.fields.map((field) => (
        <div key={field.key} className={styles.formField}>
          <label className={styles.fieldLabel}>
            {field.label}
            {field.optional && (
              <span className={styles.optionalText}>(optional)</span>
            )}
          </label>
          {field.type === 'select' ? (
            <select
              className={`${styles.fieldSelect} ${styles.fullWidth}`}
              value={(formData[field.key] as string) || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required={!field.optional}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === 'multi-select' ? (
            <div className={styles.multiSelect}>
              <div 
                className={styles.multiSelectControl}
                onClick={() => toggleDropdown(field.key)}
              >
                <div className={styles.multiSelectValue}>
                  {Array.isArray(formData[field.key]) && (formData[field.key] as string[]).length > 0 
                    ? (formData[field.key] as string[]).join(', ')
                    : `Select ${field.label.toLowerCase()}`}
                </div>
                <svg 
                  className={`${styles.multiSelectArrow} ${formData[`${field.key}Open`] ? styles.isOpen : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  width="16"
                  height="16"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {formData[`${field.key}Open`] && (
                <div className={styles.multiSelectDropdown}>
                  {field.options?.map((opt) => {
                    const isSelected = Array.isArray(formData[field.key]) && (formData[field.key] as string[]).includes(opt);
                    return (
                      <div 
                        key={opt} 
                        className={`${styles.multiSelectOption} ${isSelected ? styles.isSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentValues = Array.isArray(formData[field.key]) ? [...(formData[field.key] as string[])] : [];
                          const newValues = isSelected
                            ? currentValues.filter(v => v !== opt)
                            : [...currentValues, opt];
                          
                          handleMultiSelectChange(field.key, newValues);
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          className={styles.multiSelectCheckbox}
                        />
                        {opt}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              className={`${styles.fieldInput} ${styles.fullWidth}`}
              value={(formData[field.key] as string) || ''}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required={!field.optional}
            />
          )}
        </div>
      ))}
      <div className={styles.contactField}>
        <label className={styles.fieldLabel}>
          Contact Info (Discord, Steam, etc):
        </label>
        <input
          type="text"
          className={styles.fieldInput}
          value={contact}
          placeholder="Enter your contact info"
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={createApp.status === 'pending'}
        className={`${styles.submitButton} ${
          createApp.status === 'pending' ? styles.submitting : ''
        }`}
      >
        {createApp.status === 'pending' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
