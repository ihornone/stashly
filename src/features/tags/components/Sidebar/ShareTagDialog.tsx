'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TagType } from '@/lib/types';
import { getTagColorRaw } from '@/lib/utils';
import { mainStore } from '@/store/mainStore';
import { observer } from 'mobx-react-lite';
import { toast } from 'sonner';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useCopyToClipboard } from '@/lib/hooks';

interface ShareTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagType;
}

export const ShareTagDialog = observer(({ open, onOpenChange, tag }: ShareTagDialogProps) => {
  const store = mainStore;
  const { isCopied, copy } = useCopyToClipboard(2000);
  const [isLoading, setIsLoading] = React.useState(false);
  const [shareId, setShareId] = React.useState<string | null>(
    tag.share_id && tag.share_id.length === 10 ? tag.share_id : null
  );

  React.useEffect(() => {
    if (tag.share_id && tag.share_id.length === 10) {
      setShareId(tag.share_id);
    } else {
      setShareId(null);
    }
  }, [tag.share_id]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sharePath = shareId ? `/share/${shareId}` : '';
  const shareUrl = shareId ? `${origin}/share/${shareId}` : '';

  const handleToggleAccess = async (checked: boolean) => {
    setIsLoading(true);
    const action = checked ? 'enable' : 'disable';
    const data = await store.runRequest(
      '/api/tags/share',
      'POST',
      { tagId: tag.id, action },
      'Помилка оновлення',
      true
    );

    setIsLoading(false);
    if (data?.success) {
      if (checked && data.share_id) {
        setShareId(data.share_id);
        if (store.tags[tag.id]) {
          store.setTagShareId(tag.id, data.share_id);
        }
        toast.success('Публічний доступ увімкнено', { position: 'top-center' });
      } else if (!checked) {
        setShareId(null);
        if (store.tags[tag.id]) {
          store.setTagShareId(tag.id, null);
        }
        toast.success('Доступ закрито', { position: 'top-center' });
      }
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    const data = await store.runRequest(
      '/api/tags/share',
      'POST',
      { tagId: tag.id, action: 'regenerate' },
      'Не вдалося перегенерувати',
      true
    );

    setIsLoading(false);
    if (data?.success && data.share_id) {
      setShareId(data.share_id);
      if (store.tags[tag.id]) {
        store.setTagShareId(tag.id, data.share_id);
      }
      toast.success('Посилання оновлено', { position: 'top-center' });
    }
  };

  const dotColor = getTagColorRaw(tag.color);
  const isShared = Boolean(shareId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-5 gap-4">
        <DialogHeader className="p-0 space-y-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="size-2.5 rounded-full flex-none shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <DialogTitle className="text-sm font-semibold truncate">
                {tag.title}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {isShared ? 'Публічний' : 'Приватний'}
              </span>
              <Switch
                checked={isShared}
                disabled={isLoading}
                onCheckedChange={handleToggleAccess}
              />
            </div>
          </div>
        </DialogHeader>

        {isShared && (
          <div className="flex items-center gap-1.5 pt-1">
            <Input
              readOnly
              value={sharePath}
              className="font-mono text-xs bg-muted/40 select-all h-8 px-2.5 text-muted-foreground"
              onFocus={(e) => e.target.select()}
              onCopy={(e) => {
                e.preventDefault();
                copy(shareUrl);
              }}
            />

            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 gap-1.5 shrink-0 cursor-pointer text-xs shadow-none"
              onClick={() => copy(shareUrl)}
            >
              {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{isCopied ? 'Скопійовано' : 'Копіювати'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              onClick={handleRegenerate}
              className="size-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Перегенерувати посилання"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Відкрити сторінку"
            >
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
