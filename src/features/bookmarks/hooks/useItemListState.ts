'use client';

import { mainStore } from '@/store/mainStore';
import { useUrlState } from './useUrlState';
import { TagFilterType } from '@/lib/types';

export const useItemListState = () => {
  const { setUrlState } = useUrlState();
  const store = mainStore;

  const setTagFilter = (tagFilter: TagFilterType, skipURLUpdate = false) => {
    store.setTagFilter(tagFilter);

    if (skipURLUpdate) {
      return;
    }

    setUrlState({
      tag: tagFilter,
      // Preventing race conditions
      page: 1,
    });
  };

  return {
    setTagFilter,
  };
};
