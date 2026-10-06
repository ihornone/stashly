'use client';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { TagType } from '@/lib/types';
import { SidebarTag } from './SidebarTag';
import { preferencesStore } from '@/store/preferencesStore';
import { mainStore } from '@/store/mainStore';
import { observer } from 'mobx-react-lite';
import { FolderPlus, Plus, Search, SearchIcon, X, EllipsisVertical } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagDialog } from './TagDialog';

export const NavTags = observer(({ itemIDsByTagID }: { itemIDsByTagID: Record<string, number[]> }) => {
  const store = mainStore;
  const prefStore = preferencesStore;
  const selectedTag = typeof store.tagFilter === 'number' ? store.tags[store.tagFilter] ?? null : null;
  const [tagSearchValue, setTagSearchValue] = useState('');
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const { isMobile } = useSidebar();

  const allTags = useMemo(() => {
    const tags = [...store.tagsArray];
    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
      return 0;
    });
    return tags;
  }, [store.tagsArray]);

  const [isTagSearchVisible, setIsTagSearchVisible] = useState(false);
  const tagSearchRef = React.useRef<HTMLInputElement | null>(null);

  const hideTagSearch = () => {
    setTagSearchValue('');
    setIsTagSearchVisible(false);
  };

  const showTagSearch = () => {
    setIsTagSearchVisible(true);
  };

  React.useEffect(() => {
    if (isTagSearchVisible) {
      const timeout = setTimeout(() => {
        tagSearchRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTagSearchVisible]);

  const renderTag = useCallback(
    (parentID: number, threadItemIDs: number[] = [], threadMatchesSearch = false): [React.JSX.Element[], number[], boolean] => {
      const renderedTags: React.JSX.Element[] = [];
      const tags: TagType[] = allTags.filter((tag: TagType) => tag.parent === parentID) as TagType[];

      let levelItemIDs: number[] = [];
      let levelTagsMatchSearch = false;

      for (const tag of tags) {
        const isTagSelected = store.tagFilter === tag.id;
        // Ancestor check must respect the path separator — "Work" is not an
        // ancestor of "Workshop/Docs"
        const isChildTagSelected =
          !isTagSelected &&
          !!selectedTag &&
          tag.id !== selectedTag.id &&
          selectedTag.fullPathIDs.startsWith(`${tag.fullPathIDs}/`);

        const isTagSearchActive = tagSearchValue !== '';
        const currentTagMatchesSearch =
          isTagSearchActive && tag.title.toLowerCase().includes(tagSearchValue.toLowerCase());

        const currentTagItemIDs = itemIDsByTagID[tag.id] ?? [];
        const [renderedChildTags, childTagsItemIDs, childTagsMatchSearch] = renderTag(
          tag.id,
          [...threadItemIDs, ...currentTagItemIDs],
          threadMatchesSearch || currentTagMatchesSearch
        );
        // Ensure we don't double count items that are assigned multiple child tags and/or current tag and child tags
        const accountedItemIDs = new Set([
          ...currentTagItemIDs,
          ...(prefStore.includeNestedTagItems ? childTagsItemIDs : []),
        ]);
        levelItemIDs = [...levelItemIDs, ...Array.from(accountedItemIDs)];

        if (!isTagSearchActive || currentTagMatchesSearch || childTagsMatchSearch || threadMatchesSearch) {
          const renderedTag = (
            <SidebarTag
              key={tag.id}
              tag={tag}
              renderedChildTags={renderedChildTags}
              itemCount={accountedItemIDs.size}
              isTagSelected={isTagSelected}
              isChildTagSelected={isChildTagSelected}
              childTagsMatchSearch={childTagsMatchSearch}
              highlightText={currentTagMatchesSearch ? tagSearchValue : null}
            />
          );
          renderedTags.push(renderedTag);
        }

        if (currentTagMatchesSearch || childTagsMatchSearch) {
          levelTagsMatchSearch = true;
        }
      }

      return [renderedTags, levelItemIDs, levelTagsMatchSearch];
    },
    [allTags, selectedTag, store.tagFilter, prefStore.includeNestedTagItems, itemIDsByTagID, tagSearchValue]
  );
  const [renderedTagTree] = renderTag(0);

  return (
    <>
      <SidebarGroup className="gap-2">
        {isTagSearchVisible ? (
          <InputGroup className="h-8 w-full">
            <InputGroupInput
              value={tagSearchValue}
              onChange={(e) => setTagSearchValue(String(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  hideTagSearch();
                }
              }}
              name="search"
              className="h-9 pl-6"
              placeholder="Фільтр тегів..."
              ref={tagSearchRef}
            />
            <InputGroupAddon className="left-2">
              <SearchIcon className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={hideTagSearch}>
                <X className="h-4 w-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Теги</span>
            <div className="flex items-center gap-1 -mr-1">
              <button
                type="button"
                onClick={() => setIsCreateTagOpen(true)}
                title="Додати категорію"
                className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-5 items-center justify-center rounded-md cursor-pointer transition-colors"
              >
                <Plus className="size-3.5" />
                <span className="sr-only">Додати категорію</span>
              </button>
              <button
                type="button"
                onClick={showTagSearch}
                title="Пошук тегів"
                className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-5 items-center justify-center rounded-md cursor-pointer transition-colors"
              >
                <Search className="size-3.5" />
                <span className="sr-only">Пошук тегів</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    title="Опції тегів"
                    className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-5 items-center justify-center rounded-md cursor-pointer transition-colors"
                  >
                    <EllipsisVertical className="size-3.5" />
                    <span className="sr-only">Опції тегів</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem
                    onClick={() => setIsCreateTagOpen(true)}
                    className="cursor-pointer font-medium"
                  >
                    <span>Створити категорію</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem
                      checked={prefStore.includeNestedTagItems}
                      onCheckedChange={(checked) => prefStore.setIncludeNestedTagItems(checked)}
                    >
                      Включати елементи вкладених тегів
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={prefStore.displaySidebarTagItemCounts}
                      onCheckedChange={(checked) => prefStore.setDisplaySidebarTagItemCounts(checked)}
                    >
                      Показувати кількість елементів
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">{renderedTagTree}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <TagDialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen} initialParentId={0} mode="create" />
    </>
  );
});
