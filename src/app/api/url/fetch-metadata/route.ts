import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRoute } from '@/server/api';
import { successResponse } from '@/server/auth';
import { scrapeUrlMetadata } from '@/server/scraper';

const metadataSchema = z.object({
  url: z.string().trim().min(1, 'URL is required'),
});

export async function POST(req: NextRequest) {
  return withAuthRoute(req, metadataSchema, async ({ body }) => {
    const metadata = await scrapeUrlMetadata(body.url);
    return successResponse('Metadata fetched successfully', metadata);
  });
}
