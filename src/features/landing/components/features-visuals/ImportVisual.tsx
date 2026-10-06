import { ArrowDownToLine } from 'lucide-react'
import { CSSProperties } from 'react'

export function ImportVisual() {
  const brandNode = (src: string, alt: string, style: CSSProperties) => (
    <div
      className="absolute grid place-items-center rounded-[14px]"
      style={{
        width: '50px',
        height: '50px',
        border: '1px solid color-mix(in oklch,var(--border) 25%,transparent)',
        background: 'color-mix(in oklch,var(--foreground) 7%,var(--background))',
        boxShadow: '0 8px 20px color-mix(in oklch,var(--foreground) 15%,transparent)',
        ...style,
      }}
    >
      <img src={src} alt={alt} width="26" height="26" style={{ display: 'block' }} />
    </div>
  )

  return (
    <div className="relative mt-6 flex min-h-[268px] flex-1 items-center justify-center overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        aria-hidden
      >
        <line x1="12" y1="24" x2="50" y2="50" stroke="rgba(0,98,255,.16)" strokeWidth="0.4" />
        <line x1="28" y1="15" x2="50" y2="50" stroke="rgba(0,98,255,.16)" strokeWidth="0.4" />
        <line x1="13" y1="73" x2="50" y2="50" stroke="rgba(0,98,255,.16)" strokeWidth="0.4" />
        <line x1="86" y1="23" x2="50" y2="50" stroke="rgba(0,98,255,.16)" strokeWidth="0.4" />
        <line x1="76" y1="72" x2="50" y2="50" stroke="rgba(0,98,255,.16)" strokeWidth="0.4" />
      </svg>
      {brandNode('https://api.iconify.design/logos:chrome.svg', 'Chrome', {
        left: '6%',
        top: '13%',
        transform: 'rotate(-9deg)',
      })}
      {brandNode('https://api.iconify.design/logos:firefox.svg', 'Firefox', {
        left: '22%',
        top: '4%',
        transform: 'rotate(6deg)',
        width: '46px',
        height: '46px',
      })}
      {brandNode('https://api.iconify.design/logos:safari.svg', 'Safari', {
        left: '7%',
        top: '60%',
        transform: 'rotate(8deg)',
        width: '46px',
        height: '46px',
      })}
      {brandNode('https://api.iconify.design/logos:microsoft-edge.svg', 'Edge', {
        left: '79%',
        top: '11%',
        transform: 'rotate(11deg)',
      })}
      {brandNode('https://api.iconify.design/simple-icons:pocket.svg?color=%23ef3f56', 'Pocket', {
        left: '68%',
        top: '58%',
        transform: 'rotate(-7deg)',
        width: '46px',
        height: '46px',
      })}
      <div
        className="absolute grid place-items-center rounded-[18px] text-white"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '64px',
          height: '64px',
          background: 'radial-gradient(140% 140% at 50% 0%,#4f93ff,#0062ff 72%)',
          boxShadow: '0 0 44px 6px rgba(0,98,255,.45),inset 0 1px 0 rgba(255,255,255,.25)',
        }}
      >
        <ArrowDownToLine className="size-7 stroke-[1.9]" />
      </div>
    </div>
  )
}
