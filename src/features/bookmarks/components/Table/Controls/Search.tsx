'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { SearchIcon, X } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
}

export const Search = React.memo(function Search<TData>({ table, globalFilter }: DataTableToolbarProps<TData>) {
  const [localValue, setLocalValue] = React.useState(globalFilter ?? '');

  // Keep local value in sync when external globalFilter changes (e.g. from URL or clear)
  React.useEffect(() => {
    setLocalValue(globalFilter ?? '');
  }, [globalFilter]);

  // Debounce globalFilter update to prevent re-filtering on every keystroke
  React.useEffect(() => {
    if (localValue === (globalFilter ?? '')) return;

    const timer = setTimeout(() => {
      React.startTransition(() => {
        table.setGlobalFilter(localValue);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [localValue, globalFilter, table]);

  const handleClear = () => {
    setLocalValue('');
    table.setGlobalFilter('');
  };

  const isFiltered = localValue.length > 0;

  return (
    <InputGroup>
      <InputGroupInput
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClear();
          }
        }}
        name="search"
        className="h-9 pl-6"
        placeholder="Пошук..."
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {isFiltered && (
        <InputGroupAddon align="inline-end" onClick={handleClear}>
          <InputGroupButton>
            <X className="mt-[1px]" /> <Kbd className="pointer-coarse:hidden">Esc</Kbd>
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
});
