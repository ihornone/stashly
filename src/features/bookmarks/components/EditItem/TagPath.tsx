import React from 'react';
import { cn, getTagColorRaw } from '@/lib/utils';

export const TagPath = ({
  tag,
  showLast,
  hideDot = false,
  className,
}: {
  tag: { label: string; color: string };
  showLast?: boolean;
  hideDot?: boolean;
  className?: string;
}) => {
  const slashPlaceholder = '__SLASH__';
  const segments = tag.label
    .replaceAll('\\/', slashPlaceholder)
    .split('/')
    .filter((s) => s.trim().length > 0)
    .map((s) => s.replaceAll(slashPlaceholder, '/'));

  const dotColor = getTagColorRaw(tag.color);

  if (segments.length === 0) {
    return null;
  }

  return (
    <span className={cn('inline-flex flex-nowrap items-center justify-start gap-1.5 font-medium', className || '')}>
      {!hideDot && (
        <span
          className="size-2 rounded-full flex-none shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {showLast ? (
        <span className="truncate">{segments[segments.length - 1]}</span>
      ) : (
        <span className="break-words inline-flex items-center gap-1">
          {segments.map((segment, index) => (
            <React.Fragment key={index}>
              <span>{segment}</span>
              {index !== segments.length - 1 && <span className="opacity-60 text-xs">/</span>}
            </React.Fragment>
          ))}
        </span>
      )}
    </span>
  );
};
