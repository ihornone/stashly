'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from '@/components/Link';
import { cn, isNavLinkActive } from '@/lib/utils';

export interface MenuItem {
  title: string;
  href: string;
  isLink?: boolean;
}

export interface NavigationProps {
  menuItems?: MenuItem[];
}

export const defaultLandingNavItems: MenuItem[] = [
  {
    title: 'Можливості',
    href: '/#features',
    isLink: true,
  },
  {
    title: 'Переваги',
    href: '/#items',
    isLink: true,
  },
  {
    title: 'Часті запитання',
    href: '/#faq',
    isLink: true,
  },
  {
    title: 'Документація',
    href: '/docs/getting-started/introduction',
    isLink: true,
  },
];

export default function Navigation({
  menuItems = defaultLandingNavItems,
}: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex" aria-label="Основна навігація">
      <ul className="flex items-center gap-0.5 p-0.5 rounded-xl bg-muted/30 border border-border/40">
        {menuItems.map((item, index) => {
          const isActive = isNavLinkActive(pathname, item.href);
          return (
            <li key={index}>
              <Link
                href={item.href}
                className={cn(
                  'inline-flex h-7 items-center justify-center rounded-lg px-3 text-xs font-medium transition-all outline-none',
                  isActive
                    ? 'bg-accent text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
