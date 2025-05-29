// app/components/applications/ApplicationList.tsx

import {useFilterContext} from '@/app/context/FilterContext';
import styles from '@app/styles/GamePage.module.css';
import ApplicationCard from './ApplicationCard';
import {useState} from 'react';
import Pagination from '../Pagination';
import {trpc} from '@/lib/trpc/client';

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

  const filtered = data.items.filter((app) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return app.tags?.[key as keyof typeof app.tags] === value;
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
      {filtered.length === 0 && (
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
