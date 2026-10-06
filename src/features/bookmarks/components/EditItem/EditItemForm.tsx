'use client';

import React, { useContext, useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagSelect } from './TagSelect';
import { Textarea } from '@/components/ui/textarea';
import { mainStore } from '@/store/mainStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ItemSchema, ItemType, UrlSchema } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Download, Image as ImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { DeleteDialog } from '@/features/bookmarks/components/Table/Controls/DeleteDialog';
import { PreviewImage } from '@/features/bookmarks/components/Table/Fields/PreviewImage';
import { safeDecodeURI } from '@/lib/utils';
import { DuplicatesList } from './DuplicatesList';
import { observer } from 'mobx-react-lite';
import { logger } from '@/lib/logger';

interface EditItemFormProps {
  item: ItemType | null;
  isCloseWindowOnSubmit: boolean;
  predefinedValues?: {
    url: string;
    title: string;
    description: string;
    image: string;
  };
  showBackButton?: boolean;
}

const INITIAL_ITEM_DATA: ItemType = {
  id: undefined,
  title: '',
  url: '',
  description: '',
  comments: '',
  image: '',
  tags: [],
  created_at: undefined,
  updated_at: undefined,
};

const EditItemForm = observer(
  ({ item, isCloseWindowOnSubmit, predefinedValues, showBackButton = false }: EditItemFormProps) => {
    const store = mainStore;
    const [isMetadataLoading, setIsMetadataLoading] = React.useState(false);
    const [isSubmitSuccess, setIsSubmitSuccess] = React.useState(false);
    const [closeCountdown, setCloseCountdown] = React.useState(1);
    const defaultValues = useMemo(
      () => item || { ...INITIAL_ITEM_DATA, ...(predefinedValues || {}) },
      [item, predefinedValues]
    );
    const router = useRouter();

    const form = useForm<ItemType>({
      resolver: zodResolver(ItemSchema),
      defaultValues: defaultValues,
      mode: 'onChange',
    });

    let imageUrl = form.watch('image') as string | undefined;
    try {
      imageUrl = UrlSchema.parse(imageUrl);
    } catch {
      /* empty */
    }
    const url = form.watch('url') as string;
    const urlForDuplicatesCheck = useDeferredValue(url);
    const [forceImageRefetch, setForceImageRefetch] = React.useState(false);
    const initialImageUrl = useRef(imageUrl);

    // Force image refetch if the image URL has changed
    useEffect(() => {
      if (imageUrl === initialImageUrl.current || forceImageRefetch) {
        return;
      }
      setForceImageRefetch(true);
    }, [imageUrl, forceImageRefetch]);

    // Reset form when item changes (e.g. when opening a different item in the modal)
    useEffect(() => {
      form.reset(defaultValues);
    }, [defaultValues, form]);

    const handleSaveClose = async (values: ItemType) => {
      try {
        let result;

        if (values.id) {
          result = await store.updateItem(values, values.id, forceImageRefetch);
        } else {
          result = await store.createItem(values, isCloseWindowOnSubmit);
        }
        if (!result) {
          return;
        }
        success();
      } catch (err) {
        // e.g. URIError on malformed URLs — surface it instead of failing silently
        toast.error('Не вдалося зберегти закладку', { position: 'top-center' });
        logger.error({
          event: 'bookmark_save_failed',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    const handleSaveCopy = async (values: ItemType) => {
      try {
        const result = await store.createItem(values);
        if (!result) {
          return;
        }
        success();
      } catch (err) {
        toast.error('Не вдалося зберегти копію закладки', { position: 'top-center' });
        logger.error({
          event: 'bookmark_save_copy_failed',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    const handleDelete = async (id) => {
      const result = await store.deleteItems([id]);
      if (!result) {
        return;
      }
      success();
    };

    const success = () => {
      if (isCloseWindowOnSubmit) {
        setIsSubmitSuccess(true);
      } else {
        store.closeModal();
        form.reset();
      }
    };

    // Countdown timer for auto-close
    useEffect(() => {
      if (!isSubmitSuccess || !isCloseWindowOnSubmit) {
        return;
      }

      if (closeCountdown <= 0) {
        window.close();
        router.push('/app');
        return;
      }

      const timer = setTimeout(() => {
        setCloseCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }, [isSubmitSuccess, isCloseWindowOnSubmit, closeCountdown, router]);

    const cancel = () => {
      if (isCloseWindowOnSubmit) {
        window.close();
        router.push('/app');
      } else {
        store.closeModal();
        form.reset();
      }
    };

    const updateMetadataFromUrl = async (event) => {
      event.preventDefault();

      let processedUrl;

      try {
        const result = await form.trigger('url');
        if (!result) {
          throw new Error();
        }
        processedUrl = UrlSchema.parse(form.getValues('url'));

        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
          throw new Error();
        }
      } catch {
        toast.error('Будь ласка, вкажіть коректний URL, що починається з http або https.', { position: 'top-center' });
        return;
      }

      setIsMetadataLoading(true);

      const data: { data: { title: string; description: string; image: string } } =
        await store.fetchUrlMetadata(processedUrl);

      setIsMetadataLoading(false);

      if (!data || !data?.data) {
        return;
      }

      form.setValue('title', data.data.title || '');
      form.setValue('description', data.data.description || '');
      form.setValue('image', safeDecodeURI(data.data.image || ''));

      // Force image refetch after metadata update to update the preview
      setForceImageRefetch(true);
    };

    const renderTextField = (name: keyof ItemType, label: string, isDisabled = false) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={isDisabled}
                className={isDisabled ? 'cursor-not-allowed bg-gray-200 text-gray-500' : ''}
                {...field}
                value={(field.value ?? '') as string}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );

    const renderTextareaField = (name: keyof ItemType, label: string) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea className="overflow-y-auto" {...field} value={(field.value ?? '') as string} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );

    const renderTagsField = () => (
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Теги</FormLabel>
            <FormControl className="text-left">
              <TagSelect
                isMultiple={true}
                onChange={field.onChange}
                selectedTagIDs={field.value ?? []}
              />
            </FormControl>
          </FormItem>
        )}
      />
    );

    if (isSubmitSuccess && isCloseWindowOnSubmit) {
      return (
        <div className="flex h-[100dvh] flex-col items-center justify-center p-6">
          <CheckCircle className="mb-4 h-16 w-16 text-primary" />
          <h2 className="mb-2 text-xl font-semibold">Закладку збережено!</h2>
          <p className="text-muted-foreground">
            Це вікно закриється через {closeCountdown} сек...
          </p>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveClose)}>
          <div
            className={'h-[100dvh] overflow-y-auto p-6' + (!isCloseWindowOnSubmit ? ' md:h-auto md:max-h-[95dvh]' : '')}
          >
            <h2 className="mb-3 text-left text-xl font-semibold tracking-tight">
              {showBackButton && (
                <Button type="button" variant="outline" size="icon" className="mr-4" onClick={() => router.back()}>
                  <ArrowLeft />
                </Button>
              )}
              {item ? 'Редагувати закладку' : 'Створити закладку'}
            </h2>
            {!item && <DuplicatesList url={urlForDuplicatesCheck} />}
            <div className="space-y-4 py-4">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <div className="flex flex-row gap-2">
                            <Input
                              type="text"
                              value={field.value ?? undefined}
                              onChange={(value) => {
                                field.onChange(value ?? null);
                              }}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={(e) => updateMetadataFromUrl(e)}
                                  variant="outline"
                                  disabled={isMetadataLoading}
                                >
                                  {isMetadataLoading ? <Spinner /> : <Download />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Підтягнути назву, опис та зображення з URL.</TooltipContent>
                            </Tooltip>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid gap-3">{renderTextField('title', 'Назва')}</div>

              <div className="grid gap-3">{renderTextareaField('description', 'Опис')}</div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="grow"> {renderTextField('image', 'URL зображення')}</div>
                <div className="min-h-16 min-w-16 sm:max-w-[40%]">
                  {imageUrl === '' ? (
                    <div
                      className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
                      title="Немає зображення"
                    >
                      <ImageIcon />
                    </div>
                  ) : (
                    <PreviewImage
                      imageUrl={imageUrl || ''}
                      item={!forceImageRefetch && item ? item : null}
                      className="max-h-[100px] w-auto rounded-sm object-contain shadow-sm"
                    />
                  )}
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid gap-3">{renderTagsField()}</div>

              <div className="grid gap-3">{renderTextareaField('comments', 'Нотатки')}</div>

              {item && (
                <div className="grid-cols-2 gap-3 space-y-4 sm:grid sm:space-y-0">
                  {renderTextField('created_at', 'Дата створення', true)}
                  {renderTextField('updated_at', 'Дата оновлення', true)}
                </div>
              )}
            </div>
            <div className="bg-background mt-4 flex flex-col justify-end gap-2 border-t pt-5 sm:flex-row">
              {item && (
                <div className="order-last mt-10 sm:order-none sm:mt-0 sm:mr-auto">
                  <DeleteDialog onConfirm={() => handleDelete(item.id)} itemsCount={1}>
                    <Button variant="destructive" className="w-full">
                      Видалити
                    </Button>
                  </DeleteDialog>
                </div>
              )}

              <Button onClick={cancel} type="button" variant="secondary" className="order-3 sm:order-none">
                Скасувати
              </Button>

              {item && (
                <Button
                  onClick={form.handleSubmit(handleSaveCopy)}
                  type="button"
                  variant="outline"
                  className="order-2 sm:order-none"
                  disabled={form.formState.isSubmitting}
                >
                  Зберегти як копію
                </Button>
              )}

              <Button
                type="submit"
                variant="default"
                className="order-1 sm:order-none"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                {item ? 'Зберегти зміни' : 'Зберегти'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }
);

export default EditItemForm;
