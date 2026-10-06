import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}
