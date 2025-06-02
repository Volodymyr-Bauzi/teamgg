// app/components/applications/ApplicationList.tsx

import {useFilterContext} from '@/app/context/FilterContext';
import styles from '@app/styles/GamePage.module.css';
import ApplicationCard from './ApplicationCard';
import {useState} from 'react';
import Pagination from '../Pagination';
import {trpc} from '@/lib/trpc/client';
import type { JsonValue } from '@prisma/client/runtime/library';

type ApplicationWithUser = {
  id: string;
  userId: string;
  contact: string;
  tags: JsonValue;
  gameId: string;
  createdAt: Date;
};

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

const ITEMS_PER_PAGE = 10; // Pagination limit, can be adjusted

export default function ApplicationList({gameId}: {gameId: string}) {
  const {filters} = useFilterContext();
  const [page, setPage] = useState(1);

  const {data, isLoading, isError} = trpc.application.list.useQuery({
    gameId,
    page,
    limit: ITEMS_PER_PAGE,
  });

  if (isLoading) {
    return <p className={styles.loading}>Loading applications...</p>;
  }

  if (isError || !data) {
    console.error('Failed to load applications:', isError);
    return (
      <p className={styles.error}>
        Failed to load applications. Please try again later.
      </p>
    );
  }

  // Cast the items to ApplicationWithUser[] to handle the tags type
  const applications = data.items as unknown as ApplicationWithUser[];
  
  const filtered = applications.filter((app) => {
    const tags = normalizeTags(app.tags);
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return tags[key] === value;
    });
  });

  return (
    <div className={styles.appList}>
      {data.totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
      {filtered.length > 0 ? (
        filtered.map((app) => (
          <div key={app.id} className={styles.applicationCard}>
            <ApplicationCard application={app} />
          </div>
        ))
      ) : (
        <p className={styles.noApplications}>No matching teammates found.</p>
      )}
      {data.totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
