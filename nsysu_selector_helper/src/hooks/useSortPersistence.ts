import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectSortConfig } from '@/store';
import { CourseSortingService } from '@/services';

/**
 * Sync sort configuration with localStorage
 */
export const useSortPersistence = () => {
  const sortConfig = useAppSelector(selectSortConfig);

  useEffect(() => {
    CourseSortingService.saveSortConfig(sortConfig);
  }, [sortConfig]);
};
