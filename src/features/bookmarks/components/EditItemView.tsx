'use client';

import EditItemForm from '@/features/bookmarks/components/EditItem/EditItemForm';
import { observer } from 'mobx-react-lite';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { mainStore } from '@/store/mainStore';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { NotFound } from '@/components/ui/not-found';

export const EditItem = observer(() => {
  const store = mainStore;
  const params = useParams();
  const itemID = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (store.items.length > 0) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      const items = await store.fetchItems();
      // fetchItems resolves to null on network failure — that is not a 404
      if (items === null && store.items.length === 0) {
        setLoadFailed(true);
      }
      setIsLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = store.items.find((it) => it.id === itemID);

  const showBackButton = Boolean(searchParams.get('show-back'));

  const retry = () => {
    setIsLoading(true);
    setLoadFailed(false);
    store.fetchItems().then(() => setIsLoading(false));
  };

  if (isLoading) {
    return (
      <div className="bg-background flex h-full min-h-screen w-full flex-col items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg text-muted-foreground">Не вдалося завантажити закладку.</p>
        <Button onClick={retry} variant="outline">
          Спробувати знову
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <NotFound>
        <h1>Закладку не знайдено</h1>
        <p>Закладка, яку ви шукаєте, не існує або була видалена.</p>
      </NotFound>
    );
  }

  return <EditItemForm isCloseWindowOnSubmit={true} item={item} showBackButton={showBackButton} />;
});
