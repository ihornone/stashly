'use client';
import { Plus, X } from 'lucide-react';

import * as React from 'react';
import { useContext, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { mainStore } from '@/store/mainStore';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { TagPath } from './TagPath';
import { normalizeQuery } from '@/lib/utils';

export const TagSelect = observer(
  ({
    isMultiple = true,
    onChange,
    selectedTagIDs = [],
    selectedTag,
  }: {
    isMultiple?: boolean;
    onChange: (values: number[] | number | null) => void;
    selectedTagIDs?: number[];
    selectedTag?: number;
  }) => {
    const anchor = useComboboxAnchor();
    const store = mainStore;

    // Guards against double tag creation: Base UI fires onValueChange on
    // selection commit, so creation must only ever happen through one path,
    // and rapid Enter/clicks must not fire parallel create requests.
    const creatingRef = React.useRef(false);

    useEffect(() => {
      if (store.tagsArray.length === 0) {
        store.fetchTags();
      }
    }, [store]);

    const effectiveSelectedTagIDs = useMemo(() => {
      if (Array.isArray(selectedTagIDs) && selectedTagIDs.length > 0) return selectedTagIDs;
      if (typeof selectedTag === 'number' && selectedTag > 0) return [selectedTag];
      return [];
    }, [selectedTagIDs, selectedTag]);

    const tags = useMemo(() => {
      return store.tagsArray.map((t) => {
        return {
          value: t.id,
          color: t.color,
          label: t.fullPath + '/',
          lowercase: t.fullPath.toLowerCase(),
        };
      });
    }, [store.tagsArray]);

    const selectedTags = useMemo(() => {
      return tags.filter((t) => effectiveSelectedTagIDs.includes(t.value));
    }, [tags, effectiveSelectedTagIDs]);

    const firstItemRef = React.useRef<HTMLDivElement | null>(null);
    const highlightedItemRef = React.useRef<any>(undefined);

    const [query, setQuery] = React.useState(() => {
      if (isMultiple) {
        return '';
      }
      return selectedTags[0]?.label?.replace(/\/$/, '') ?? '';
    });

    const normalizedQuery = normalizeQuery(query);
    const lowerCaseQuery = normalizedQuery.toLowerCase();
    const exactQueryMatchExists = useMemo(
      () => tags.some((t) => t.lowercase === lowerCaseQuery),
      [tags, lowerCaseQuery]
    );

    const comboboxItems = useMemo(
      () =>
        normalizedQuery.length > 0 && !exactQueryMatchExists
          ? [
              {
                creatable: true,
                value: `create:${normalizedQuery}`,
                label: query,
              },
              ...tags,
            ]
          : tags,
      [tags, normalizedQuery, query, exactQueryMatchExists]
    );

    const autocomplete = (label: string) => {
      setQuery(label.replace(/\/$/, ''));
      firstItemRef.current?.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
        })
      );
    };

    const createTagFromTitle = async (rawTitle: string): Promise<number | null> => {
      const title = normalizeQuery(rawTitle);
      if (!title || creatingRef.current) return null;
      creatingRef.current = true;
      try {
        const createdId = await store.createTag(title);
        return createdId ?? null;
      } finally {
        creatingRef.current = false;
      }
    };

    const handleMultipleValueChange = async (newValues: any[]) => {
      if (!Array.isArray(newValues)) return;

      const creatableItem = newValues.find(
        (v: any) => v?.creatable || (typeof v?.value === 'string' && String(v.value).startsWith('create:'))
      );

      if (creatableItem) {
        const rawTitle = creatableItem.label || String(creatableItem.value).replace('create:', '');
        const createdId = await createTagFromTitle(rawTitle);
        if (createdId) {
          onChange(Array.from(new Set([...effectiveSelectedTagIDs, createdId])));
        }
        setQuery('');
        return;
      }

      const nextIDs = newValues
        .map((item: any) => {
          if (!item) return null;
          if (typeof item === 'number') return item;
          if (typeof item.value === 'number') return item.value;
          const num = Number(item.value);
          return isNaN(num) ? null : num;
        })
        .filter((id): id is number => typeof id === 'number');

      onChange(nextIDs);
      setQuery('');
    };

    const handleSingleValueChange = async (newValue: any) => {
      if (!newValue) {
        onChange(null);
        setQuery('');
        return;
      }

      if (newValue.creatable || (typeof newValue.value === 'string' && String(newValue.value).startsWith('create:'))) {
        const rawTitle = newValue.label || String(newValue.value).replace('create:', '');
        const createdId = await createTagFromTitle(rawTitle);
        if (createdId) {
          onChange(createdId);
        }
        setQuery('');
        return;
      }

      const tagId = typeof newValue === 'number' ? newValue : Number(newValue.value);
      onChange(isNaN(tagId) ? null : tagId);
      setQuery('');
    };

    const onKeyDownCapture = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab' && highlightedItemRef.current) {
        autocomplete(highlightedItemRef.current.label);
        e.preventDefault();
      }
      if (isMultiple && e.key === 'Enter' && query.trim().length > 0) {
        if (highlightedItemRef.current) {
          if (
            highlightedItemRef.current.creatable ||
            (typeof highlightedItemRef.current.value === 'string' &&
              highlightedItemRef.current.value.startsWith('create:'))
          ) {
            e.preventDefault();
            e.stopPropagation();
            const rawTitle = highlightedItemRef.current.label || query;
            createTagFromTitle(rawTitle).then((createdId) => {
              if (createdId) {
                onChange(Array.from(new Set([...effectiveSelectedTagIDs, createdId])));
              }
            });
            setQuery('');
          }
        } else if (!exactQueryMatchExists) {
          e.preventDefault();
          e.stopPropagation();
          createTagFromTitle(query).then((createdId) => {
            if (createdId) {
              onChange(Array.from(new Set([...effectiveSelectedTagIDs, createdId])));
            }
          });
          setQuery('');
        }
      }
    };

    const ContentNode = (
      <ComboboxContent anchor={anchor}>
        <ComboboxList onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
          {(tag: any, index: number) => (
            <React.Fragment key={String(tag.value)}>
              <ComboboxItem
                key={String(tag.value)}
                value={tag}
                className="group cursor-pointer hover:bg-accent select-none"
                ref={index === 0 ? firstItemRef : null}
              >
                {tag.creatable ? (
                  <>
                    <Plus className="w-4 h-4 mr-1 text-primary shrink-0" />
                    <span>Створити новий тег: "{normalizeQuery(tag.label)}"</span>
                  </>
                ) : (
                  <TagPath tag={tag} />
                )}
              </ComboboxItem>
              {tag.creatable && <ComboboxSeparator className="shrink-0 last-of-type:hidden" />}
            </React.Fragment>
          )}
        </ComboboxList>
      </ComboboxContent>
    );

    if (isMultiple) {
      return (
        <Combobox
          modal={true}
          multiple
          highlightItemOnHover={true}
          autoHighlight={true}
          items={comboboxItems}
          value={selectedTags}
          inputValue={query}
          onInputValueChange={(v) => {
            setQuery(v);
          }}
          onItemHighlighted={(item) => {
            highlightedItemRef.current = item;
          }}
          onValueChange={handleMultipleValueChange}
          isItemEqualToValue={(item, val) => item?.value === val?.value}
        >
          <ComboboxChips ref={anchor} className="min-h-9 flex-wrap">
            <ComboboxValue>
              {(values: any[]) => (
                <React.Fragment>
                  {selectedTags.map((tag: any) => (
                    <ComboboxChip key={String(tag.value)} showRemove={false} className="group flex items-center gap-1">
                      <TagPath tag={tag} />
                      <button
                        type="button"
                        aria-label={`Видалити тег ${tag.label.replace(/\/$/, '')}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(effectiveSelectedTagIDs.filter((id) => id !== tag.value));
                        }}
                      >
                        <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={selectedTags.length > 0 ? '...' : 'Введіть для пошуку або створення тегів...'}
                    onKeyDownCapture={onKeyDownCapture}
                  />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          {ContentNode}
        </Combobox>
      );
    } else {
      return (
        <Combobox
          modal={true}
          multiple={false}
          highlightItemOnHover={true}
          autoHighlight={true}
          items={comboboxItems}
          value={selectedTags[0] ?? null}
          itemToStringLabel={(tag: any) => tag?.label?.replace(/\/$/, '')}
          inputValue={query}
          onInputValueChange={(v) => {
            setQuery(v);
          }}
          onItemHighlighted={(item) => {
            highlightedItemRef.current = item;
          }}
          onValueChange={handleSingleValueChange}
          isItemEqualToValue={(item, val) => item?.value === val?.value}
        >
          <ComboboxInput showClear placeholder="Введіть для пошуку або створення тегу" onKeyDownCapture={onKeyDownCapture} />
          {ContentNode}
        </Combobox>
      );
    }
  }
);
export default TagSelect;
