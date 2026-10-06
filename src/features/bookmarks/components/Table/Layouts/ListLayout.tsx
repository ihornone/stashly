import * as React from 'react';
import { renderField } from '../FieldFormatters';
import { handleBookmarkDragStart } from '@/lib/dragDrop';

export const ListLayout = ({ rows, table }: { rows: any[]; table?: any }) => {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {rows.map((row) => {
        const visibleCells = row.getVisibleCells();

        const getCell = (colId: string) => {
          const cell = visibleCells.find((c: any) => c.column.id === colId);
          return cell ? renderField({ cell }) : null;
        };

        const selectOutput = getCell('select');
        const imageOutput = getCell('image');
        const titleOutput = getCell('title');
        const urlOutput = getCell('url');
        const tagsOutput = getCell('tags');
        const descriptionOutput = getCell('description');
        const commentsOutput = getCell('comments');
        const createdOutput = getCell('created_at');
        const updatedOutput = getCell('updated_at');
        const actionsOutput = getCell('actions');

        const knownColIds = new Set([
          'select',
          'image',
          'title',
          'url',
          'tags',
          'description',
          'comments',
          'created_at',
          'updated_at',
          'actions',
        ]);

        const otherOutputs = visibleCells
          .filter((c: any) => !knownColIds.has(c.column.id))
          .map((cell: any) => renderField({ cell }))
          .filter(Boolean);

        return (
          <div
            key={row.original.id}
            data-state={row.getIsSelected() && 'selected'}
            draggable={true}
            onDragStart={(e) => handleBookmarkDragStart(e, row.original, table)}
            className="onhover-container @container/item relative transition-all cursor-grab active:cursor-grabbing hover:bg-accent/30"
          >
            {/* Desktop View (sm+): spacious horizontal layout */}
            <div
              data-state={row.getIsSelected() && 'selected'}
              className="data-[state=selected]:bg-muted/50 hidden sm:flex h-full flex-row flex-nowrap items-center gap-3 pl-3 pr-6 py-3.5 @xl/item:gap-4 @xl/item:pl-4 @xl/item:pr-8"
            >
              {selectOutput && (
                <div className="flex items-center justify-center shrink-0 self-center">
                  {selectOutput}
                </div>
              )}
              {imageOutput && (
                <div className="max-w-xs md:max-w-sm flex-1 shrink-0">
                  {imageOutput}
                </div>
              )}
              <div className="flex h-full flex-2 flex-col items-start gap-1.5 text-left @xl/item:gap-2 relative min-w-0 flex-1">
                <div className="w-full flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    {titleOutput}
                    {urlOutput}
                  </div>
                  {actionsOutput && (
                    <div className="shrink-0 flex items-center">
                      {actionsOutput}
                    </div>
                  )}
                </div>
                {tagsOutput}
                {descriptionOutput}
                {commentsOutput}
                {(createdOutput || updatedOutput) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-auto">
                    {createdOutput}
                    {updatedOutput}
                  </div>
                )}
                {otherOutputs}
              </div>
            </div>

            {/* Mobile View (< sm): Photo + Title at top, Tags & Description in middle, Checkbox + Actions at bottom */}
            <div
              data-state={row.getIsSelected() && 'selected'}
              className="data-[state=selected]:bg-muted/50 flex sm:hidden flex-col p-3 gap-2.5"
            >
              {/* Top block: Photo Preview + Title & URL */}
              <div className="flex items-start gap-2.5">
                {imageOutput && (
                  <div className="w-28 xs:w-36 aspect-video shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-muted/40 border border-border/50 shadow-2xs">
                    {imageOutput}
                  </div>
                )}

                <div className="min-w-0 flex-1 flex flex-col items-start gap-0.5">
                  {titleOutput}
                  {urlOutput}
                </div>
              </div>

              {/* Middle block: Tags, Description, and Footer Actions */}
              <div className="flex flex-col gap-2 text-left">
                {tagsOutput && <div className="w-full">{tagsOutput}</div>}
                {descriptionOutput && <div className="w-full">{descriptionOutput}</div>}
                {commentsOutput && <div className="w-full">{commentsOutput}</div>}
                {otherOutputs.length > 0 && <div className="w-full">{otherOutputs}</div>}

                {/* Bottom Footer: Checkbox on left + Action buttons on right */}
                <div className="flex items-center justify-between pt-1 border-t border-border/20">
                  <div className="flex items-center gap-2">
                    {selectOutput && (
                      <div className="flex items-center justify-center">
                        {selectOutput}
                      </div>
                    )}
                    {createdOutput && (
                      <div className="text-[10px] text-muted-foreground">
                        {createdOutput}
                      </div>
                    )}
                  </div>

                  {actionsOutput && (
                    <div className="flex items-center">
                      {actionsOutput}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ListLayout;
