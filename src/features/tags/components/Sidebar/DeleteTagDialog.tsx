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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';

export const DeleteTagDialog = ({
  onConfirm,
  hasChildTags,
  tagTitle,
  children,
}: {
  onConfirm: (deleteBookmarks: boolean) => void;
  hasChildTags?: boolean;
  tagTitle?: string;
  children: React.ReactNode;
}) => {
  const [deleteBookmarks, setDeleteBookmarks] = useState(false);
  const [open, setOpen] = useState(false);

  // Never keep a destructive pre-checked state between dialog opens
  useEffect(() => {
    if (!open) {
      setDeleteBookmarks(false);
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded-2xl border border-border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити категорію {tagTitle ? `«${tagTitle}»` : ''}?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Цю дію неможливо скасувати. Категорію {hasChildTags ? 'та всі її підкатегорії' : ''} буде видалено.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-2 rounded-xl bg-muted/40 p-3.5 border border-border/50">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="delete-bookmarks-checkbox"
              checked={deleteBookmarks}
              onCheckedChange={(checked) => setDeleteBookmarks(!!checked)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="delete-bookmarks-checkbox"
                className="text-xs font-semibold cursor-pointer text-foreground"
              >
                Видалити також усі закладки у цій категорії
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {deleteBookmarks
                  ? 'Усі посилання з цього тегу будуть назавжди видалені з бази даних.'
                  : 'Посилання залишаться у вашій базі (в розділі «Усі закладки»), буде видалено лише тег.'}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="rounded-xl mt-0">Скасувати</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(deleteBookmarks)}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs font-medium"
          >
            Видалити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
