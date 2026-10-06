import { Bookmark } from 'lucide-react'
import { brandTileStyle, mutedLabel, skeletonHigh, skeletonLow, skeletonMid } from './styles'

export function TypesVisual() {
  const chip = (width: string, color: string) => (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1"
      style={{
        background: 'color-mix(in oklch, var(--foreground) 6%, transparent)',
        border: '1px solid color-mix(in oklch, var(--border) 20%, transparent)',
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      <span className="h-1.5 rounded-full" style={{ width, ...skeletonMid }} />
    </span>
  )

  const rows = [
    { titleWidth: '70%', urlWidth: '45%', tagWidth: '32px', tagColor: '#38bdf8', dateWidth: '36px', fav: '▲', favBg: '#000', active: true },
    { titleWidth: '58%', urlWidth: '50%', tagWidth: '40px', tagColor: '#a855f7', dateWidth: '30px', fav: '✦', favBg: '#0ea5e9' },
    { titleWidth: '64%', urlWidth: '40%', tagWidth: '36px', tagColor: '#22c55e', dateWidth: '44px', fav: '✱', favBg: '#10b981' },
    { titleWidth: '50%', urlWidth: '42%', tagWidth: '40px', tagColor: '#a855f7', dateWidth: '38px', fav: '❖', favBg: '#f43f5e' },
  ]

  return (
    <div className="relative mt-6 flex min-h-[206px] flex-1 flex-col justify-end overflow-hidden pr-[30px] pl-[30px]">
      <div
        className="overflow-hidden rounded-t-[12px] border border-b-0"
        style={{
          borderColor: 'color-mix(in oklch,var(--border) 30%,transparent)',
          background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
          boxShadow: '0 -24px 60px color-mix(in oklch,var(--foreground) 15%,transparent)',
        }}
      >
        {/* Header row */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-semibold"
          style={{
            color: 'var(--foreground)',
            borderBottom: '1px solid color-mix(in oklch,var(--border) 20%,transparent)',
          }}
        >
          <span className="grid size-6 place-items-center rounded-[7px] text-white" style={brandTileStyle}>
            <Bookmark className="size-3.5" />
          </span>
          <span>Всі закладки</span>
          <span
            className="rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium"
            style={{ ...mutedLabel, background: 'color-mix(in oklch,var(--foreground) 8%,transparent)' }}
          >
            142
          </span>
          <span className="flex-1" />
          <div
            className="flex items-center gap-1.5 rounded-lg border p-0.5 text-[10px]"
            style={{
              borderColor: 'color-mix(in oklch,var(--border) 20%,transparent)',
              background: 'color-mix(in oklch,var(--foreground) 5%,transparent)',
              color: 'color-mix(in oklch,var(--foreground) 40%,transparent)',
            }}
          >
            <span
              className="rounded px-1.5 py-0.5 font-medium"
              style={{ background: 'color-mix(in oklch,var(--foreground) 12%,transparent)', color: 'var(--foreground)' }}
            >
              Таблиця
            </span>
            <span className="px-1.5 py-0.5">Сітка</span>
            <span className="px-1.5 py-0.5">Список</span>
          </div>
        </div>
        {/* Column headers */}
        <div
          className="grid items-center gap-3 px-3.5 py-2 text-[10px] font-semibold tracking-wide uppercase"
          style={{
            gridTemplateColumns: '1.4fr 1fr 90px 75px',
            ...mutedLabel,
            borderBottom: '1px solid color-mix(in oklch,var(--border) 15%,transparent)',
          }}
        >
          <span>Назва</span>
          <span>Домен</span>
          <span>Тег</span>
          <span className="text-right">Збережено</span>
        </div>
        {/* Data rows */}
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid items-center gap-3 px-3.5 py-2.5 transition-colors"
            style={{
              gridTemplateColumns: '1.4fr 1fr 90px 75px',
              background: row.active ? 'rgba(0,98,255,.08)' : undefined,
              borderBottom: index < rows.length - 1
                ? '1px solid color-mix(in oklch,var(--border) 12%,transparent)'
                : undefined,
            }}
          >
            <span className="flex items-center gap-2.5 overflow-hidden">
              <span
                className="flex size-5 flex-none items-center justify-center rounded-[5px] text-[10px] font-bold text-white shadow-xs"
                style={{ background: row.favBg }}
              >
                {row.fav}
              </span>
              <span className="block h-2 rounded-full" style={{ width: row.titleWidth, ...skeletonHigh }} />
            </span>
            <span className="block h-1.5 rounded-full" style={{ width: row.urlWidth, ...skeletonMid }} />
            <span>{chip(row.tagWidth, row.tagColor)}</span>
            <span className="flex justify-end">
              <span className="block h-1.5 rounded-full" style={{ width: row.dateWidth, ...skeletonLow }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
