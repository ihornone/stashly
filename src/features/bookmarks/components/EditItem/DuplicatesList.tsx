'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { ChevronRightIcon, ChevronsDownUp, ChevronsUpDown, Image as ImageIcon } from 'lucide-react';
import React, { startTransition, useContext, useEffect, useMemo } from 'react';
import { mainStore } from '@/store/mainStore';
import { cn, safeDecodeURI } from '@/lib/utils';
import { UrlSchema } from '@/lib/types';
import { PreviewImage } from '@/features/bookmarks/components/Table/Fields/PreviewImage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { Card, CardContent } from '@/components/ui/card';
import { useUrlState } from '@/features/bookmarks/hooks/useUrlState';

const normalizeUrl = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '') + new URL(u).pathname.replace(/\/$/, '');
  } catch {
    return u;
  }
};

const extractDomain = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export const DuplicatesList = observer(({ url }: { url: string }) => {
  const store = mainStore;
  const router = useRouter();
  const { searchParams, setUrlState } = useUrlState();
  const isExpandedParam = useMemo(() => Boolean(searchParams.get('expand-duplicates')), [searchParams]);

  useEffect(() => {
    if (store.items.length === 0) {
      store.fetchItems();
    }
  }, [store]);

  let validUrl: string | null = null;
  try {
    if (url) {
      validUrl = String(UrlSchema.parse(url));
    }
  } catch {
    /* empty */
  }

  const items = useMemo(() => {
    return store.items.map((item) => ({
      ...item,
      normalizedUrl: normalizeUrl(item.url),
      domain: extractDomain(item.url),
    }));
  }, [store.items]);

  const exactMatches = useMemo(() => {
    if (!validUrl) {
      return [];
    }
    const normalizedUrl = normalizeUrl(validUrl);
    if (normalizedUrl === '') {
      return [];
    }
    return items.filter((item) => item.normalizedUrl === normalizedUrl);
  }, [items, validUrl]);

  const domainMatches = useMemo(() => {
    if (!validUrl) {
      return [];
    }
    const urlDomain = extractDomain(validUrl);
    if (urlDomain === '') {
      return [];
    }
    return items.filter((item) => item.domain === urlDomain && !exactMatches.includes(item));
  }, [items, validUrl, exactMatches]);

  const openItem = (itemID: number) => {
    router.push(`/app/edit-item/${itemID}?show-back=1`);
  };

  const onOpenChange = (isOpen: boolean) => {
    startTransition(() => {
      setUrlState(
        {
          'expand-duplicates': isOpen ? '1' : null,
        },
        { replace: true }
      );
    });
  };

  const exactMatchesCount = exactMatches.length;
  const domainMatchesCount = domainMatches.length;
  const totalMatchesCount = exactMatchesCount + domainMatchesCount;
  if (totalMatchesCount === 0) {
    return null;
  }

  const renderDuplicateCard = (item, highlightedText) => {
    const decodedHighlightedText = safeDecodeURI(highlightedText);
    const splitIndex = decodedHighlightedText ? item.url.indexOf(decodedHighlightedText) : -1;
    const before = splitIndex === -1 ? item.url : item.url.slice(0, splitIndex);
    const after =
      splitIndex === -1 ? '' : item.url.slice(splitIndex + decodedHighlightedText.length);

    return (
      <Item className="bookmark_item flex-nowrap rounded-lg border p-3 hover:bg-muted/50" key={item.id}>
        <a
          href={`/app/edit-item/${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            openItem(item.id);
          }}
          title={item.title}
        >
          <ItemMedia>
            {item.image === '' ? (
              <div
                className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
                title="Немає зображення"
              >
                <ImageIcon />
              </div>
            ) : (
              <PreviewImage
                imageUrl={item.image}
                item={item}
                className="max-h-[64px] w-auto rounded-sm object-contain shadow-sm"
              />
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1 wrap-anywhere">{item.title}</ItemTitle>
            <ItemDescription className="line-clamp-1 wrap-anywhere">
              {before}
              <span className="bg-red-50 text-red-400">{decodedHighlightedText}</span>
              {after}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    );
  };

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <Collapsible className="m-0" defaultOpen={isExpandedParam} onOpenChange={onOpenChange}>
          <CollapsibleTrigger asChild>
            <Button variant="link" className="group w-full px-4! py-6">
              Можливий дублікат –{' '}
              {exactMatchesCount > 0 &&
                `${exactMatchesCount} ${exactMatchesCount === 1 ? 'точний збіг' : exactMatchesCount >= 2 && exactMatchesCount <= 4 ? 'точні збіги' : 'точних збігів'}`}
              {domainMatchesCount > 0 && exactMatchesCount > 0 && ' та '}
              {domainMatchesCount > 0 &&
                `${domainMatchesCount} ${domainMatchesCount === 1 ? 'доменний збіг' : domainMatchesCount >= 2 && domainMatchesCount <= 4 ? 'доменні збіги' : 'доменних збігів'}`}
              <ChevronsDownUp className="ml-auto hidden group-data-[state=open]:block" />
              <ChevronsUpDown className="ml-auto group-data-[state=open]:hidden" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-0">
            <ScrollArea className={cn('w-full', totalMatchesCount > 3 ? 'h-73' : '')}>
              <div className="flex w-full flex-col gap-2 px-3 pb-3">
                {exactMatches.map((item) => renderDuplicateCard(item, item.normalizedUrl))}
                {domainMatches.map((item) => renderDuplicateCard(item, item.domain))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
});
