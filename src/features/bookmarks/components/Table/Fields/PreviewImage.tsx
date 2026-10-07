import * as React from 'react';
import { useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageOff, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { ItemType } from '@/lib/types';

export const PreviewImage = React.memo(({
  imageUrl,
  item,
  className,
}: {
  imageUrl: string;
  item: ItemType | null;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = React.useState<boolean | null>(null);
  const [useFaviconFallback, setUseFaviconFallback] = React.useState(false);

  // Extract domain for high-res favicon fallback
  const domain = React.useMemo(() => {
    try {
      if (item?.url) return new URL(item.url).hostname;
      if (imageUrl && imageUrl.startsWith('http')) return new URL(imageUrl).hostname;
      return '';
    } catch {
      return '';
    }
  }, [item?.url, imageUrl]);

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
  const activeImageUrl = useFaviconFallback && faviconUrl ? faviconUrl : imageUrl;
  const imageLocalURL = activeImageUrl;

  useEffect(() => {
    setIsLoaded(null);
    setUseFaviconFallback(false);
  }, [imageUrl]);

  const handleImageError = () => {
    if (!useFaviconFallback && faviconUrl) {
      setUseFaviconFallback(true);
      setIsLoaded(null);
    } else {
      setIsLoaded(false);
    }
  };

  return (
    <div className="group item__image-container relative">
      {isLoaded === null && (
        <div
          className={cn(
            className,
            'item__image flex min-h-16 min-w-16 animate-pulse items-center justify-center bg-gray-100 dark:bg-muted/40'
          )}
        >
          <Spinner className="text-muted-foreground size-6" />
        </div>
      )}
      {isLoaded === false && (
        <div
          className={cn(
            className,
            'text-muted-foreground item__image flex min-h-16 min-w-16 items-center justify-center bg-gray-200 dark:bg-muted/60'
          )}
          title={`Image link is broken: ${imageUrl}`}
        >
          {domain ? <Globe className="w-6 h-6 opacity-40" /> : <ImageOff className="w-6 h-6" />}
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <img
            className={cn(
              className,
              'item__image object-cover',
              useFaviconFallback && 'object-contain p-2 max-h-16 max-w-16 mx-auto',
              isLoaded ? '' : 'hidden'
            )}
            src={imageLocalURL}
            title={imageUrl}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              setIsLoaded(true);
            }}
            onError={handleImageError}
          />
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="w-max border-0 bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="hidden">Image Preview</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="bg-background hover:bg-accent absolute -top-4 -right-4 rounded-full p-2 shadow transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </DialogClose>
          <img
            className={cn('h-auto max-h-[90vh] object-contain', activeImageUrl.endsWith('.svg') ? 'w-[500px]' : 'w-auto')}
            src={imageLocalURL}
            title={activeImageUrl}
            alt={'Preview of image: ' + activeImageUrl}
            loading="lazy"
            decoding="async"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});
PreviewImage.displayName = 'PreviewImage';
