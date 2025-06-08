import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCustomQuickFilters } from '@/store/selectors';
import { setCustomQuickFilters } from '@/store/slices/uiSlice';
import { CustomQuickFiltersService } from '@/services/customQuickFiltersService';

/**
 * Hook for managing custom quick filters with localStorage synchronization
 */
export const useCustomQuickFilters = () => {
  const dispatch = useAppDispatch();
  const customQuickFilters = useAppSelector(selectCustomQuickFilters);

  // Load custom filters from localStorage on mount
  useEffect(() => {
    const savedFilters = CustomQuickFiltersService.loadCustomFilters();
    dispatch(setCustomQuickFilters(savedFilters));
  }, [dispatch]);

  // Sync custom filters to localStorage whenever they change
  useEffect(() => {
    if (customQuickFilters.length > 0) {
      CustomQuickFiltersService.saveCustomFilters(customQuickFilters);
    }
  }, [customQuickFilters]);

  return {
    customQuickFilters,
    loadFilters: () => {
      const savedFilters = CustomQuickFiltersService.loadCustomFilters();
      dispatch(setCustomQuickFilters(savedFilters));
      return savedFilters;
    },
    getStorageStats: () => CustomQuickFiltersService.getStorageStats(),
  };
};
