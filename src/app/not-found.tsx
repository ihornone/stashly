import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/ui/brand-logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="flex flex-col items-center max-w-md space-y-6">
        <BrandLogo className="size-12" />
        
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-primary">404</h1>
          <h2 className="text-2xl font-bold tracking-tight">Сторінку не знайдено</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Можливо, посилання застаріло, було видалено або адресу введено з помилкою.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button asChild variant="default" className="rounded-xl gap-2 font-medium">
            <Link href="/app">
              <Home className="size-4" />
              До закладок
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl gap-2 font-medium">
            <Link href="/">
              <ArrowLeft className="size-4" />
              На головну
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
