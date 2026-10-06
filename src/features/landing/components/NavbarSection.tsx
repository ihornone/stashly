'use client'

import { type VariantProps } from 'class-variance-authority'
import { ArrowRight, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { cn, isNavLinkActive } from '@/lib/utils'

import { Button, buttonVariants } from '@/components/ui/button'
import Navigation, { defaultLandingNavItems } from '@/components/ui/navigation'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import BrandLogo from '@/components/ui/brand-logo'
import Link from '@/components/Link'
import { Show } from '@clerk/nextjs'
import { UserDropdown } from '@/components/UserDropdown'

export interface NavbarLink {
  text: string
  href: string
}

export interface NavbarActionProps {
  text: string
  href: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  icon?: ReactNode
  iconRight?: ReactNode
  isButton?: boolean
}

export interface NavbarProps {
  homeUrl?: string
  mobileLinks?: NavbarLink[]
  actions?: NavbarActionProps[]
  showNavigation?: boolean
  customNavigation?: ReactNode
  className?: string
}

export default function Navbar({
  homeUrl = '/',
  mobileLinks = defaultLandingNavItems.map((item) => ({
    text: item.title,
    href: item.href,
  })),
  actions = [
    {
      text: 'Відкрити додаток',
      href: '/app',
      isButton: true,
      variant: 'default',
    },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  const pathname = usePathname()

  return (
    <header className={cn('sticky top-0 z-50 px-4 pt-2.5 pb-1 transition-all', className)}>
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-center justify-between rounded-2xl border border-border/60 bg-background/85 px-3 py-1.5 backdrop-blur-xl shadow-md shadow-black/5 dark:border-white/10 dark:shadow-primary/5 transition-all">
          {/* Brand Logo */}
          <div className="flex items-center pl-1">
            <Link href={homeUrl} className="transition-opacity hover:opacity-85 flex items-center">
              <BrandLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <div className="hidden md:flex items-center justify-center">
              {customNavigation || <Navigation />}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 pr-0.5">
            <Show when="signed-out">
              <Button
                size="sm"
                variant="ghost"
                className="h-7.5 rounded-xl px-3 text-xs font-medium hover:bg-muted"
                asChild
              >
                <Link href="/sign-in">Увійти</Link>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="h-7.5 rounded-xl px-3.5 text-xs font-medium shadow-xs hover:shadow-sm hover:shadow-primary/20 transition-all"
                asChild
              >
                <Link href="/sign-up">Реєстрація</Link>
              </Button>
            </Show>

            <Show when="signed-in">
              <Button
                size="sm"
                variant="default"
                className="h-7.5 rounded-xl px-3.5 text-xs font-medium shadow-xs hover:shadow-sm hover:shadow-primary/20 transition-all hidden sm:inline-flex"
                asChild
              >
                <Link href="/app">
                  <span>Відкрити додаток</span>
                </Link>
              </Button>
              <div className="flex items-center">
                <UserDropdown />
              </div>
            </Show>

            {/* Mobile Navigation Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7.5 rounded-xl md:hidden text-muted-foreground hover:text-foreground"
                >
                  <Menu className="size-4" />
                  <span className="sr-only">Відкрити меню навігації</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 flex flex-col justify-between">
                <div>
                  <SheetTitle className="text-left mb-6">
                    <Link href={homeUrl} className="flex items-center gap-2">
                      <BrandLogo />
                    </Link>
                  </SheetTitle>
                  <nav className="flex flex-col gap-2">
                    {mobileLinks.map((link, index) => {
                      const isActive = isNavLinkActive(pathname, link.href)
                      return (
                        <Link
                          key={index}
                          href={link.href}
                          className={cn(
                            'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          {link.text}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <div className="pt-6 border-t border-border/50 flex flex-col gap-2.5">
                  <Show when="signed-out">
                    <Button variant="outline" className="w-full rounded-lg" asChild>
                      <Link href="/sign-in" className="flex items-center justify-center">
                        Увійти
                      </Link>
                    </Button>
                    <Button className="w-full rounded-lg" asChild>
                      <Link href="/sign-up" className="flex items-center justify-center">
                        Реєстрація
                      </Link>
                    </Button>
                  </Show>
                  <Show when="signed-in">
                    <Button className="w-full rounded-lg" asChild>
                      <Link href="/app" className="flex items-center justify-center">
                        <span>Відкрити додаток</span>
                      </Link>
                    </Button>
                  </Show>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
