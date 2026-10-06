import { Routes } from '@/lib/routes';

export const API_ENDPOINTS = {
  items: {
    list: Routes.API.ITEMS,
    createItem: Routes.API.ITEMS,
    deleteItems: Routes.API.ITEMS_DELETE,
    refetchItemsMetadata: Routes.API.ITEMS_FETCH_METADATA,
    updateItemsTags: Routes.API.ITEMS_TAGS,
    updateItem: (id: number) => `${Routes.API.ITEMS}?item-id=${id}`,
  },
  settings: {
    preferences: Routes.API.SETTINGS_PREFERENCES,
  },
  tags: {
    list: Routes.API.TAGS,
    create: Routes.API.TAGS,
    deleteTag: (id: number, deleteBookmarks: boolean = false) =>
      `${Routes.API.TAGS}?tag-id=${id}${deleteBookmarks ? '&delete-bookmarks=true' : ''}`,
    update: (id: number) => `${Routes.API.TAGS_UPDATE}?tag-id=${id}`,
    updateColor: (id: number) => `${Routes.API.TAGS_UPDATE_COLOR}?tag-id=${id}`,
    updatePinned: (id: number) => `${Routes.API.TAGS_UPDATE_PINNED}?tag-id=${id}`,
    share: Routes.API.TAGS_SHARE,
  },
  url: {
    fetchMetadata: Routes.API.URL_METADATA,
    checkBroken: Routes.API.URL_CHECK,
  },
  importBookmarks: {
    browser: Routes.API.IMPORT,
  },
  exportBookmarks: Routes.API.EXPORT,
};
