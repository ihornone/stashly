'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { observer } from 'mobx-react-lite';
import { mainStore } from '@/store/mainStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useItemListState } from '@/features/bookmarks/hooks/useItemListState';
import { TagPath } from '@/features/bookmarks/components/EditItem/TagPath';
import { getTagColorRaw, cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export const TagBadge: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = mainStore;
  const tag = store.tags[tagID];
  const { setTagFilter } = useItemListState();

  const tagColor = getTagColorRaw(tag?.color) || '#3b82f6';

  const badgeStyle: React.CSSProperties = React.useMemo(() => {
    return {
      backgroundColor: tagColor,
      color: '#ffffff',
      borderColor: tagColor,
    };
  }, [tagColor]);

  if (!tag) {
    return null;
  }

  const isTagSelected = store.tagFilter === tagID;
  const isParentTagSelected =
    !isTagSelected && Array.isArray(store.itemListFilters.tags) && store.itemListFilters.tags.includes(tagID);

  const setTag = () => {
    setTagFilter(tagID);
  };

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            'cursor-pointer transition-all border font-medium px-2 py-0.5 shadow-xs hover:brightness-110 inline-flex items-center gap-1'
          )}
          style={badgeStyle}
          onClick={setTag}
        >
          {tag.share_id ? <Globe className="size-3 shrink-0 opacity-90" /> : null}
          <TagPath tag={{ label: tag.fullPath, color: tag.color }} showLast={true} hideDot={true} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <TagPath tag={{ label: tag.fullPath, color: tag.color }} />
        {tag.share_id ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-blue-400 font-medium">
            <Globe className="size-3" /> Опубліковано для спільного доступу
          </p>
        ) : null}
        {tag.description !== '' && <p className="mt-2 max-w-md whitespace-pre-wrap">{tag.description}</p>}
      </TooltipContent>
    </Tooltip>
  );
});

