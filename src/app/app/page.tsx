import { Suspense } from 'react';
import { BookmarksDashboard } from '@/features/bookmarks';
import { Spinner } from '@/components/ui/spinner';

export const dynamic = 'force-dynamic';

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </div>
      }
    >
      <BookmarksDashboard />
    </Suspense>
  );
}
