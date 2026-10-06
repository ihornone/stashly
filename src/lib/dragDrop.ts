'use client';

export const STASHLY_DRAG_TYPE = 'application/stashly-items';

export function handleBookmarkDragStart(
  e: React.DragEvent,
  item: { id: number; title?: string },
  table?: any
) {
  // Determine item IDs to drag
  let itemIds: number[] = [item.id];

  if (table && typeof table.getSelectedRowModel === 'function') {
    const selectedRows = table.getSelectedRowModel().rows || [];
    const selectedIds = selectedRows.map((r: any) => r.original?.id).filter(Boolean);
    if (selectedIds.includes(item.id) && selectedIds.length > 0) {
      itemIds = selectedIds;
    }
  }

  e.dataTransfer.setData(STASHLY_DRAG_TYPE, JSON.stringify(itemIds));
  e.dataTransfer.setData('text/plain', JSON.stringify(itemIds));
  e.dataTransfer.effectAllowed = 'copy';

  // Create custom floating drag preview badge
  const ghost = document.createElement('div');
  ghost.style.position = 'absolute';
  ghost.style.top = '-9999px';
  ghost.style.left = '-9999px';
  ghost.style.padding = '6px 14px';
  ghost.style.background = '#18181b';
  ghost.style.color = '#ffffff';
  ghost.style.borderRadius = '10px';
  ghost.style.fontSize = '12px';
  ghost.style.fontWeight = '600';
  ghost.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  ghost.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.4)';
  ghost.style.display = 'flex';
  ghost.style.alignItems = 'center';
  ghost.style.gap = '8px';
  ghost.style.zIndex = '999999';
  ghost.style.pointerEvents = 'none';

  const countText = itemIds.length > 1
    ? `📁 ${itemIds.length} вибраних закладок`
    : `🔖 ${item.title ? (item.title.length > 25 ? item.title.slice(0, 25) + '...' : item.title) : 'Закладка'}`;

  ghost.innerText = countText;
  document.body.appendChild(ghost);

  e.dataTransfer.setDragImage(ghost, 20, 20);

  setTimeout(() => {
    document.body.removeChild(ghost);
  }, 0);
}
