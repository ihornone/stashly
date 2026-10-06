'use client';

import EditItemForm from '@/features/bookmarks/components/EditItem/EditItemForm';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { safeDecodeURIComponent } from '@/lib/utils';

export const CreateItem = observer(() => {
  const searchParams = useSearchParams();

  const urlParams = useMemo(() => {
    let rawUrl = safeDecodeURIComponent(searchParams?.get('url') || '');
    const rawText = safeDecodeURIComponent(searchParams?.get('text') || '');
    let rawDesc = safeDecodeURIComponent(searchParams?.get('description') || '');

    if (!rawUrl && rawText) {
      const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        rawUrl = urlMatch[0];
        rawDesc = rawText.replace(urlMatch[0], '').trim();
      } else {
        rawDesc = rawText;
      }
    } else if (rawText && !rawDesc) {
      rawDesc = rawText;
    }

    return {
      url: rawUrl,
      title: safeDecodeURIComponent(searchParams?.get('title') || ''),
      description: rawDesc,
      image: safeDecodeURIComponent(searchParams?.get('image') || ''),
    };
  }, [searchParams]);

  return <EditItemForm isCloseWindowOnSubmit={true} item={null} predefinedValues={urlParams} />;
});
