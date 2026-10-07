import React from 'react';
import { mainStore } from '@/store/mainStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, Maximize, Share2 } from 'lucide-react';
import { DeleteDialog } from '../Controls/DeleteDialog';
import { toast } from 'sonner';

export const ItemsActions = React.memo(({ row }: { row: any }) => {
  const itemID = row.original.id;
  const store = mainStore;
  const handleEdit = () => {
    store.openItemEditModal(itemID);
  };

  const handleShare = async () => {
    const url = row.original.url;
    const title = row.original.title || 'Закладка';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if dismissed
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success('Посилання скопійовано!', { position: 'top-center' });
    }
  };

  const handleMakeCopy = async () => {
    const result = await store.createItem(row.original);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleRefetch = async () => {
    const result = await store.refetchItemsMetadata([itemID]);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleDelete = async () => {
    const result = await store.deleteItems([itemID]);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  return (
    <div className="flex gap-1">
      <Button onClick={handleEdit} variant="outline" className="onhover-visible">
        <Maximize />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="onhover-visible !pr-1.5 !pl-1.5">
            <EllipsisVertical />
            <span className="sr-only">Відкрити меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handleShare} className="cursor-pointer gap-2">
            <Share2 className="size-4 text-primary" />
            <span>Поділитися</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRefetch} className="cursor-pointer">Оновити метадані</DropdownMenuItem>
          <DropdownMenuItem onClick={handleMakeCopy} className="cursor-pointer">Створити копію</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteDialog onConfirm={handleDelete} itemsCount={1}>
            <div className="focus:bg-accent focus:text-accent-foreground hover:bg-destructive/90 relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              Видалити
            </div>
          </DeleteDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
ItemsActions.displayName = 'ItemsActions';

