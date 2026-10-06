import { makeAutoObservable, runInAction } from 'mobx';
import { toast } from 'sonner';
import { API_ENDPOINTS } from './api';
import { ItemType, TagFilterType, TagsObjectType, TagType, UserType } from '@/lib/types';
import { getCookie, safeDecodeURI } from '@/lib/utils';
import { preferencesStore } from './preferencesStore';
import { logger } from '@/lib/logger';

export interface LinkStatus {
  status: 'alive' | 'broken' | 'warning' | 'checking';
  statusCode?: number;
  error?: string;
  checkedAt?: number;
}

class MainStore {
  prefStore: typeof preferencesStore;
  items: ItemType[] = [];
  tags: TagsObjectType = {};
  user: UserType | null = null;
  isAuthRequired: boolean | null = null;
  isSetupRequired: boolean | null = null;
  tagFilter: TagFilterType = null; // Default to null for no tag selected. 'none' for without any tags
  isItemModalOpen: boolean = false;
  modalOpenItemID: number | null = null;
  appInfo: {
    installed_version: string | null;
    latest_version: string | null;
    update_available: boolean | null;
  } | null = null;
  keepBulkActionsToolbar = false;

  // Broken links checker state
  brokenLinkStatuses: Record<number, LinkStatus> = {};
  isCheckingBrokenLinks = false;
  hasInitialBrokenCheckRun = false;

  constructor(prefStore: typeof preferencesStore) {
    this.prefStore = prefStore;
    makeAutoObservable(this);
  }

