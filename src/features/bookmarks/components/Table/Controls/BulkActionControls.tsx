'use client';
import * as React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Square, SquareCheckBig, SquareMinus, TagsIcon, Trash, X } from 'lucide-react';
import { mainStore } from '@/store/mainStore';
import { Spinner } from '@/components/ui/spinner';
import { DeleteDialog } from './DeleteDialog';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { TagSelect } from './TagSelect';
import { Separator } from '@/components/ui/separator';
import { observer } from 'mobx-react-lite';

export const BulkActionControls = observer(({ table, rowSelection }: { table: any; rowSelection: any }) => {
  const { isMobile, state } = useSidebar();
  const enableSidebarIndent = !isMobile && state === 'expanded';
  const store = mainStore;
  const [deleteInProgress, setDeleteInProgress] = React.useState(false);
  const [fetchInProgress, setFetchInProgress] = React.useState(false);
  const selectedRows = useMemo(() => table.getFilteredSelectedRowModel().rows, [rowSelection, table]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedRowsCount = selectedRows.length;
  const selectedItemIds = useMemo(() => selectedRows.map((row) => row.original.id), [selectedRows]);

  const deleteSelected = async () => {
    setDeleteInProgress(true);
    const result = await store.deleteItems(selectedItemIds);
    setDeleteInProgress(false);
    if (!result) {
      return;
    }
    store.fetchItems();
    table.resetRowSelection();
  };

  const refetchSelected = async () => {
    setFetchInProgress(true);
    const result = await store.refetchItemsMetadata(selectedItemIds);
    if (result) {
      store.fetchItems();
    }
    setFetchInProgress(false);
  };

  const updateTagsSelected = async ({ newSelectedTagsAll, newSelectedTagsSome }) => {
    await store.updateItemsTags({
      itemIds: selectedItemIds,
      newSelectedTagsAll,
      newSelectedTagsSome,
    });
    await store.fetchItems();
    return true;
  };

  if (selectedRowsCount === 0 && !store.keepBulkActionsToolbar) {
    return null;
  }
  const selectedTags = selectedRows.map((row) => row.original.tags).flat();

  // Count occurrences of each tag
  const selectedRowsCountByTag = selectedTags.reduce(
    (count, tagID) => ((count[tagID] = (count[tagID] || 0) + 1), count),
    {}
  );
  const selectedTagsAll = Object.keys(selectedRowsCountByTag)
    .filter((tagID) => selectedRowsCountByTag[tagID] === selectedRowsCount)
    .map((tagID) => Number(tagID));
  const selectedTagsSome = Object.keys(selectedRowsCountByTag)
    .filter((tagID) => selectedRowsCountByTag[tagID] < selectedRowsCount)
    .map((tagID) => Number(tagID));
  return (
    <div
      className={cn(
        'fixed bottom-16 sm:bottom-6 z-50 flex items-center translate-x-1/2 gap-1.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-1.5 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200',
        enableSidebarIndent ? 'right-[calc((100%-287px)/2)]' : 'right-1/2'
      )}
    >
      <Button
        className="flex items-center gap-2 rounded-xl text-xs font-medium h-8 px-3 shadow-xs"
        variant="secondary"
        onClick={() => {
          table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
          store.setKeepBulkActionsToolbar(true);
        }}
      >
        {(table.getIsSomePageRowsSelected() && <SquareMinus className="w-4 h-4 text-primary" />) ||
          (table.getIsAllPageRowsSelected() && <SquareCheckBig className="w-4 h-4 text-primary" />) || (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}

        <Separator className="h-4 bg-border/80" orientation="vertical" />

        <span className="whitespace-nowrap font-medium">{selectedRowsCount} вибрано</span>
      </Button>

      <TagSelect selectedTagsAll={selectedTagsAll} selectedTagsSome={selectedTagsSome} onSubmit={updateTagsSelected}>
        <Button
          disabled={!selectedRowsCount}
          variant="ghost"
          size="sm"
          className="rounded-xl h-8 px-2.5 text-xs gap-1.5 hover:bg-accent"
        >
          <TagsIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden @md/main:inline-block">Теги</span>
        </Button>
      </TagSelect>

      <Button
        variant="ghost"
        size="sm"
        onClick={refetchSelected}
        disabled={fetchInProgress || !selectedRowsCount}
        className="rounded-xl h-8 px-2.5 text-xs gap-1.5 hover:bg-accent"
      >
        <RefreshCw className={cn('w-3.5 h-3.5 text-muted-foreground', fetchInProgress && 'animate-spin')} />
        <span className="hidden @md/main:inline-block">Оновити</span>
      </Button>

      <DeleteDialog onConfirm={deleteSelected} itemsCount={selectedRowsCount}>
        <Button
          variant="ghost"
          size="sm"
          disabled={deleteInProgress || !selectedRowsCount}
          className="rounded-xl h-8 px-2.5 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {deleteInProgress ? <Spinner className="w-3.5 h-3.5" /> : <Trash className="w-3.5 h-3.5" />}
          <span className="hidden @md/main:inline-block">Видалити</span>
        </Button>
      </DeleteDialog>

      <Separator className="h-4 bg-border/60 mx-0.5" orientation="vertical" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          store.setKeepBulkActionsToolbar(false);
          table.resetRowSelection();
        }}
        className="rounded-xl h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
});
