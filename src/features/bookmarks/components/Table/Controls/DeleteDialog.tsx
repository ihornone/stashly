import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import React from 'react';

export const DeleteDialog = ({ onConfirm, itemsCount, children }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Видалити{' '}
            {itemsCount === 1
              ? 'закладку'
              : itemsCount % 10 >= 2 && itemsCount % 10 <= 4 && (itemsCount % 100 < 10 || itemsCount % 100 >= 20)
                ? `${itemsCount} закладки`
                : `${itemsCount} закладок`}
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Цю дію неможливо скасувати. {itemsCount === 1 ? 'Закладку' : 'Закладки'} буде назавжди видалено.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row">
          <AlertDialogCancel className="mt-2 sm:mt-0">Скасувати</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs"
          >
            Видалити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
