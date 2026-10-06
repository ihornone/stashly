'use client';
import { Plus } from 'lucide-react';

import * as React from 'react';
import { ReactNode, useContext, useMemo } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { observer } from 'mobx-react-lite';
import { mainStore } from '@/store/mainStore';
import { normalizeQuery } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TagPath } from '@/features/bookmarks/components/EditItem/TagPath';

const TagSelectCommand = observer(
  ({
    selectedTagsAll,
    selectedTagsSome,
    onSubmit,
    setOpen,
  }: {
    selectedTagsAll: number[];
    selectedTagsSome: number[];
    onSubmit: ({ newSelectedTagsAll, newSelectedTagsSome }) => Promise<boolean>;
    setOpen: (open: boolean) => void;
  }) => {
    const store = mainStore;
    const [newSelectedTagsAll, setNewSelectedTagsAll] = React.useState(selectedTagsAll);
    const [newSelectedTagsSome, setNewSelectedTagsSome] = React.useState(selectedTagsSome);
    const [query, setQuery] = React.useState('');
    const [isSubmitInProgress, setIsSubmitInProgress] = React.useState(false);
    const [createTagInProgress, setTagCreateInProgress] = React.useState(false);

    React.useEffect(() => {
      setNewSelectedTagsAll(selectedTagsAll);
      setNewSelectedTagsSome(selectedTagsSome);
    }, [selectedTagsAll, selectedTagsSome]);

    const isChanged: boolean = useMemo(
      () =>
        newSelectedTagsSome.length !== selectedTagsSome.length ||
        newSelectedTagsAll.length !== selectedTagsAll.length ||
        newSelectedTagsAll.some((tag) => !selectedTagsAll.includes(tag)) ||
        selectedTagsAll.some((tag) => !newSelectedTagsAll.includes(tag)),
      [newSelectedTagsAll, newSelectedTagsSome, selectedTagsAll, selectedTagsSome]
    );

    const sortedTags = useMemo(() => {
      const tags = [...store.tagsArray];
      const selectedTags = [...newSelectedTagsAll, ...newSelectedTagsSome];
      tags.sort((a, b) => {
        return Number(selectedTags.includes(b.id)) - Number(selectedTags.includes(a.id));
      });
      return tags;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.tagsArray, query]);

    const normalizedQuery = normalizeQuery(query);
    const lowerCaseQuery = normalizedQuery.toLowerCase();
    const exactQueryMatchExists = sortedTags.some((t) => t.fullPath.toLowerCase() === lowerCaseQuery);

    return (
      <Command shouldFilter={false} disablePointerSelection={false} loop={false}>
        <CommandInput value={query} onValueChange={setQuery} placeholder="Пошук тегів..." className="h-9" />

        <CommandList className="max-h-[25dvh] overflow-y-scroll">
          <CommandGroup>
            {normalizedQuery.length > 0 && !exactQueryMatchExists && (
              <CommandItem
                forceMount={true}
                key="new_item"
                disabled={createTagInProgress}
                value={query}
                onSelect={() => {
                  const createTag = async () => {
                    setTagCreateInProgress(true);
                    const newTagID = await store.createTag(normalizedQuery);
                    if (newTagID === null) {
                      return;
                    }
                    setNewSelectedTagsAll((prev) => [...prev, Number(newTagID)]);
                    setQuery('');
                    setTagCreateInProgress(false);
                  };
                  createTag();
                }}
              >
                {createTagInProgress ? <Spinner /> : <Plus />} Створити новий тег: "{normalizedQuery}"
              </CommandItem>
            )}

            {sortedTags
              .filter((tag) => tag.fullPath.toLowerCase().includes(lowerCaseQuery))
              .map((tag) => (
                <CommandItem
                  className="flex items-center gap-3 cursor-pointer"
                  key={tag.id}
                  value={`${tag.id} ${tag.fullPath}`}
                  keywords={[tag.fullPath]}
                  onSelect={() => {
                    const tagId = tag.id;
                    setNewSelectedTagsSome((prev) => prev.filter((id) => id !== tagId));
                    setNewSelectedTagsAll((prev) =>
                      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
                    );
                  }}
                >
                  <Checkbox
                    checked={
                      newSelectedTagsAll.includes(tag.id) ||
                      (newSelectedTagsSome.includes(tag.id) ? 'indeterminate' : false)
                    }
                    aria-label="Select all"
                  />
                  <TagPath tag={{ label: tag.fullPath, color: tag.color }} />
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
        <div className="bg-muted/40 border-t border-border/50 w-full p-2">
          <Button
            type="button"
            variant="default"
            disabled={!isChanged || isSubmitInProgress}
            size="sm"
            key="apply"
            value={query}
            className="w-full text-xs font-medium"
            onClick={async () => {
              setIsSubmitInProgress(true);
              await onSubmit({ newSelectedTagsAll, newSelectedTagsSome });
              setIsSubmitInProgress(false);
              setOpen(false);
            }}
          >
            {isSubmitInProgress && <Spinner className="w-3.5 h-3.5 mr-1.5" />}
            Застосувати зміни
          </Button>
        </div>
      </Command>
    );
  }
);

export const TagSelect = observer(
  ({
    selectedTagsAll,
    selectedTagsSome,
    onSubmit,
    children,
  }: {
    selectedTagsAll: number[];
    selectedTagsSome: number[];
    onSubmit: ({ newSelectedTagsAll, newSelectedTagsSome }) => Promise<boolean>;
    children: ReactNode;
  }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          sideOffset={8}
          className="overflow-hidden p-0 border border-border shadow-xl rounded-xl w-72 bg-popover"
          align="center"
          // Required to make the popover scrollable with mouse wheel and touch move inside modal
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <TagSelectCommand
            selectedTagsSome={selectedTagsSome}
            selectedTagsAll={selectedTagsAll}
            onSubmit={onSubmit}
            setOpen={setOpen}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
