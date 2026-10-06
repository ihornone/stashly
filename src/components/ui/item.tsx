import * as React from 'react'
import { cn } from '@/lib/utils'

function Item({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item"
      className={cn('text-foreground flex flex-col gap-4 p-4', className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="item-title"
      className={cn('text-[22px] font-semibold tracking-[-0.01em]', className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-description"
      className={cn(
        'text-muted-foreground flex flex-col gap-2 text-[15px] leading-[1.55]',
        className
      )}
      {...props}
    />
  )
}

function ItemIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-icon"
      className={cn('flex items-center self-start', className)}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn('flex flex-col flex-1 gap-1', className)}
      {...props}
    />
  )
}

function ItemMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-media"
      className={cn('flex items-center shrink-0', className)}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2 shrink-0', className)}
      {...props}
    />
  )
}

export { Item, ItemDescription, ItemIcon, ItemTitle, ItemContent, ItemMedia, ItemActions }
