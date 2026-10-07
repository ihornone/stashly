import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import { formatDateUk } from '@/lib/utils';

export const TitleFormatter = React.memo(({ output }: { output: React.ReactNode }) => {
  return (
    <h4 className="line-clamp-3 scroll-m-20 font-semibold tracking-tight wrap-anywhere @xl/item:text-lg @3xl/item:text-xl">
      {output}
    </h4>
  );
});
TitleFormatter.displayName = 'TitleFormatter';

export const URLFormatter = React.memo(({ output }: { output: React.ReactNode }) => {
  return <div className="line-clamp-3 text-sm break-all @xl/item:text-base">{output}</div>;
});
URLFormatter.displayName = 'URLFormatter';

export const DescriptionFormatter = React.memo(({ output }: { output: React.ReactNode }) => {
  return (
    <div className="text-muted-foreground line-clamp-3 text-sm leading-6 wrap-anywhere whitespace-pre-line @3xl/item:line-clamp-none">
      {output}
    </div>
  );
});
DescriptionFormatter.displayName = 'DescriptionFormatter';

export const NotesFormatter = React.memo(({ output }: { output: React.ReactNode }) => {
  return (
    <blockquote className="text-muted-foreground line-clamp-3 border-l-2 pl-6 text-sm wrap-anywhere whitespace-pre-line italic @3xl/item:line-clamp-none">
      {output}
    </blockquote>
  );
});
NotesFormatter.displayName = 'NotesFormatter';

export const DateFormatter = React.memo(({ output, header }: { output: React.ReactNode; header: React.ReactNode }) => {
  const formatted = typeof output === 'string' ? formatDateUk(output) : output;
  return (
    <div className="text-muted-foreground text-xs @xl/item:text-sm">
      <span className="leading-none font-medium">{header}:</span> {formatted}
    </div>
  );
});
DateFormatter.displayName = 'DateFormatter';

export const renderField = ({ cell }: { cell: any }) => {
  const isActionColumn = cell.column.columnDef.meta?.isAction ?? false;
  const value = cell.getValue();

  if (!isActionColumn && (value === undefined || value === null || value === '')) {
    return null;
  }
  const output = flexRender(cell.column.columnDef.cell, cell.getContext());
  const colId = cell.column.id;

  let content: React.ReactNode;
  switch (colId) {
    case 'title':
      content = <TitleFormatter output={output} />;
      break;
    case 'url':
      content = <URLFormatter output={output} />;
      break;
    case 'description':
      content = <DescriptionFormatter output={output} />;
      break;
    case 'comments':
      content = <NotesFormatter output={output} />;
      break;
    case 'created_at':
    case 'updated_at':
      content = <DateFormatter output={output} header={cell.column.columnDef.header} />;
      break;
    default:
      content = output;
      break;
  }

  return (
    <div className={`${colId}-container`} key={cell.id}>
      {content}
    </div>
  );
};
