import type { MetadataRoute } from 'next';
import { serverSupabase } from '@/lib/supabase';

const SITE = 'https://danceisasport.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/onboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const sb = serverSupabase();
    const { data } = await sb
      .from('dancers')
      .select('handle, created_at')
      .eq('is_published', true)
      .limit(5000);
    const dancers: MetadataRoute.Sitemap = ((data as { handle: string; created_at: string }[] | null) || []).map(
      (d) => ({
        url: `${SITE}/${d.handle}`,
        lastModified: new Date(d.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }),
    );
    return [...staticRoutes, ...dancers];
  } catch (e) {
    console.warn('sitemap fetch failed:', e);
    return staticRoutes;
  }
}
