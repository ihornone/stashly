import { Sparkles, Wand2 } from 'lucide-react'
import { brandTileStyle, mutedLabel, skeletonHigh, skeletonMid } from './styles'

export function ExtractVisual() {
  const metaField = (widthTitle: string, widthDesc: string, badgeWidth = '32px') => (
    <div
      className="flex items-center gap-2.5 rounded-[9px] border border-blue-500/20 bg-blue-500/10 px-2.5 py-2.5"
    >
      <span
        className="grid size-4 flex-none place-items-center rounded-[4px] bg-[#0062ff] shadow-[0_0_10px_rgba(0,98,255,0.5)]"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="block h-2 rounded-full" style={{ width: widthTitle, ...skeletonHigh }} />
        <span className="block h-1.5 rounded-full" style={{ width: widthDesc, ...skeletonMid }} />
      </div>
      <span className="block h-3.5 rounded-md bg-emerald-500/20" style={{ width: badgeWidth }} />
    </div>
  )

  return (
    <div className="relative mt-6 flex min-h-[236px] flex-1 flex-col justify-end overflow-hidden px-[30px]">
      <div
        className="rounded-t-[12px] border border-b-0 px-3 pt-3"
        style={{
          borderColor: 'color-mix(in oklch,var(--border) 30%,transparent)',
          background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
          boxShadow: '0 -24px 60px color-mix(in oklch,var(--foreground) 15%,transparent)',
        }}
      >
        <div
          className="flex items-center gap-2 pb-2.5 text-[11px] font-semibold tracking-wide uppercase"
          style={mutedLabel}
        >
          <Sparkles className="size-3 text-blue-400" />
          <span>Парсинг OpenGraph &amp; Метаданих</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {metaField('75%', '55%', '28px')}
          {metaField('85%', '65%', '28px')}
          {metaField('60%', '40%', '42px')}
        </div>
        <div className="mt-3 flex items-center gap-3 pb-4">
          <span
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-semibold text-white"
            style={brandTileStyle}
          >
            <Wand2 className="size-3.5" />
            Оновити дані
          </span>
          <span
            className="text-[11px]"
            style={mutedLabel}
          >
            Миттєве автозаповнення
          </span>
        </div>
      </div>
    </div>
  )
}
