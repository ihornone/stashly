import { useIsMobile } from '@/lib/hooks';
import { useContext } from 'react';
import { SidebarPanelContext } from '../DashboardLayout';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ButtonSeparator = () => <Separator orientation="vertical" className="hidden sm:block mx-1 data-[orientation=vertical]:h-8" />;
export const SidebarToggler = () => {
  const isMobile = useIsMobile();
  const { panelRef } = useContext(SidebarPanelContext);

  if (isMobile) {
    return (
      <>
        <SidebarTrigger />
        <ButtonSeparator />
      </>
    );
  }

  if (panelRef) {
    return (
      <>
        <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          onClick={() => (panelRef.isCollapsed() ? panelRef.expand() : panelRef.collapse())}
        >
          <PanelLeftIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <ButtonSeparator />
      </>
    );
  }
  return null;
};
