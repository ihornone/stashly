import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <div data-slot="brand-logo" className={cn('flex items-center gap-2', className)} {...props}>
      <Image src={siteMetadata.siteLogo} width={26} height={26} alt="Stashly logo" className="shrink-0 size-[26px]" />
      <span className="text-sm font-semibold tracking-tight text-foreground">{siteMetadata.headerTitle}</span>
    </div>
  )
}
