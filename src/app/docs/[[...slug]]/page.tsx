import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { allDocs } from '@/data/docs';
import { DocsPage } from '@/features/docs';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalized = slug ? slug.join('/') : 'getting-started/introduction';
  const doc = allDocs.find((d) => d.slug === normalized);

  if (!doc) {
    return { title: 'Документація — Stashly' };
  }

  return {
    title: `${doc.title} — Stashly`,
    description: doc.description,
  };
}

export default async function DocsCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const normalized = slug ? slug.join('/') : 'getting-started/introduction';

  // Exact match or legacy short slug (e.g. /docs/introduction) — otherwise 404
  const exists =
    allDocs.some((d) => d.slug === normalized) ||
    allDocs.some((d) => d.slug.endsWith(`/${normalized}`)) ||
    normalized === 'getting-started/introduction';
  if (!exists) {
    notFound();
  }

  return <DocsPage activeSlug={normalized} />;
}
