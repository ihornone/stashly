import { AlertTriangle, ChevronRight } from 'lucide-react'
import { skeletonHigh, skeletonLow, skeletonMid } from './styles'

export function DuplicatesVisual() {
  const duplicateRows = [
    { widthTitle: '78%', widthSub: '38%', isDuplicate: true },
    { widthTitle: '64%', widthSub: '48%', isDuplicate: false },
    { widthTitle: '82%', widthSub: '32%', isDuplicate: false },
  ]

  return (
    <div className="relative flex min-h-[236px] flex-1 items-end justify-center px-6 pt-6 pb-3">
      <div
        className="w-full overflow-hidden rounded-[12px] border"
        style={{
          borderColor: 'color-mix(in oklch,var(--border) 30%,transparent)',
          background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
          boxShadow: '0 -24px 60px color-mix(in oklch,var(--foreground) 15%,transparent)',
        }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-[11px] pt-[13px]"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '-.005em',
            color: 'var(--foreground)',
            borderBottom: '1px solid color-mix(in oklch,var(--border) 20%,transparent)',
          }}
        >
          <AlertTriangle className="size-3.5 text-amber-400" />
          <span>Знайдено схожі посилання</span>
          <span className="flex-1" />
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-500 dark:text-amber-300">
            3 збіги
          </span>
        </div>
        <div className="flex flex-col gap-2 px-3 pt-2.5 pb-3">
          {duplicateRows.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-[9px] border px-2.5 py-2.5"
              style={{
                borderColor: 'color-mix(in oklch,var(--border) 20%,transparent)',
                background: 'color-mix(in oklch,var(--foreground) 3%,transparent)',
              }}
            >
              <div
                className="size-7 flex-none rounded-[6px]"
                style={{ background: 'color-mix(in oklch,var(--foreground) 8%,transparent)' }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="h-2 rounded-full" style={{ width: row.widthTitle, ...skeletonHigh }} />
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: row.isDuplicate ? '28%' : '24%',
                      background: row.isDuplicate ? 'rgba(239,68,68,.6)' : 'rgba(245,158,11,.6)',
                    }}
                  />
                  <div className="h-1.5 rounded-full" style={{ width: row.widthSub, ...skeletonMid }} />
                </div>
              </div>
              <ChevronRight
                className="size-3.5 flex-none"
                style={{ color: 'color-mix(in oklch,var(--foreground) 20%,transparent)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
