'use client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import EditItemForm from './EditItemForm';
import { observer } from 'mobx-react-lite';
import { useContext, useMemo } from 'react';
import { mainStore } from '@/store/mainStore';

export const EditItemDialog = observer(() => {
  const store = mainStore;
  const item = useMemo(() => {
    return store.items.find((item) => item.id === store.modalOpenItemID) || null;
  }, [store.items, store.modalOpenItemID]);

  return (
    <Dialog onOpenChange={store.setIsItemModalOpen} modal={true} open={store.isItemModalOpen}>
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[100dvw] max-w-6xl rounded-none p-0 md:w-[95dvw] md:rounded-lg"
      >
        <DialogTitle className="sr-only">Редагувати закладку</DialogTitle>
        {store.isItemModalOpen && <EditItemForm key={item?.id ?? 'new'} isCloseWindowOnSubmit={false} item={item} />}
      </DialogContent>
    </Dialog>
  );
});
