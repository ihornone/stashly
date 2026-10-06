import { ArrowRightIcon } from 'lucide-react'

import siteConfig from '@/data/siteMetadata'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import Glow from '@/components/ui/glow'
import { Section } from '@/components/ui/section'

import Link from 'next/link'

interface ClosingCtaProps {
  title?: string
  description?: string
  className?: string
}

export default function ClosingCta({
  title = 'Готові впорядкувати свої закладки?',
  description = 'Спробуйте зручне збереження та організацію ваших посилань прямо зараз.',
  className,
}: ClosingCtaProps) {
  return (
    <Section className={cn('group relative overflow-hidden', className)} id="get-started">
      <div className="max-w-container relative z-10 mx-auto flex flex-col items-center gap-6 text-center sm:gap-8">
        <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
          {title}
        </h2>
        <p className="text-md text-muted-foreground max-w-[600px] font-medium text-balance sm:text-xl">
          {description}
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button variant="default" size="lg" asChild>
            <Link href="/app">
              Спробувати безкоштовно
            </Link>
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">
            <span className="font-semibold">Цікавлять деталі?</span> Ознайомтеся з{' '}
            <Link href="/docs/getting-started/introduction" className="text-foreground underline">
              документацією
            </Link>
          </p>
        </div>
      </div>
      <div className="absolute top-0 left-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <Glow variant="bottom" />
      </div>
    </Section>
  )
}
