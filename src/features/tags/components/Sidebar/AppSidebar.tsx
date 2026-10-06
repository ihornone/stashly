'use client';
import * as React from 'react';

import { NavMain } from './NavMain';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { mainStore } from '@/store/mainStore';
import { observer } from 'mobx-react-lite';
import BrandLogo from '@/components/ui/brand-logo';
import { ThemeToggler } from './ThemeToggler';
import { NavTags } from './NavTags';
import { SettingsDialog } from './SettingsDialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Show } from '@clerk/nextjs';
import Link from 'next/link';
import { UserDropdown } from '@/components/UserDropdown';

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar = observer(({ ...props }: AppSidebarProps) => {
  const store = mainStore;
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const itemIDsByTagID = store.items.reduce((acc: Record<number, number[]>, item) => {
    if (item.id === undefined) return acc;
    if (item.tags && item.tags.length > 0) {
      for (const tagID of item.tags) {
        acc[tagID] = acc[tagID] || [];
        acc[tagID].push(item.id);
      }
    } else {
      acc[0] = acc[0] || [];
      acc[0].push(item.id); // Count items without tags under key '0'
    }
    return acc;
  }, {});

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex w-full items-center justify-between pl-2">
              <BrandLogo />
              <div className="ml-auto flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Налаштування, імпорт та експорт"
                >
                  <Settings />
                  <span className="sr-only">Налаштування</span>
                </Button>
                <ThemeToggler />
                <Show when="signed-in">
                  <div className="flex items-center pl-1">
                    <UserDropdown />
                  </div>
                </Show>
                <Show when="signed-out">
                  <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs font-medium" asChild>
                    <Link href="/sign-in">Вхід</Link>
                  </Button>
                </Show>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="no-scrollbar gap-0">
          <NavMain allItemCount={store.items.length} untaggedItemCount={itemIDsByTagID[0]?.length ?? 0} />
          <NavTags itemIDsByTagID={itemIDsByTagID} />
        </SidebarContent>
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
});
