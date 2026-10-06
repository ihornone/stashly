import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing';

export const metadata: Metadata = {
  title: 'Stashly — Сучасний та швидкий менеджер закладок',
  description: 'Менеджер закладок для розробників, дослідників та всіх, хто цінує порядок. Швидкий повнотекстовий пошук, вкладені теги та 100% приватність.',
};

export default function HomePage() {
  return <LandingPage />;
}
