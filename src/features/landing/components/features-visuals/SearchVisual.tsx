import { Search } from 'lucide-react'
import { skeletonHigh, skeletonMid } from './styles'

export function SearchVisual() {
  const result = (active = false, widths?: { title: string; desc: string }) => (
    <div
      className="flex items-center gap-2.5 px-3.5 py-[11px]"
      style={active ? { background: 'rgba(0,98,255,.08)' } : undefined}
    >
      <span
        className="size-6 flex-none rounded-[6px]"
        style={{
          background: active
            ? 'radial-gradient(120% 120% at 50% 20%,#4f93ff,#0062ff)'
            : 'color-mix(in oklch,var(--foreground) 10%,transparent)',
        }}
      />
      <span className="flex-1">
        <span
          className="block h-[7px] rounded"
          style={{ width: widths?.title || '68%', ...skeletonHigh }}
        />
        <span
          className="mt-1.5 block h-[5px] rounded"
          style={{ width: widths?.desc || '43%', ...skeletonMid }}
        />
      </span>
    </div>
  )

  return (
    <div className="relative flex min-h-[268px] flex-1 items-center justify-center px-6 pt-6">
      <div className="w-full">
        <div
          className="text-foreground flex h-11 items-center gap-2.5 rounded-[11px] px-3.5"
          style={{
            border: '1px solid rgba(0,98,255,.3)',
            background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
            boxShadow: '0 0 0 4px rgba(0,98,255,.08),0 18px 40px color-mix(in oklch,var(--foreground) 15%,transparent)',
          }}
        >
          <Search className="size-4" style={{ color: '#6ea8fe' }} />
          <span className="text-sm font-medium">
            React UI компоненти та дизайн-системи
            <span
              className="ml-px inline-block h-[15px] w-px align-[-2px]"
              style={{ background: '#6ea8fe' }}
            />
          </span>
        </div>
        <div
          className="mt-2 overflow-hidden rounded-[11px]"
          style={{
            border: '1px solid color-mix(in oklch,var(--border) 25%,transparent)',
            background: 'color-mix(in oklch,var(--foreground) 4%,var(--background))',
          }}
        >
          {result(true, { title: '72%', desc: '46%' })}
          {result(false, { title: '60%', desc: '40%' })}
          {result(false, { title: '80%', desc: '52%' })}
        </div>
      </div>
    </div>
  )
}
