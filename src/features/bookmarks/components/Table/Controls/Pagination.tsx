import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLayoutEffect } from 'react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function Pagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pageIndex]);

  const rowCount = table.getFilteredRowModel().rows.length;

  const getItemWord = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'закладок';
    if (mod10 === 1) return 'закладка';
    if (mod10 >= 2 && mod10 <= 4) return 'закладки';
    return 'закладок';
  };

  return (
    <div className="flex flex-col @lg/main:flex-row @lg/main:items-center @lg/main:justify-between gap-2.5 px-3 py-2.5 border-t border-border/40 mt-auto">
      {/* Left on PC / Row 1 on Mobile: Total count + Per page select */}
      <div className="flex items-center justify-between @lg/main:justify-start @lg/main:gap-6 gap-2 text-sm">
        <span className="font-medium text-muted-foreground whitespace-nowrap">
          {rowCount} {getItemWord(rowCount)} загалом
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">На сторінці</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              table.setPageSize(newPageSize);
            }}
          >
            <SelectTrigger className="h-8 w-18 text-xs font-medium bg-muted/30 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right on PC / Row 2 on Mobile: Page counter + Navigation buttons */}
      <div className="flex items-center justify-between @lg/main:justify-end @lg/main:gap-4 gap-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          Сторінка {pageIndex + 1} з {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 border-border/60 bg-muted/20"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            title="На першу сторінку"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 border-border/60 bg-muted/20"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Попередня сторінка"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 border-border/60 bg-muted/20"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Наступна сторінка"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 border-border/60 bg-muted/20"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            title="На останню сторінку"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );




}
