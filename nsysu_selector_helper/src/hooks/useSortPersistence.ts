import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSortConfig, setSortConfig } from '@/store';
import { CourseSortingService } from '@/services';

/**
 * Sync sort configuration with localStorage
 */
export const useSortPersistence = () => {
  const dispatch = useAppDispatch();
  const sortConfig = useAppSelector(selectSortConfig);
  const initialized = useRef(false);

  // Load saved sort config on mount
  useEffect(() => {
    const savedConfig = CourseSortingService.loadSortConfig();
    dispatch(setSortConfig(savedConfig));
    initialized.current = true;
  }, [dispatch]);

  // Save whenever sortConfig changes after initial load
  useEffect(() => {
    if (initialized.current) {
      CourseSortingService.saveSortConfig(sortConfig);
    }
  }, [sortConfig]);
};
