import { Suspense } from 'react';
import { EditItemView } from '@/features/bookmarks';
import { Spinner } from '@/components/ui/spinner';

export const dynamic = 'force-dynamic';

export default function EditItemPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </div>
      }
    >
      <EditItemView />
    </Suspense>
  );
}
