import { Bookmark, Globe, Share2 } from 'lucide-react'
import { brandTileStyle, tileStyle } from './styles'

export function CaptureVisual() {
  return (
    <div className="relative mt-5 min-h-[206px] flex-1">
      <div
        className="absolute top-1/2 right-[13%] left-[13%] h-px -translate-y-[0.5px]"
        style={{
          background:
            'linear-gradient(90deg,transparent,color-mix(in oklch,var(--border) 38%,transparent) 50%,transparent)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 size-[212px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: '1px solid rgba(0,98,255,.14)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: '1px solid rgba(0,98,255,.2)' }}
      />
      <div className="absolute inset-0 flex items-center justify-center gap-12">
        <div
          className="text-muted-foreground grid size-[62px] place-items-center rounded-[16px]"
          style={tileStyle}
        >
          <Globe className="size-6 stroke-[1.8]" />
        </div>
        <div
          className="grid size-[90px] place-items-center rounded-[24px] text-white"
          style={brandTileStyle}
        >
          <Bookmark className="size-[34px] stroke-[1.9]" />
        </div>
        <div
          className="text-muted-foreground grid size-[62px] place-items-center rounded-[16px]"
          style={tileStyle}
        >
          <Share2 className="size-[22px] stroke-[1.8]" />
        </div>
      </div>
    </div>
  )
}
