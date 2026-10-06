'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/features/tags';
import { EditItemDialog } from '@/features/bookmarks';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDefaultLayout, usePanelCallbackRef } from 'react-resizable-panels';
import { useIsMobile } from '@/lib/hooks';

export const SidebarPanelContext = React.createContext<{
  panelRef: any;
}>({
  panelRef: null,
});

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'dashboard-layout',
  });
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  const contextValue = React.useMemo(() => ({ panelRef }), [panelRef]);

  return (
    <SidebarPanelContext.Provider value={contextValue}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '100%',
          } as React.CSSProperties
        }
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="fixed w-full"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          {isMobile ? (
            <AppSidebar />
          ) : (
            <ResizablePanel
              minSize="280px"
              maxSize="40%"
              defaultSize="340px"
              collapsible={true}
              groupResizeBehavior="preserve-pixel-size"
              panelRef={setPanelRef}
            >
              <AppSidebar />
            </ResizablePanel>
          )}
          <ResizablePanel>
            <main className="@container/main h-full">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarProvider>
      <EditItemDialog />
    </SidebarPanelContext.Provider>
  );
}
