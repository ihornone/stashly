import { CSSProperties } from 'react'

export const cardStyle: CSSProperties = {
  borderColor: 'color-mix(in oklch, var(--border) 40%, transparent)',
  background:
    'linear-gradient(180deg, color-mix(in oklch, var(--foreground) 3%, var(--background)), var(--background))',
}

/** Skeleton / bar placeholder — adapts to both themes */
export const skeletonHigh: CSSProperties = {
  background: 'color-mix(in oklch, var(--foreground) 22%, transparent)',
}
export const skeletonMid: CSSProperties = {
  background: 'color-mix(in oklch, var(--foreground) 13%, transparent)',
}
export const skeletonLow: CSSProperties = {
  background: 'color-mix(in oklch, var(--foreground) 8%, transparent)',
}

/** Muted label color — adapts to both themes */
export const mutedLabel: CSSProperties = {
  color: 'color-mix(in oklch, var(--foreground) 45%, transparent)',
}

export const tileStyle: CSSProperties = {
  border: '1px solid color-mix(in oklch, var(--border) 14%, transparent)',
  background: 'color-mix(in oklch, var(--foreground) 5%, var(--background))',
  boxShadow: '0 10px 26px color-mix(in oklch, var(--foreground) 12%, transparent)',
}

export const brandTileStyle: CSSProperties = {
  background: 'radial-gradient(120% 120% at 50% 22%, #4f93ff, #0062ff 72%)',
  boxShadow: '0 0 48px 7px rgba(0,98,255,.48), inset 0 1px 0 rgba(255,255,255,.25)',
}
