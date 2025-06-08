import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectFilterConditions,
  selectSelectedTimeSlots,
  setFilterConditions,
  setSelectedTimeSlots,
} from '@/store';
import { FilterPersistenceService } from '@/services';

/**
 * Sync filter conditions and time slot filters with localStorage
 */
export const useFilterPersistence = () => {
  const dispatch = useAppDispatch();
  const filterConditions = useAppSelector(selectFilterConditions);
  const selectedTimeSlots = useAppSelector(selectSelectedTimeSlots);

  // Load saved state on mount
  useEffect(() => {
    const { conditions, timeSlots } = FilterPersistenceService.loadFilters();
    if (conditions.length > 0) {
      dispatch(setFilterConditions(conditions));
    }
    if (timeSlots.length > 0) {
      dispatch(setSelectedTimeSlots(timeSlots));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save whenever state changes
  useEffect(() => {
    FilterPersistenceService.saveFilters(filterConditions, selectedTimeSlots);
  }, [filterConditions, selectedTimeSlots]);
};

