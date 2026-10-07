import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { renderField } from '../FieldFormatters';
import { handleBookmarkDragStart } from '@/lib/dragDrop';

interface CardItemProps {
  row: any;
  table?: any;
}

const CardItem = React.memo(({ row, table }: CardItemProps) => {
  return (
    <Card
      data-state={row.getIsSelected() && 'selected'}
      draggable={true}
      onDragStart={(e) => handleBookmarkDragStart(e, row.original, table)}
      className="onhover-container data-[state=selected]:bg-muted/50 @container/item relative transition-shadow cursor-grab active:cursor-grabbing hover:shadow-md [content-visibility:auto] [contain-intrinsic-size:auto_220px]"
    >
      <CardContent className="flex h-full flex-col gap-3 text-left">
        {row.getVisibleCells().map((cell: any) => renderField({ cell }))}
      </CardContent>
    </Card>
  );
});
CardItem.displayName = 'CardItem';

export const CardsLayout = React.memo(({ rows, table }: { rows: any[]; table?: any }) => {
  return (
    <div className="m-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @2xl/main:grid-cols-2 @5xl/main:grid-cols-3 @7xl/main:grid-cols-4 @min-[108rem]/main:grid-cols-5 @min-[126rem]/main:grid-cols-6 @min-[142rem]/main:grid-cols-7">
      {rows.map((row) => (
        <CardItem key={row.original.id ?? row.id} row={row} table={table} />
      ))}
    </div>
  );
});
CardsLayout.displayName = 'CardsLayout';
