import type { Metadata, Viewport } from 'next';
import '@/index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || 'https://stashly.ihornone.site'),
  title: 'Stashly — Сучасний та швидкий менеджер закладок',
  description: 'Зберігайте, структуруйте за допомогою вкладених тегів та швидко знаходьте потрібні веб-посилання.',
  applicationName: 'Stashly',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stashly',
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand-icon.png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
    other: [
      { rel: 'mask-icon', url: '/brand-icon.png' },
    ],
  },
  openGraph: {
    title: 'Stashly — Сучасний та швидкий менеджер закладок',
    description: 'Зберігайте, структуруйте за допомогою вкладених тегів та швидко знаходьте потрібні веб-посилання.',
    url: 'https://stashly.ihornone.site',
    siteName: 'Stashly',
    images: [
      {
        url: '/other/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Stashly — Менеджер закладок',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stashly — Сучасний та швидкий менеджер закладок',
    description: 'Зберігайте, структуруйте за допомогою вкладених тегів та швидко знаходьте потрібні веб-посилання.',
    images: ['/other/og-image.png'],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import { ClerkProvider } from '@clerk/nextjs';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-primary/20" suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            elements: {
              avatarBox: '!rounded-lg',
              avatarImage: '!rounded-lg',
              userButtonAvatarBox: '!rounded-lg',
              userButtonAvatarImage: '!rounded-lg',
              userButtonTrigger: '!rounded-lg',
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PwaProvider>
              {children}
            </PwaProvider>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

