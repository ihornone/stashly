import { Search } from 'lucide-react'

export function PhoneVisual() {
  const ThumbnailSVG = ({ idx }: { idx: 0 | 1 }) => (
    <svg
      width="58"
      height="42"
      viewBox="0 0 58 42"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`thumbSky${idx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={idx === 0 ? '#6db7ff' : '#ffd28a'} />
          <stop offset="1" stopColor={idx === 0 ? '#cfe8ff' : '#ffeccf'} />
        </linearGradient>
      </defs>
      <rect width="58" height="42" fill={`url(#thumbSky${idx})`} />
      {idx === 0 ? (
        <>
          <circle cx="46" cy="11" r="5" fill="#ffe08a" />
          <path d="M0 31 L20 19 L40 31 Z" fill="#7fae6b" />
          <rect y="31" width="58" height="11" fill="#5f9150" />
          <path d="M14 32 L24 24 L34 32 Z" fill="#c9573f" />
          <rect x="17" y="31" width="14" height="11" fill="#e8c9a0" />
          <rect x="21" y="34" width="5" height="8" fill="#7a5230" />
        </>
      ) : (
        <>
          <circle cx="29" cy="16" r="6" fill="#ff9b5c" />
          <path d="M0 30 L16 16 L30 30 Z" fill="#6f8fa8" />
          <path d="M22 30 L40 12 L58 30 Z" fill="#566f86" />
          <rect y="30" width="58" height="12" fill="#3f7a52" />
          <path d="M0 30 Q14 24 30 30 T58 30 V42 H0 Z" fill="#4a9162" />
        </>
      )}
    </svg>
  )

  const listItem = (idx: 0 | 1) => (
    <div key={idx} style={{ display: 'flex', gap: '10px', padding: '12px 2px' }}>
      <span
        style={{
          width: '58px',
          height: '42px',
          borderRadius: '8px',
          flex: 'none',
          overflow: 'hidden',
          position: 'relative' as const,
        }}
      >
        <ThumbnailSVG idx={idx} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            width: idx === 0 ? '88%' : '82%',
            height: '7px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,.34)',
          }}
        />
        <span
          style={{
            display: 'block',
            marginTop: '5px',
            width: idx === 0 ? '54%' : '46%',
            height: '7px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,.34)',
          }}
        />
        <span
          style={{
            display: 'block',
            marginTop: '8px',
            width: idx === 0 ? '64%' : '58%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(110,168,254,.5)',
          }}
        />
      </span>
    </div>
  )

  return (
    <div className="relative mt-6 min-h-[268px] flex-1 overflow-hidden">
      <div
        className="absolute bottom-[-50px] left-1/2 w-[236px] -translate-x-1/2 rounded-[34px] p-2"
        style={{
          background: '#0a0a0d',
          boxShadow: '0 0 0 3px rgba(255,255,255,.06),0 24px 50px rgba(0,0,0,.55)',
        }}
      >
        <div className="overflow-hidden rounded-[27px]" style={{ background: '#121217' }}>
          <div
            className="flex items-center justify-between px-[18px] pt-[11px] pb-1.5 text-[11px] font-semibold"
            style={{ color: 'rgba(255,255,255,.8)' }}
          >
            <span>9:41</span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px 12px' }}
          >
            <span
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '26px',
                padding: '0 8px',
                borderRadius: '7px',
                background: 'rgba(255,255,255,.07)',
                color: 'rgba(255,255,255,.4)',
              }}
            >
              <Search className="size-[12px] flex-none" />
              <span style={{ fontSize: '11px', fontWeight: 500 }}>Пошук…</span>
            </span>
          </div>
          <div className="px-3 pb-3">
            {listItem(0)}
            {listItem(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
