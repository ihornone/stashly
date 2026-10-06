import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShareRepository } from '@/server/repositories/shares';
import { SharedCategoryClient } from './SharedCategoryClient';
import { TagType, ItemType } from '@/lib/types';
export const dynamic = 'force-dynamic';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return { title: 'Категорію не знайдено — Stashly' };
  }

  const data = await ShareRepository.getSharedTagWithItems(id);
  if (!data) {
    return { title: 'Категорію не знайдено — Stashly' };
  }

  const count = data.items.length;
  const countText = `${count} ${count === 1 ? 'закладка' : count >= 2 && count <= 4 ? 'закладки' : 'закладок'}`;
  const title = `${data.tag.title} (${countText}) — Stashly`;
  const description = data.tag.description || `Публічна добірка з ${countText} у категорії «${data.tag.title}» на Stashly.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Stashly',
      images: [
        {
          url: '/other/og-image.png',
          width: 1280,
          height: 640,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/other/og-image.png'],
    },
  };
}

import { getAuthenticatedUserId } from '@/server/auth';

export default async function SharedCategoryPage({ params }: SharePageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const data = await ShareRepository.getSharedTagWithItems(id);
  if (!data) {
    notFound();
  }

  let comparison: any = null;
  try {
    const userId = await getAuthenticatedUserId();
    if (userId) {
      comparison = await ShareRepository.checkSharedTagComparison(id, userId);
    }
  } catch {
    // not authenticated
  }


  const tag: TagType = {
    id: data.tag.id,
    parent: data.tag.parent,
    title: data.tag.title,
    description: data.tag.description || '',
    color: data.tag.color || 'gray',
    pinned: Boolean(data.tag.pinned),
    created_at: data.tag.created_at || '',
    updated_at: data.tag.updated_at || null,
    fullPath: data.tag.title,
    fullPathIDs: String(data.tag.id),
  };

  const items: ItemType[] = data.items.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    description: item.description || '',
    comments: item.comments || '',
    image: item.image || '',
    tags: item.tags || [],
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
  }));

  return <SharedCategoryClient tag={tag} items={items} initialComparison={comparison} />;
}

