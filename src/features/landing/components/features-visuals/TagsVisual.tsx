import { Hash, Pin } from 'lucide-react'
import { mutedLabel, skeletonHigh, skeletonMid } from './styles'

export function TagsVisual() {
  const tagItem = ({
    width,
    dot,
    indent = 0,
    count,
    active = false,
    pin = false,
  }: {
    width: string
    dot: string
    indent?: number
    count?: string
    active?: boolean
    pin?: boolean
  }) => (
    <div
      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 transition-all"
      style={{
        marginLeft: indent,
        ...(active
          ? { background: 'rgba(0,98,255,.12)', border: '1px solid rgba(0,98,255,.30)' }
          : { border: '1px solid transparent' }),
      }}
    >
      {pin ? (
        <Pin className="size-3 flex-none -rotate-45" style={{ color: '#6ea8fe' }} />
      ) : (
        <span className="size-2 flex-none rounded-full shadow-xs" style={{ background: dot }} />
      )}
      <Hash className="size-3 flex-none opacity-40" />
      <span
        className="block h-2 rounded-full"
        style={{
          width,
          ...(active ? skeletonHigh : skeletonMid),
        }}
      />
      <span className="flex-1" />
      {count && (
        <span
          className="rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium"
          style={{
            ...mutedLabel,
            background: 'color-mix(in oklch,var(--foreground) 8%,transparent)',
          }}
        >
          {count}
        </span>
      )}
    </div>
  )

  return (
    <div className="relative mt-6 flex min-h-[206px] flex-1 flex-col justify-end overflow-hidden pr-[30px] pl-[30px]">
      <div
        className="overflow-hidden rounded-t-[12px] border border-b-0 px-2.5 pt-3"
        style={{
          borderColor: 'color-mix(in oklch,var(--border) 30%,transparent)',
          background: 'color-mix(in oklch,var(--foreground) 5%,var(--background))',
          boxShadow: '0 -24px 60px color-mix(in oklch,var(--foreground) 15%,transparent)',
        }}
      >
        <div
          className="flex items-center gap-2 px-2.5 pb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={mutedLabel}
        >
          <Pin className="size-3 -rotate-45 text-blue-400" />
          <span>Закріплені теги</span>
        </div>
        {tagItem({ width: '70px', dot: '#f0a868', count: '128', pin: true })}
        <div
          className="my-1.5 h-px"
          style={{ background: 'color-mix(in oklch,var(--border) 20%,transparent)' }}
        />
        {tagItem({ width: '65px', dot: '#6ea8fe', count: '94', active: true })}
        {tagItem({ width: '54px', dot: '#7ee787', indent: 18, count: '37' })}
        {tagItem({ width: '60px', dot: '#d2a8ff', indent: 18, count: '21' })}
        {tagItem({ width: '75px', dot: '#ff7b9c', count: '210' })}
      </div>
    </div>
  )
}
