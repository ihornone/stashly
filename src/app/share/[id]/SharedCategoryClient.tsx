'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TagType, ItemType } from '@/lib/types';
import { getTagColorRaw } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { Check, Plus, X, ArrowRight, Merge, CopyPlus, Globe } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ComparisonInfo {
  isOwner: boolean;
  existingTagId: number | null;
  isIdentical: boolean;
  newItemsCount: number;
  existingItemsCount: number;
  totalSharedCount: number;
}

interface SharedCategoryClientProps {
  tag: TagType;
  items: ItemType[];
  initialComparison?: ComparisonInfo | null;
}

const ukPluralRules = new Intl.PluralRules('uk-UA');
const getItemWord = (count: number) => {
  const rule = ukPluralRules.select(count);
  switch (rule) {
    case 'one':
      return 'закладка';
    case 'few':
      return 'закладки';
    default:
      return 'закладок';
  }
};

export function SharedCategoryClient({ tag, items, initialComparison = null }: SharedCategoryClientProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [importMode, setImportMode] = React.useState<'merge' | 'new' | null>(null);
  const [isDone, setIsDone] = React.useState(false);
  const [comparison, setComparison] = React.useState<ComparisonInfo | null>(initialComparison);

  const dotColor = getTagColorRaw(tag.color);
  const shareIdentifier = tag.share_id || tag.id;

  // Fetch comparison dynamically if user signed in after SSR
  React.useEffect(() => {
    if (isSignedIn && !comparison) {
      fetch(`/api/share/${shareIdentifier}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.comparison) {
            setComparison(data.comparison);
          }
        })
        .catch(() => {});
    }
  }, [isSignedIn, shareIdentifier, comparison]);

  const handleImport = async (mode: 'merge' | 'new' = 'merge') => {
    if (!isSignedIn) {
      toast.info('Увійдіть, щоб додати цю категорію');
      router.push(`/sign-in?redirect_url=/share/${shareIdentifier}`);
      return;
    }

    setIsLoading(true);
    setImportMode(mode);
    try {
      const res = await fetch(`/api/share/${shareIdentifier}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.success && data.tagId) {
        setIsDone(true);
        if (data.isIdentical) {
          toast.success(`Категорія вже існує (100% збіг)`, { position: 'top-center' });
        } else if (mode === 'merge') {
          toast.success(`Закладки успішно об'єднано з існуючою категорією!`, { position: 'top-center' });
        } else {
          toast.success(`Створено нову категорію «${tag.title}»!`, { position: 'top-center' });
        }
        setTimeout(() => {
          router.push(`/app?tag=${data.tagId}`);
        }, 500);
      } else {
        toast.error(data.message || 'Помилка додавання');
        setIsLoading(false);
        setImportMode(null);
      }
    } catch {
      toast.error('Не вдалося додати категорію');
      setIsLoading(false);
      setImportMode(null);
    }
  };

  const handleCancel = () => {
    if (window.opener || window.history.length <= 1) {
      window.close();
      router.push('/app');
    } else {
      router.push('/app');
    }
  };

  const handleOpenExisting = () => {
    if (comparison?.existingTagId) {
      router.push(`/app?tag=${comparison.existingTagId}`);
    } else {
      router.push('/app');
    }
  };

  // Case 1: 100% identical - User already has all bookmarks in this category
  if (comparison?.isIdentical && comparison?.existingTagId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
              <h1 className="text-base font-semibold tracking-tight text-foreground truncate max-w-[240px]">
                {tag.title}
              </h1>
              <Globe className="size-3.5 text-blue-500 shrink-0" />
            </div>

            <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full mt-1">
              <Check className="size-3.5" />
              <span>Вже додано (100% збіг)</span>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              Усі {items.length} {getItemWord(items.length)} вже збережено та синхронізовано у вашому акаунті.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-9 text-xs cursor-pointer"
            >
              <X className="size-3.5 mr-1" />
              <span>Закрити</span>
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={handleOpenExisting}
              className="flex-1 h-9 text-xs cursor-pointer gap-1.5"
            >
              <span>Відкрити</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Category exists, but author added updates / new bookmarks
  if (comparison?.existingTagId && comparison.newItemsCount > 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
              <h1 className="text-base font-semibold tracking-tight text-foreground truncate max-w-[240px]">
                {tag.title}
              </h1>
              <Globe className="size-3.5 text-blue-500 shrink-0" />
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              У вас вже є ця категорія ({comparison.existingItemsCount} закл.). Автор додав{' '}
              <span className="font-semibold text-primary">+{comparison.newItemsCount} {getItemWord(comparison.newItemsCount)}</span>.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              disabled={isLoading || isDone}
              onClick={() => handleImport('merge')}
              className="w-full h-9 text-xs cursor-pointer gap-1.5"
            >
              {isLoading && importMode === 'merge' ? (
                <>
                  <Spinner className="size-3.5" />
                  <span>Об'єднуємо...</span>
                </>
              ) : isDone && importMode === 'merge' ? (
                <>
                  <Check className="size-3.5" />
                  <span>Об'єднано!</span>
                </>
              ) : (
                <>
                  <Merge className="size-3.5" />
                  <span>Об'єднати (+{comparison.newItemsCount})</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isDone}
              onClick={() => handleImport('new')}
              className="w-full h-9 text-xs cursor-pointer gap-1.5 border-border/70"
            >
              {isLoading && importMode === 'new' ? (
                <>
                  <Spinner className="size-3.5" />
                  <span>Створюємо...</span>
                </>
              ) : isDone && importMode === 'new' ? (
                <>
                  <Check className="size-3.5" />
                  <span>Створено!</span>
                </>
              ) : (
                <>
                  <CopyPlus className="size-3.5" />
                  <span>Створити як нову</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isLoading || isDone}
              onClick={handleCancel}
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Скасувати
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Brand new category not in user's account
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
            <h1 className="text-base font-semibold tracking-tight text-foreground truncate max-w-[240px]">
              Додати «{tag.title}»?
            </h1>
            <Globe className="size-3.5 text-blue-500 shrink-0" />
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            {items.length} {getItemWord(items.length)}
          </p>

          {tag.description && (
            <p className="text-xs text-muted-foreground pt-1 line-clamp-2">
              {tag.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isDone}
            onClick={handleCancel}
            className="flex-1 h-9 text-xs cursor-pointer"
          >
            <X className="size-3.5 mr-1" />
            <span>Скасувати</span>
          </Button>

          <Button
            type="button"
            variant="default"
            disabled={isLoading || isDone}
            onClick={() => handleImport('merge')}
            className={`flex-1 h-9 text-xs cursor-pointer gap-1.5 ${isDone ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
          >
            {isDone ? (
              <>
                <Check className="size-3.5" />
                <span>Додано!</span>
              </>
            ) : isLoading ? (
              <>
                <Spinner className="size-3.5" />
                <span>Додаємо...</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Додати</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
