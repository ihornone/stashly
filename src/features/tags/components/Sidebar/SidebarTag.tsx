'use client';

import * as React from 'react';
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { preferencesStore } from '@/store/preferencesStore';
import { mainStore } from '@/store/mainStore';
import { cn, colorMap, colorHexMap, getTagColorRaw, isCustomColor, TAG_COLOR_OPTIONS } from '@/lib/utils';
import { useItemListState } from '@/features/bookmarks';
import { TagType } from '@/lib/types';
import { TagDialog } from './TagDialog';
import { logger } from '@/lib/logger';
import { DeleteTagDialog } from './DeleteTagDialog';
import { ShareTagDialog } from './ShareTagDialog';
import { observer } from 'mobx-react-lite';
import { Globe, Info, Share2, ChevronRight, EllipsisVertical, Pin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { STASHLY_DRAG_TYPE } from '@/lib/dragDrop';
import { toast } from 'sonner';

const TagItem = observer(({
  tag,
  highlightText,
  prependedNode = null,
  childTags = null,
  itemCount,
  isTagSelected,
  onAutoExpand,
  className,
}: {
  tag: TagType;
  highlightText: string | null;
  prependedNode?: React.ReactNode;
  childTags?: React.ReactNode;
  itemCount: number;
  isTagSelected: boolean;
  onAutoExpand?: () => void;
  className?: string;
}) => {
  const prefStore = preferencesStore;
  const store = mainStore;
  const { setTagFilter } = useItemListState();
  const { isMobile, toggleSidebar } = useSidebar();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const expandTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const dotColor = getTagColorRaw(tag.color);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(STASHLY_DRAG_TYPE) || e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      if (!isDragOver) {
        setIsDragOver(true);
      }
      if (onAutoExpand && !expandTimerRef.current) {
        expandTimerRef.current = setTimeout(() => {
          onAutoExpand();
        }, 600);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }

    try {
      const rawData = e.dataTransfer.getData(STASHLY_DRAG_TYPE) || e.dataTransfer.getData('text/plain');
      if (!rawData) return;
      const parsed = JSON.parse(rawData);
      const itemIds: number[] = Array.isArray(parsed) ? parsed : (parsed.itemIds || []);
      if (itemIds.length > 0) {
        await store.attachTagToItems(itemIds, tag.id);
        const countStr = itemIds.length === 1 ? '1 закладку' : `${itemIds.length} закладок`;
        toast.success(`Категорію "${tag.title}" призначено для ${countStr}!`, { position: 'top-center' });
      }
    } catch (err) {
      logger.error({
        event: 'drag_and_drop_attach_tag_failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <SidebarMenuButton
      className={cn(
        className,
        'group/sidebar-tag-item w-full cursor-pointer justify-start transition-all font-normal',
        isDragOver && 'ring-2 ring-primary bg-primary/20 scale-[1.03] text-foreground font-semibold shadow-md z-10'
      )}
      isActive={isTagSelected}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        setTagFilter(tag.id);
        if (isMobile) {
          toggleSidebar();
        }
      }}
    >
      {prependedNode}
      <span
        className="size-2 rounded-full flex-none shrink-0 transition-transform group-hover/sidebar-tag-item:scale-110 mr-1"
        style={{ backgroundColor: dotColor }}
      />
      <span className="truncate flex-1 text-left">
        {highlightText ? (
          tag.title.split(new RegExp(`(${highlightText})`, 'gi')).map((part, i) =>
            part.toLowerCase() === highlightText.toLowerCase() ? (
              <mark key={i} className="bg-yellow-200 text-black dark:bg-yellow-800 dark:text-white rounded-xs px-0.5">
                {part}
              </mark>
            ) : (
              part
            )
          )
        ) : (
          tag.title
        )}
      </span>
      {tag.description ? (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span
              onClick={(e) => e.stopPropagation()}
              className="ml-1 text-muted-foreground/60 hover:text-foreground cursor-help flex items-center shrink-0"
            >
              <Info className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs p-2">
            <p className="whitespace-pre-wrap leading-relaxed">{tag.description}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
      {tag.share_id ? (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span
              onClick={(e) => e.stopPropagation()}
              className="ml-1 text-blue-500 hover:text-blue-400 flex items-center shrink-0 cursor-help"
            >
              <Globe className="size-3.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs p-1.5 font-medium">
            Опубліковано для спільного доступу
          </TooltipContent>
        </Tooltip>
      ) : null}
      {tag.pinned && <Pin className="ml-1 h-3.5 w-3.5 flex-none text-muted-foreground/70" />}

      {prefStore.displaySidebarTagItemCounts && (
        <SidebarMenuBadge
          className="ml-auto flex-none text-xs tabular-nums"
        >
          {itemCount}
        </SidebarMenuBadge>
      )}
    </SidebarMenuButton>
  );
});

const TagActions = ({
  tag,
  isEditOpen,
  setIsEditOpen,
  hasChildTags,
}: {
  tag: TagType;
  isEditOpen: boolean;
  setIsEditOpen: (bool: boolean) => void;
  hasChildTags: boolean;
}) => {
  const { isMobile } = useSidebar();
  const store = mainStore;
  const [isAddSubtagOpen, setIsAddSubtagOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  const deleteTag = (deleteBookmarks: boolean = false) => {
    store.deleteTag(tag.id, deleteBookmarks);
  };

  const showEditControls = () => {
    setIsEditOpen(true);
  };

  return (
    <>
      <TagDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tag={tag}
        mode="edit"
      />

      <TagDialog
        open={isAddSubtagOpen}
        onOpenChange={setIsAddSubtagOpen}
        initialParentId={tag.id}
        mode="create"
      />

      <ShareTagDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        tag={tag}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover={true} className="cursor-pointer rounded-sm">
            <EllipsisVertical />
            <span className="sr-only">Більше дій</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-44 rounded-lg"
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuItem onClick={() => setIsShareOpen(true)} className="cursor-pointer">
            <Share2 className="size-4 mr-1.5" />
            <span>Поділитися</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAddSubtagOpen(true)} className="cursor-pointer">
            <span>Підкатегорія</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={showEditControls}>
            <span>Редагувати</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Колір</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-36">
                {TAG_COLOR_OPTIONS.map(({ key: color, label }) => (
                  <DropdownMenuItem
                    key={color}
                    onClick={() => store.updateTagColor(tag.id, color)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full flex-none"
                      style={{ backgroundColor: colorHexMap[color] }}
                    />
                    <span>{label}</span>
                    <span className="ml-auto font-bold text-xs">{tag.color === color ? '✓' : ''}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => store.updateTagPinned(tag.id, !tag.pinned)}>
            <span>{tag.pinned ? 'Відкріпити' : 'Закріпити'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={(e) => e.preventDefault()} className="p-0">
              <DeleteTagDialog onConfirm={deleteTag} hasChildTags={hasChildTags} tagTitle={tag.title}>
                <span className="w-full px-2 py-1">Видалити</span>
              </DeleteTagDialog>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const SidebarTag = observer(({
  tag,
  renderedChildTags,
  itemCount,
  isTagSelected,
  isChildTagSelected,
  childTagsMatchSearch,
  highlightText,
}: {
  tag: TagType;
  renderedChildTags: React.ReactNode[];
  itemCount: number;
  isTagSelected: boolean;
  isChildTagSelected: boolean;
  childTagsMatchSearch: boolean;
  highlightText: string | null;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const hasChildren = renderedChildTags.length > 0;

  React.useEffect(() => {
    if (isChildTagSelected || childTagsMatchSearch) {
      setIsOpen(true);
    }
  }, [isChildTagSelected, childTagsMatchSearch]);

  return (
    <SidebarMenuItem>
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible w-full">
          <div className="flex items-center">
            <TagItem
              tag={tag}
              itemCount={itemCount}
              isTagSelected={isTagSelected}
              highlightText={highlightText}
              onAutoExpand={() => setIsOpen(true)}
              prependedNode={
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsOpen(!isOpen);
                    }
                  }}
                  className="hover:bg-black/10 dark:hover:bg-white/20 -ml-1 mr-1 flex h-5 w-5 items-center justify-center rounded-sm transition-colors cursor-pointer shrink-0"
                >
                  <ChevronRight
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-90')}
                  />
                </span>
              }
            />
            <TagActions
              tag={tag}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
              hasChildTags={hasChildren}
            />
          </div>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0 border-l-0 pl-3.5 space-y-0.5">{renderedChildTags}</SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="flex items-center">
          <TagItem
            tag={tag}
            itemCount={itemCount}
            isTagSelected={isTagSelected}
            highlightText={highlightText}
          />
          <TagActions
            tag={tag}
            isEditOpen={isEditOpen}
            setIsEditOpen={setIsEditOpen}
            hasChildTags={false}
          />
        </div>
      )}
    </SidebarMenuItem>
  );
});