  runRequest = (
    endpoint: string,
    method: string,
    bodyData: object | FormData,
    defaultErrorMessage: string,
    skipSuccessMessage: boolean = false,
    skipErrorMessage: boolean = false
  ) => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    const csrfToken = getCookie('CSRF-TOKEN');
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }

    const options: RequestInit = {
      method: method,
      headers: headers,
      signal: AbortSignal.timeout(15000),
    };

    if (!(bodyData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
    }

    return fetch(endpoint, options)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        if (response.status === 424) {
          this.setIsSetupRequired(true);
          this.setIsAuthRequired(false);
        } else if (response.status === 401) {
          this.setIsSetupRequired(false);
          this.setIsAuthRequired(true);
        }

        return response.text().then((text) => {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const data = JSON.parse(text);
            if (data?.message) errorMsg = data.message;
          } catch {
            // Text is not JSON
          }
          throw new Error(errorMsg);
        });
      })
      .then((data) => {
        if (typeof data?.message !== 'undefined' && !skipSuccessMessage) {
          toast.success(data.message, { position: 'top-center' });
        }
        return data;
      })
      .catch((reason) => {
        if (!skipErrorMessage) {
          toast.error(reason instanceof Error ? reason.message : defaultErrorMessage, {
            position: 'top-center',
          });
        }

        return null;
      });
  };

  setIsSetupRequired = (val: boolean) => {
    this.isSetupRequired = val;
  };
  setTagFilter = (val: TagFilterType) => {
    this.tagFilter = val;
  };

  get itemListFilters() {
    const tagFilter = this.tagFilter;
    const responseOutput = (val: any) => ({
      tags: val,
    });

    if (tagFilter === null || tagFilter === 'none') {
      return responseOutput(tagFilter);
    }

    if (!this.prefStore.includeNestedTagItems) {
      return responseOutput([tagFilter]);
    }

    const selectedTag = this.tags[tagFilter] ?? null;
    if (!selectedTag) {
      return responseOutput([tagFilter]);
    }

    const childTagIDs = this.tagsArray
      .filter((tag) => tag.fullPathIDs.startsWith(`${selectedTag.fullPathIDs}/`) && tag.id !== selectedTag.id)
      .map((tag) => tag.id);

    return responseOutput([selectedTag.id, ...childTagIDs]);
  }

  setUser = (user: UserType) => {
    this.user = user;
  };

  unsetUser = () => {
    this.user = null;
  };

  setTags = (tags: TagsObjectType) => {
    const renderTagSegment = (tag: TagType) => {
      let fullPath = '';
      let fullPathIDs = '';
      if (tag.parent !== 0) {
        const parentTag = tags[tag.parent];
        if (parentTag) {
          const paths = renderTagSegment(parentTag);
          fullPath += paths.fullPath + '/';
          fullPathIDs += paths.fullPathIDs + '/';
        }
      }
      fullPath += tag.title.replaceAll('/', '\\/');
      fullPathIDs += String(tag.id);
      return { fullPath, fullPathIDs };
    };

    const getRootCategoryColor = (t: TagType): string => {
      let current = t;
      while (current.parent !== 0 && tags[current.parent]) {
        current = tags[current.parent];
      }
      return current.color || '';
    };

    for (const tagID in tags) {
      const tag = tags[tagID];
      const { fullPath, fullPathIDs } = renderTagSegment(tag);
      tag.fullPath = fullPath;
      tag.fullPathIDs = fullPathIDs;
      tag.pinned = !!tag.pinned;
    }

    for (const tagID in tags) {
      const tag = tags[tagID];
      // Preserve individual tag color, only fallback to root category color if tag has no explicit color
      if (!tag.color) {
        tag.color = getRootCategoryColor(tag) || '';
      }
    }

    this.tags = tags as TagsObjectType;
  };

  get tagsArray() {
    const tagsArray = Object.values(this.tags) as TagType[];

    tagsArray.sort((a, b) => {
      return a.fullPath.localeCompare(b.fullPath);
    });

    return tagsArray;
  }

  setIsAuthRequired = (val: boolean) => {
    this.isAuthRequired = val;
  };

  fetchTags = async (): Promise<TagsObjectType | null> => {
    const data = await this.runRequest(API_ENDPOINTS.tags.list, 'GET', {}, 'Помилка завантаження тегів');
    if (data === null) {
      return null;
    }
    this.setTags(data);
    return data;
  };

  createTag = async (title: string): Promise<number | null> => {
    const response = await this.runRequest(API_ENDPOINTS.tags.create, 'POST', { title }, 'Помилка створення тегу');
    if (!response || !response.data?.tag_id) {
      return null;
    }
    await this.fetchTags();
    return response.data.tag_id;
  };

  createCategory = async (title: string, parentId: number = 0, color: string = ''): Promise<number | null> => {
    let fullTitle = title.trim();
    if (parentId !== 0 && this.tags[parentId]) {
      const parentPath = this.tags[parentId].fullPath;
      fullTitle = `${parentPath}/${fullTitle}`;
    }
    const tagId = await this.createTag(fullTitle);
    if (tagId && color) {
      await this.updateTagColor(tagId, color);
    }
    return tagId;
  };

  deleteTag = async (tagID: number, deleteBookmarks: boolean = false) => {
    const response = await this.runRequest(
      API_ENDPOINTS.tags.deleteTag(tagID, deleteBookmarks),
      'DELETE',
      {},
      'Помилка видалення тегу'
    );
    if (response === null) {
      return;
    }
    await this.fetchTags();
    await this.fetchItems();
  };

  updateTag = async (tagID: number, title: string, description: string, parent: number, color?: string) => {
    const response = await this.runRequest(
      API_ENDPOINTS.tags.update(tagID),
      'PATCH',
      {
        title,
        description,
        parent,
        ...(color !== undefined ? { color } : {}),
      },
      'Помилка оновлення тегу'
    );
    if (response === null) {
      return false;
    }
    await this.fetchTags();
    return true;
  };

  updateTagColor = async (tagID: number, color: string) => {
    const res = await this.runRequest(
      API_ENDPOINTS.tags.updateColor(tagID),
      'PATCH',
      { color },
      'Помилка оновлення кольору тегу'
    );
    if (res !== null) {
      await this.fetchTags();
    }
    return res;
  };

  updateTagPinned = async (tagID: number, pinned: boolean) => {
    const originalPinned = this.tags[tagID]?.pinned;
    runInAction(() => {
      if (this.tags[tagID]) {
        this.tags = {
          ...this.tags,
          [tagID]: { ...this.tags[tagID], pinned: Boolean(pinned) },
        };
      }
    });

    const res = await this.runRequest(
      API_ENDPOINTS.tags.updatePinned(tagID),
      'PATCH',
      { pinned },
      'Помилка оновлення закріплення тегу'
    );

    if (res === null && originalPinned !== undefined) {
      runInAction(() => {
        if (this.tags[tagID]) {
          this.tags = {
            ...this.tags,
            [tagID]: { ...this.tags[tagID], pinned: Boolean(originalPinned) },
          };
        }
      });
    }
    return res;
  };

  setTagShareId = (tagID: number, shareId: string | null) => {
    if (this.tags[tagID]) {
      runInAction(() => {
        this.tags = {
          ...this.tags,
          [tagID]: { ...this.tags[tagID], share_id: shareId ?? undefined },
        };
      });
    }
  };

  updateItemsTags = async ({
    itemIds,
    newSelectedTagsAll,
    newSelectedTagsSome,
  }: {
    itemIds: number[];
    newSelectedTagsAll: number[];
    newSelectedTagsSome: number[];
  }) => {
    // Optimistically update items in memory immediately for instantaneous UI response
    const keepTagsSet = new Set([...newSelectedTagsAll, ...newSelectedTagsSome]);
    runInAction(() => {
      this.items = this.items.map((item) => {
        if (item.id === undefined || !itemIds.includes(item.id)) return item;
        const filteredTags = (item.tags || []).filter((tid) => keepTagsSet.has(tid));
        const finalTags = Array.from(new Set([...filteredTags, ...newSelectedTagsAll]));
        return {
          ...item,
          tags: finalTags,
        };
      });
    });

    const response = await this.runRequest(
      API_ENDPOINTS.items.updateItemsTags,
      'PATCH',
      {
        itemIds,
        newSelectedTagsAll,
        newSelectedTagsSome,
      },
      'Помилка оновлення тегів'
    );
    if (response === null) {
      this.fetchItems();
      return false;
    }
    this.fetchItems();
    return true;
  };

  attachTagToItems = async (itemIds: number[], tagId: number) => {
    if (itemIds.length === 0) return true;

    // Optimistically attach tag to items in memory immediately
    runInAction(() => {
      this.items = this.items.map((item) => {
        if (item.id === undefined || !itemIds.includes(item.id)) return item;
        const currentTags = item.tags || [];
        if (currentTags.includes(tagId)) return item;
        return {
          ...item,
          tags: [...currentTags, tagId],
        };
      });
    });

    const response = await this.runRequest(
      API_ENDPOINTS.items.updateItemsTags,
      'PATCH',
      {
        itemIds,
        action: 'attach',
        attachTagIds: [tagId],
      },
      'Помилка додавання тегу до закладок',
      true
    );
    if (response === null) {
      await this.fetchItems();
      return false;
    }
    await this.fetchItems();
    await this.fetchTags();
    return true;
  };

  setItems = (val: ItemType[]) => {
    this.items = val;
  };
  openItemEditModal = (itemID: number) => {
    this.isItemModalOpen = true;
    this.modalOpenItemID = itemID;
  };
  openItemCreateModal = () => {
    this.isItemModalOpen = true;
    this.modalOpenItemID = null;
  };
  closeModal = () => {
    this.isItemModalOpen = false;
    this.modalOpenItemID = null;
  };
  setIsItemModalOpen = (val: boolean) => {
    this.isItemModalOpen = val;
  };
  fetchItems = async (): Promise<ItemType[] | null> => {
    const data = await this.runRequest(API_ENDPOINTS.items.list, 'GET', {}, 'Не вдалося завантажити закладки');
    if (data === null) {
      return null;
    }
    this.setItems(data);
    // Run light batch broken link check in the background if first load
    if (!this.hasInitialBrokenCheckRun && data.length > 0) {
      this.hasInitialBrokenCheckRun = true;
      setTimeout(() => {
        this.checkBrokenLinksBatch(false);
      }, 1500);
    }
    return data;
  };
  deleteItems = async (itemIDs: number[]) => {
    const response = await this.runRequest(
      API_ENDPOINTS.items.deleteItems,
      'DELETE',
      { itemIds: itemIDs },
      'Не вдалося видалити закладки'
    );
    if (!response) {
      return false;
    }
    return true;
  };
  refetchItemsMetadata = async (itemIDs: number[]) => {
    const response = await this.runRequest(
      API_ENDPOINTS.items.refetchItemsMetadata,
      'POST',
      { itemIds: itemIDs },
      'Не вдалося оновити метадані'
    );
    if (!response) {
      return false;
    }
    return true;
  };
  createItem = async (data: ItemType, skipSuccessMessage: boolean = false) => {
    data.url = encodeURI(safeDecodeURI(data.url || ''));
    data.image = encodeURI(safeDecodeURI(data.image || ''));

    const response = await this.runRequest(
      API_ENDPOINTS.items.createItem,
      'POST',
      data,
      'Не вдалося створити закладку',
      skipSuccessMessage
    );

    if (!response) {
      return false;
    }

    this.fetchTags();
    this.fetchItems();
    return true;
  };
  updateItem = async (data: ItemType, itemId: number, forceImageRefetch: boolean) => {
    data.url = encodeURI(safeDecodeURI(data.url || ''));
    data.image = encodeURI(safeDecodeURI(data.image || ''));

    const response = await this.runRequest(
      API_ENDPOINTS.items.updateItem(itemId),
      'PATCH',
      {
        ...data,
        ...{ 'force-image-refetch': forceImageRefetch },
      } as ItemType & { 'force-image-refetch': boolean },
      'Не вдалося оновити закладку'
    );
    if (!response) {
      return false;
    }

    this.fetchTags();
    this.fetchItems();
    return true;
  };

  importBrowserBookmarks = async (selectedFile: File) => {
    return await this.importBookmarks(
      selectedFile,
      'bookmark-file-html',
      API_ENDPOINTS.importBookmarks.browser,
      'Браузер'
    );
  };

  importRaindropIoBookmarks = async (selectedFile: File) => {
    return await this.importBookmarks(
      selectedFile,
      'bookmark-file-html',
      API_ENDPOINTS.importBookmarks.browser,
      'Raindrop.io'
    );
  };

  importBookmarks = async (
    selectedFile: File,
    inputName: string = 'file',
    endpointUrl: string = API_ENDPOINTS.importBookmarks.browser,
    importSourceName?: string,
    format: string = 'auto'
  ) => {
    const formData = new FormData();
    formData.append(inputName, selectedFile);
    formData.append('file', selectedFile);
    formData.append('format', format);
    if (importSourceName) {
      formData.append('import-source-name', importSourceName);
    }

    return await this.runRequest(endpointUrl, 'POST', formData, 'Не вдалося імпортувати закладки').then((response) => {
      if (response === null) {
        return false;
      }
      this.fetchItems();
      this.fetchTags();

      // Refresh items after background scraping populates images/descriptions
      setTimeout(() => {
        this.fetchItems();
      }, 2500);
      setTimeout(() => {
        this.fetchItems();
      }, 6000);

      return true;
    });
  };

  exportBookmarks = async (format: 'html' | 'json' | 'csv' = 'html') => {
    try {
      const url = `${API_ENDPOINTS.exportBookmarks}?format=${format}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Помилка при отриманні даних для експорту');
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `stashly-bookmarks-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Експорт (${format.toUpperCase()}) успішно завершено!`, { position: 'top-center' });
    } catch (err: any) {
      logger.error({
        event: 'bookmarks_export_failed',
        error: err?.message || String(err),
      });
      toast.error(err?.message || 'Не вдалося експортувати закладки', { position: 'top-center' });
    }
  };

  // Check batch of broken links
  checkBrokenLinksBatch = async (manual: boolean = false, targetItemIds?: number[]) => {
    if (this.isCheckingBrokenLinks || this.items.length === 0) return;
    this.isCheckingBrokenLinks = true;

    try {
      // Pick items to check (either targets or unchecked/oldest checked)
      let itemsToCheck = this.items.filter((it) => it.id !== undefined);
      if (targetItemIds && targetItemIds.length > 0) {
        itemsToCheck = itemsToCheck.filter((it) => targetItemIds.includes(it.id!));
      } else {
        // Prioritize items without status or checked > 1 hour ago, limit to 15 items per batch
        const now = Date.now();
        itemsToCheck = this.items
          .filter((it) => !this.brokenLinkStatuses[it.id!] || now - (this.brokenLinkStatuses[it.id!].checkedAt || 0) > 3600000)
          .slice(0, 15);
      }

      if (itemsToCheck.length === 0) {
        if (manual) toast.info('Усі посилання вже перевірено нещодавно', { position: 'top-center' });
        return;
      }

      // Mark as checking
      runInAction(() => {
        for (const it of itemsToCheck) {
          this.brokenLinkStatuses[it.id!] = { status: 'checking' };
        }
      });

      const response = await this.runRequest(
        API_ENDPOINTS.url.checkBroken,
        'POST',
        {
          items: itemsToCheck.map((it) => ({ id: it.id, url: it.url })),
        },
        'Помилка перевірки посилань',
        true,
        !manual
      );

      if (response && response.data?.results) {
        runInAction(() => {
          const now = Date.now();
          for (const res of response.data.results) {
            this.brokenLinkStatuses[res.id] = {
              status: res.status,
              statusCode: res.statusCode,
              error: res.error,
              checkedAt: now,
            };
          }
        });

        const brokenCount = response.data.results.filter((r: any) => r.status === 'broken').length;
        if (manual) {
          if (brokenCount > 0) {
            toast.warning(`Знайдено ${brokenCount} неробочих посилань із ${response.data.results.length}`, {
              position: 'top-center',
            });
          } else {
            toast.success(`Перевірено ${response.data.results.length} посилань: усі працюють!`, {
              position: 'top-center',
            });
          }
        }
      }
    } finally {
      runInAction(() => {
        this.isCheckingBrokenLinks = false;
      });
    }
  };

  fetchUrlMetadata = async (url: string) => {
    return this.runRequest(
      API_ENDPOINTS.url.fetchMetadata,
      'POST',
      { url: encodeURI(safeDecodeURI(url)) },
      'Помилка отримання метаданих з URL'
    );
  };

  setKeepBulkActionsToolbar = (val: boolean) => {
    this.keepBulkActionsToolbar = val;
  };
}

export const mainStore = new MainStore(preferencesStore);
