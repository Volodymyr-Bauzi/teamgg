// app/components/applications/ApplicationCard.tsx
import {useEffect, useState} from 'react';

export default function ApplicationCard({application}: {application: any}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const flag = localStorage.getItem('admin');
    setIsAdmin(flag === 'true');
  }, []);

  const handleDelete = () => {
    const stored = localStorage.getItem('applications');
    const list = stored ? JSON.parse(stored) : [];
    const updated = list.filter((app: any) => app.id !== application.id);
    localStorage.setItem('applications', JSON.stringify(updated));
    window.location.reload();
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
        <button onClick={handleDelete} style={{color: 'red'}}>
          Delete
        </button>
      )}
    </div>
  );
}
