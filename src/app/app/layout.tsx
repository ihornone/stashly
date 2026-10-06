import { DashboardLayout } from '@/features/tags';
import { Suspense } from 'react';
import Loading from './loading';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
