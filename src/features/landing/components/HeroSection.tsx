import { type VariantProps } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'
import { ReactNode } from 'react'

import siteConfig from '@/data/siteMetadata'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Glow from '@/components/ui/glow'
import { Mockup, MockupFrame } from '@/components/ui/mockup'
import Screenshot from '@/components/ui/screenshot'
import { Section } from '@/components/ui/section'

interface HeroButtonProps {
  href: string
  text: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  icon?: ReactNode
  iconRight?: ReactNode
}

interface HeroProps {
  title?: string
  description?: ReactNode | string
  mockup?: ReactNode | false
  badge?: ReactNode | false
  buttons?: HeroButtonProps[] | false
  className?: string
}

export default function Hero({
  title = 'Зберігайте будь-які сторінки. Організовуйте з легкістю.',
  description = (
    <>
      Stashly — це швидкий та сучасний менеджер закладок для структурованого збереження інформації.
      Підтримка деревоподібних тегів, автоматичний парсинг метаданих та зручний пошук.
    </>
  ),
  mockup = (
    <Screenshot
      srcLight="/other/screenshot-list-desktop.png"
      srcDark="/other/screenshot-list-desktop.png"
      alt="Stashly application screenshot"
      width={3204}
      height={1854}
      className="w-full"
      preload
      sizes="(max-width: 1280px) 100vw, 1280px"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">Новинка</span>
      <a href="/#features" className="flex items-center gap-1">
        Вкладені теги та миттєвий пошук
      </a>
    </Badge>
  ),
  buttons = [
    {
      href: `/app`,
      text: 'Спробувати безкоштовно',
      variant: 'default',
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section className={cn('fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0', className)}>
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-10 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground xs:text-4xl selection:bg-muted selection:text-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-[2rem] leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-5xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl xl:text-7xl">
            {title}
          </h1>
          <div className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] space-y-5 font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </div>
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button key={index} variant={button.variant || 'default'} size="lg" asChild>
                  <a href={button.href}>
                    {button.icon}
                    {button.text}
                    {button.iconRight}
                  </a>
                </Button>
              ))}
            </div>
          )}
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame className="animate-appear opacity-0 delay-700" size="small">
                <Mockup type="responsive" className="bg-background/90 w-full rounded-xl border-0">
                  {mockup}
                </Mockup>
              </MockupFrame>
              <Glow variant="top" className="animate-appear-zoom opacity-0 delay-1000" />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
