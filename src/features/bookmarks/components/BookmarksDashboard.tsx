'use client';

import * as React from 'react';
import { startTransition, useContext, useEffect, useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { mainStore } from '@/store/mainStore';
import { Search } from '@/features/bookmarks/components/Table/Controls/Search';
import { observer } from 'mobx-react-lite';
import { Sorter } from '@/features/bookmarks/components/Table/Controls/Sorter';
import { Pagination } from '@/features/bookmarks/components/Table/Controls/Pagination';
import { CardsLayout } from '@/features/bookmarks/components/Table/Layouts/CardsLayout';
import { PreviewImage } from '@/features/bookmarks/components/Table/Fields/PreviewImage';
import { ItemType, LayoutType, TagFilterType } from '@/lib/types';
import { ItemsActions } from '@/features/bookmarks/components/Table/Fields/ItemActions';
import Loading from '@/app/app/loading';
import {
  cn,
  getSavedLayoutColumnVisibilityPreference,
  getSavedLayoutPreference,
  saveLayoutColumnVisibilityPreference,
  saveLayoutPreference,
} from '@/lib/utils';
import { TableLayout } from '@/features/bookmarks/components/Table/Layouts/TableLayout';
import { FieldToggler } from '@/features/bookmarks/components/Table/Controls/FieldToggler';
import { TagBadge } from '@/features/bookmarks/components/Table/Fields/TagBadge';
import { ListLayout } from '@/features/bookmarks/components/Table/Layouts/ListLayout';
import { UrlWithStatus } from '@/features/bookmarks/components/Table/Fields/UrlWithStatus';
import { LayoutSelector } from '@/features/bookmarks/components/Table/Controls/LayoutSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusIcon, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionControls } from '@/features/bookmarks/components/Table/Controls/BulkActionControls';
import { useUrlState } from '@/features/bookmarks/hooks/useUrlState';
import { useItemListState } from '@/features/bookmarks/hooks/useItemListState';
import { SidebarToggler } from '@/features/tags';

const columns: ColumnDef<ItemType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className={cn(
          'onhover-visible bg-primary-foreground',
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() ? 'opacity-100!' : ''
        )}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className={cn(
          'onhover-visible bg-primary-foreground dark:bg-primary-foreground',
          row.getIsSelected() ? 'opacity-100!' : ''
        )}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { isAction: true },
  },
  {
    accessorKey: 'image',
    header: 'Зображення',
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => {
      const imageURL = row.getValue('image') as string;
      return imageURL && <PreviewImage imageUrl={imageURL} item={row.original} />;
    },
  },
  {
    accessorKey: 'title',
    header: 'Назва',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
    cell: ({ row }) => {
      const value = row.getValue('title') as string;
      return <span title={value}>{value}</span>;
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs break-all\n' },
    cell: ({ row }) => {
      const value = row.getValue('url') as string;
      return <UrlWithStatus url={value} itemId={row.original.id!} />;
    },
  },
  {
    accessorKey: 'tags',
    header: 'Теги',
    enableSorting: false,
    enableHiding: true,
    meta: { class: 'min-w-xs' },

    filterFn: (row, columnId, filterValue: number[] | 'none' | null) => {
      if (filterValue === null) {
        return true;
      }
      const tagIDs = row.getValue('tags') as number[];
      if (filterValue === 'none') {
        return tagIDs.length === 0;
      }
      return tagIDs.some((val) => filterValue.includes(val));
    },
    cell: ({ row }) => {
      const tagIDs = row.getValue('tags') as number[];
      if (tagIDs.length === 0) {
        return null;
      }
      return (
        <div className="flex w-full flex-wrap gap-1 py-2 leading-6.5">
          {tagIDs.map((tagID) => (
            <TagBadge key={tagID} tagID={tagID} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Опис',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'comments',
    header: 'Нотатки',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'created_at',
    header: 'Дата створення',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    accessorKey: 'updated_at',
    header: 'Дата оновлення',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ItemsActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: { isAction: true, isPinned: true },
  },
];

const Table: React.FC = observer(() => {
  const store = mainStore;

  const { searchParams, setUrlState } = useUrlState();
  const pageIndexParam = Number(searchParams.get('page') ?? 1) - 1;
  const pageSizeParam = Number(searchParams.get('per-page') ?? 25);
  const sortByParam = searchParams.get('sort') ?? 'created_at';
  const isSortOrderDescParam = searchParams.get('order') !== 'asc';
  const searchKeywordParam = searchParams.get('search') ?? '';
  const tagFilterParam: TagFilterType = (() => {
    const value = searchParams.get('tag');
    if (value === 'none') {
      return value;
    }
    if (value === null) {
      return null;
    }
    const numValue = Number(value);
    return isNaN(numValue) ? null : numValue;
  })();

  const [globalFilter, setGlobalFilter] = React.useState<string>(searchKeywordParam);

  const tagColumnFilter = store.itemListFilters.tags;

  const columnFilters: ColumnFiltersState = [
    {
      id: 'tags',
      value: tagColumnFilter,
    },
  ];
  const [rowSelection, setRowSelection] = React.useState({});
  const [layout, setLayout] = useState<LayoutType>(getSavedLayoutPreference());
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    getSavedLayoutColumnVisibilityPreference(layout)
  );
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: sortByParam,
      desc: isSortOrderDescParam,
    },
  ]);
  const [columnOrder, setColumnOrder] = useState<string[]>([
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

  /**
   * State and URL syncing
   */
  // Search >
  const setGlobalFilterFromTable = (updaterOrValue) => {
    const newGlobalFilter = typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
    setGlobalFilter(newGlobalFilter);
    setPagination((oldValue) => {
      return {
        pageIndex: 0,
        pageSize: oldValue.pageSize,
      };
    });
  };

  // Update state from navigation changes
  useEffect(() => {
    if (globalFilter === searchKeywordParam) {
      return;
    }
    setGlobalFilter(searchKeywordParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeywordParam]);

  // Update URL from state change with delay
  useEffect(() => {
    if (globalFilter === searchKeywordParam) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setUrlState({
        search: globalFilter,
        // Preventing race conditions
        page: 1,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);
  // ^ Search

  // Pagination >
  const setPaginationFromTable = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;

    setPagination(newPagination);
    setUrlState({
      page: newPagination.pageIndex + 1,
      'per-page': newPagination.pageSize,
    });
  };

  // Update state from navigation changes
  useEffect(() => {
    if (pagination.pageIndex === pageIndexParam && pagination.pageSize === pageSizeParam) {
      return;
    }

    setPagination({
      pageIndex: pageIndexParam,
      pageSize: pageSizeParam,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndexParam, pageSizeParam]);
  // ^ Pagination

  // Sorting >
  // Update state from navigation changes
  useEffect(() => {
    if (sorting[0].id === sortByParam && sorting[0].desc === isSortOrderDescParam) {
      return;
    }

    updateSorting(sortByParam, isSortOrderDescParam, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByParam, isSortOrderDescParam]);
  // ^ Sorting

  // Tag >
  const { setTagFilter } = useItemListState();
  // Update state from navigation changes
  useEffect(() => {
    if (store.tagFilter === tagFilterParam) {
      return;
    }

    setTagFilter(tagFilterParam, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilterParam]);
  // ^ Tag
  /**
   * End of state and URL syncing
   */

  useEffect(() => {
    const savedColumnVisibility = getSavedLayoutColumnVisibilityPreference(layout);
    setColumnVisibility(savedColumnVisibility);
  }, [layout]);

  const table = useReactTable({
    data: store.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilterFromTable,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPaginationFromTable,
    globalFilterFn: 'includesString',
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnOrder,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });
  const currentRows = table.getPaginationRowModel().rows;
  const sortableColumns = table.getAllColumns().filter((column) => column.getCanSort());
  const visibilityToggleColumns = table.getAllColumns().filter((column) => column.getCanHide());

  // Reset row selection on table state changes
  useEffect(() => {
    startTransition(() => {
      table.resetRowSelection();
      store.setKeepBulkActionsToolbar(false);
    });
  }, [globalFilter, sorting, pagination, store.tagFilter, table, store]);

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= table.getPageCount()) {
      table.lastPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getPageCount()]);

  const updateSorting = (columnId: string, isDesc: boolean, skipURLUpdate: boolean = false) => {
    setSorting([
      {
        id: columnId,
        desc: isDesc,
      },
    ]);
    setPagination((oldValue) => {
      return {
        pageIndex: 0,
        pageSize: oldValue.pageSize,
      };
    });
    if (skipURLUpdate) {
      return;
    }

    setUrlState({
      sort: columnId,
      order: isDesc ? 'desc' : 'asc',
      page: 1,
    });
  };

  const updateLayout = (newValue: LayoutType) => {
    setLayout(newValue);
    saveLayoutPreference(newValue);
  };

  const updateColumnVisibility = (columnId: string, isVisible: boolean) => {
    const newVisibility = {
      ...table.getState().columnVisibility,
      [columnId]: isVisible,
    };
    const remainingVisibleColumns = visibilityToggleColumns.filter((column) => newVisibility[column.id] !== false);

    if (remainingVisibleColumns.length === 0) {
      toast.error('Неможливо приховати останнє видиме поле', {
        position: 'top-center',
      });
      return;
    }
    setColumnVisibility(newVisibility);
    saveLayoutColumnVisibilityPreference(layout, newVisibility);
  };

  const activeLayoutNode = React.useMemo(() => {
    switch (layout) {
      case 'list':
        return <ListLayout rows={currentRows} table={table} />;
      case 'cards':
        return <CardsLayout rows={currentRows} table={table} />;
      case 'table':
        return <TableLayout table={table} rows={currentRows} />;
      default:
        return <CardsLayout rows={currentRows} table={table} />;
    }
  }, [layout, currentRows, table]);

  // Global keyboard shortcuts for desktop / PWA
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Пошук"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        store.openItemCreateModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const renderControls = () => (
    <>
      <SidebarToggler />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 px-2.5 sm:px-3">
            <Settings2 className="h-4 w-4" />
            <span className="hidden @xl/main:inline-block">Вигляд</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuLabel>Макет</DropdownMenuLabel>
          <div className="mx-1 mb-3">
            <LayoutSelector layout={layout} onChange={updateLayout} />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Видимі поля</DropdownMenuLabel>
          <FieldToggler columns={visibilityToggleColumns} onChange={updateColumnVisibility} />
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1 min-w-0">
        <Search table={table} globalFilter={globalFilter} />
      </div>
      <Sorter
        selectedSortColumn={sorting[0]?.id}
        isDesc={sorting[0]?.desc}
        onChange={updateSorting}
        columns={sortableColumns}
      />
      <Button
        variant="default"
        size="sm"
        className="h-9 px-3 shrink-0"
        onClick={() => {
          store.openItemCreateModal();
        }}
        title="Додати закладку"
      >
        <PlusIcon className="h-4 w-4" />
        <span className="hidden @xl/main:inline-block">Додати</span>
      </Button>
    </>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Desktop Top Header Bar */}
      <header className="hidden sm:flex bg-background/95 sticky top-0 z-50 h-14 w-full items-center gap-1.5 border-b px-4 backdrop-blur-md app-drag group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="app-no-drag flex items-center gap-1.5 w-full">
          {renderControls()}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-clip overflow-y-auto">
        {currentRows.length > 0 ? (
          <div className={`flex min-h-full flex-col justify-between gap-4 p-3 sm:p-4 pb-18 sm:pb-4 item-list--${layout}`}>
            <div>
              {activeLayoutNode}
            </div>
            <Pagination table={table} />
          </div>
        ) : (
          <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-lg pb-18 sm:pb-0">
            Закладок не знайдено.
          </div>
        )}
        <BulkActionControls table={table} rowSelection={rowSelection} />
      </div>




      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/80 px-2.5 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex sm:hidden items-center gap-1.5 shadow-2xl">
        {renderControls()}
      </div>
    </div>
  );
});



export const BookmarksDashboard = () => {
  const store = mainStore;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    // runRequest resolves to null on failure instead of rejecting
    const [items, tags] = await Promise.all([store.fetchItems(), store.fetchTags()]);
    if (items === null && tags === null) {
      setLoadError(true);
    }
    setIsLoading(false);
  }, [store]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <Loading />;
  }

  if (loadError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg text-muted-foreground">Не вдалося завантажити закладки.</p>
        <Button onClick={() => loadData()} variant="outline">
          Спробувати знову
        </Button>
      </div>
    );
  }

  return <Table />;
};
