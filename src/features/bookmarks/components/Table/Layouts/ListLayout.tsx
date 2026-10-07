import * as React from 'react';
import { renderField } from '../FieldFormatters';
import { handleBookmarkDragStart } from '@/lib/dragDrop';

interface ListRowProps {
  row: any;
  table?: any;
}

const ListRow = React.memo(({ row, table }: ListRowProps) => {
  const visibleCells = row.getVisibleCells();

  // Fast direct map of visible cells by column id (O(N) once rather than 10 O(N) searches)
  const cellMap: Record<string, any> = {};
  for (let i = 0; i < visibleCells.length; i++) {
    const c = visibleCells[i];
    cellMap[c.column.id] = c;
  }

  const selectOutput = cellMap.select ? renderField({ cell: cellMap.select }) : null;
  const imageOutput = cellMap.image ? renderField({ cell: cellMap.image }) : null;
  const titleOutput = cellMap.title ? renderField({ cell: cellMap.title }) : null;
  const urlOutput = cellMap.url ? renderField({ cell: cellMap.url }) : null;
  const tagsOutput = cellMap.tags ? renderField({ cell: cellMap.tags }) : null;
  const descriptionOutput = cellMap.description ? renderField({ cell: cellMap.description }) : null;
  const commentsOutput = cellMap.comments ? renderField({ cell: cellMap.comments }) : null;
  const createdOutput = cellMap.created_at ? renderField({ cell: cellMap.created_at }) : null;
  const updatedOutput = cellMap.updated_at ? renderField({ cell: cellMap.updated_at }) : null;
  const actionsOutput = cellMap.actions ? renderField({ cell: cellMap.actions }) : null;

  return (
    <div
      data-state={row.getIsSelected() && 'selected'}
      draggable={true}
      onDragStart={(e) => handleBookmarkDragStart(e, row.original, table)}
      className="onhover-container @container/item relative transition-colors cursor-grab active:cursor-grabbing hover:bg-accent/30 data-[state=selected]:bg-muted/50 [content-visibility:auto] [contain-intrinsic-size:auto_100px]"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:px-4 sm:py-3.5 @xl/item:gap-4 w-full min-w-0">
        {/* Checkbox (Desktop inline, mobile with header) */}
        {selectOutput && (
          <div className="hidden sm:flex items-center justify-center shrink-0 self-center">
            {selectOutput}
          </div>
        )}

        {/* Thumbnail Preview */}
        {imageOutput && (
          <div className="w-full sm:w-auto max-w-full sm:max-w-xs md:max-w-sm shrink-0">
            {imageOutput}
          </div>
        )}

        {/* Content details */}
        <div className="flex h-full flex-col items-start gap-1.5 text-left @xl/item:gap-2 relative min-w-0 flex-1 w-full">
          <div className="w-full flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 flex flex-col gap-0.5 sm:gap-1">
              {titleOutput}
              {urlOutput}
            </div>

            {/* Actions (Desktop top right) */}
            {actionsOutput && (
              <div className="hidden sm:flex shrink-0 items-center">
                {actionsOutput}
              </div>
            )}
          </div>

          {tagsOutput && <div className="w-full">{tagsOutput}</div>}
          {descriptionOutput && <div className="w-full">{descriptionOutput}</div>}
          {commentsOutput && <div className="w-full">{commentsOutput}</div>}

          {/* Bottom metadata + Mobile actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground mt-auto w-full pt-1 sm:pt-0 border-t sm:border-t-0 border-border/20">
            <div className="flex items-center gap-2 sm:gap-3">
              {selectOutput && (
                <div className="flex sm:hidden items-center justify-center">
                  {selectOutput}
                </div>
              )}
              {createdOutput}
              {updatedOutput}
            </div>

            {actionsOutput && (
              <div className="flex sm:hidden items-center">
                {actionsOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
ListRow.displayName = 'ListRow';

export const ListLayout = React.memo(({ rows, table }: { rows: any[]; table?: any }) => {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {rows.map((row) => (
        <ListRow key={row.original.id ?? row.id} row={row} table={table} />
      ))}
    </div>
  );
});
ListLayout.displayName = 'ListLayout';

export default ListLayout;
