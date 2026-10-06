'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mainStore } from '@/store/mainStore';
import { observer } from 'mobx-react-lite';
import { colorHexMap, cn, TAG_COLOR_OPTIONS } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverAnchor, PopoverContent, PopoverHeader } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { TagSelect } from '@/features/bookmarks';
import { TagType } from '@/lib/types';

const colorList = TAG_COLOR_OPTIONS;

const TagFormSchema = z.object({
  title: z.string().trim().min(1, 'Введіть назву тегу'),
  parentId: z.number(),
  selectedColor: z.string(),
  description: z.string().optional(),
});

type TagFormValues = {
  title: string;
  parentId: number;
  selectedColor: string;
  description?: string;
};

export interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagType | null;
  initialParentId?: number;
  mode?: 'create' | 'edit';
}

export const TagForm = observer(({
  tag,
  initialParentId = 0,
  mode = tag ? 'edit' : 'create',
  onComplete,
}: {
  tag?: TagType | null;
  initialParentId?: number;
  mode?: 'create' | 'edit';
  onComplete: () => void;
}) => {
  const store = mainStore;
  const isEdit = mode === 'edit' && !!tag;
  const [isLoading, setIsLoading] = React.useState(false);

  const getDefaultColor = React.useCallback(() => {
    if (isEdit && tag?.color) return tag.color;
    if (initialParentId !== 0 && store.tags[initialParentId]?.color) {
      return store.tags[initialParentId].color;
    }
    return 'aqua';
  }, [isEdit, tag?.color, initialParentId, store.tags]);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(TagFormSchema) as any,
    defaultValues: {
      title: isEdit ? tag?.title || '' : '',
      parentId: isEdit ? tag?.parent || 0 : initialParentId,
      selectedColor: getDefaultColor(),
      description: isEdit ? tag?.description || '' : '',
    },
  });

  React.useEffect(() => {
    if (isEdit && tag) {
      form.reset({
        title: tag.title || '',
        parentId: tag.parent || 0,
        selectedColor: tag.color || 'gray',
        description: tag.description || '',
      });
    } else {
      form.reset({
        title: '',
        parentId: initialParentId,
        selectedColor: getDefaultColor(),
        description: '',
      });
    }
  }, [tag, initialParentId, isEdit, form, getDefaultColor]);

  const onSubmit = async (values: TagFormValues) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const trimmedTitle = values.title.trim();
      const trimmedDesc = (values.description || '').trim();

      if (isEdit && tag) {
        const success = await store.updateTag(
          tag.id,
          trimmedTitle,
          trimmedDesc,
          values.parentId,
          values.selectedColor
        );
        if (success) {
          onComplete();
        }
      } else {
        const tagId = await store.createCategory(
          trimmedTitle,
          values.parentId,
          values.selectedColor
        );
        if (!tagId) {
          // Creation failed — keep the dialog open so the input is not lost
          return;
        }
        if (trimmedDesc) {
          await store.updateTag(
            tagId,
            trimmedTitle,
            trimmedDesc,
            values.parentId,
            values.selectedColor
          );
        }
        onComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Назва</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={
                    form.watch('parentId') === 0
                      ? 'Наприклад: Робота, Розробка'
                      : 'Наприклад: Документація'
                  }
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Батьківський тег</FormLabel>
              <FormControl>
                <TagSelect
                  selectedTag={field.value}
                  onChange={(val: any) => field.onChange(Number(val) || 0)}
                  isMultiple={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectedColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Колір</FormLabel>
              <FormControl>
                <div className="grid grid-cols-8 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 w-full">
                  {colorList.map(({ key, label }) => {
                    const isSelected = field.value === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => field.onChange(key)}
                        title={label}
                        className={cn(
                          'group relative flex h-6 w-full items-center justify-center rounded-md transition-all cursor-pointer',
                          'hover:scale-105 active:scale-95 shadow-xs',
                          isSelected
                            ? 'ring-2 ring-foreground/60 ring-offset-1 ring-offset-background scale-100'
                            : 'opacity-85 hover:opacity-100'
                        )}
                        style={{ backgroundColor: colorHexMap[key] }}
                      >
                        {isSelected && (
                          <Check className="size-3 text-white stroke-[3] drop-shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опис</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Опис тегу (необов'язково)..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onComplete}>
            Скасувати
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {isEdit ? 'Зберегти' : 'Створити'}
          </Button>
        </div>
      </form>
    </Form>
  );
});

export const TagDialog = observer(({
  open,
  onOpenChange,
  tag,
  initialParentId = 0,
  mode = tag ? 'edit' : 'create',
}: TagDialogProps) => {
  const { isMobile } = useSidebar();
  const isEdit = mode === 'edit' && !!tag;
  const isRoot = (isEdit ? tag?.parent === 0 : initialParentId === 0);

  const dialogTitle = isEdit
    ? 'Редагувати тег'
    : isRoot
    ? 'Нова категорія'
    : 'Нова підкатегорія';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{dialogTitle}</DrawerTitle>
          </DrawerHeader>
          <div className="mx-4 mb-4">
            <TagForm
              tag={tag}
              initialParentId={initialParentId}
              mode={mode}
              onComplete={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={true}>
      <PopoverAnchor className="absolute bottom-0 left-[--spacing]" />
      <PopoverContent align="start" sideOffset={2} className="w-md max-w-[100dvw]">
        <PopoverHeader className="mb-2 text-center">{dialogTitle}</PopoverHeader>
        <TagForm
          tag={tag}
          initialParentId={initialParentId}
          mode={mode}
          onComplete={() => onOpenChange(false)}
        />
      </PopoverContent>
    </Popover>
  );
});
