'use client';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { preferencesStore } from '@/store/preferencesStore';
import { mainStore } from '@/store/mainStore';
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useItemListState } from '@/features/bookmarks';

export const NavMain = observer(
  ({ allItemCount, untaggedItemCount }: { allItemCount: number; untaggedItemCount: number }) => {
    const store = mainStore;
    const prefStore = preferencesStore;
    const { isMobile, toggleSidebar } = useSidebar();
    const { setTagFilter } = useItemListState();

    const setAllTags = () => {
      setTagFilter(null);
      if (isMobile) {
        toggleSidebar();
      }
    };

    const setWithoutTags = () => {
      setTagFilter('none');
      if (isMobile) {
        toggleSidebar();
      }
    };

    const navLinks = [
      {
        title: 'Всі закладки',
        onClick: setAllTags,
        isSelected: store.tagFilter === null,
        badge: allItemCount,
      },
      {
        title: 'Без тегів',
        onClick: setWithoutTags,
        isSelected: store.tagFilter === 'none',
        badge: untaggedItemCount,
      },
    ];

    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton
                  tooltip={link.title}
                  onClick={link.onClick}
                  isActive={link.isSelected}
                  className={'min-w-8 duration-200 ease-linear'}
                >
                  <span>{link.title}</span>
                </SidebarMenuButton>
                {prefStore.displaySidebarTagItemCounts && <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
);
