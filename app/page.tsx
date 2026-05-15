import Nav from '@/components/Nav';
import Particles from '@/components/Particles';
import Hero from '@/components/landing/Hero';
import SocialProofMarquee from '@/components/landing/SocialProofMarquee';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturedProfiles, { FeaturedDancer } from '@/components/landing/FeaturedProfiles';
import MerchCTA from '@/components/landing/MerchCTA';
import VideoFeedPreview, { FeedVideo } from '@/components/landing/VideoFeedPreview';
import Footer from '@/components/landing/Footer';
import { serverSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getFeaturedDancers(): Promise<FeaturedDancer[]> {
  try {
    const sb = serverSupabase();
    const { data, error } = await sb
      .from('dancers')
      .select('id, handle, display_name, location, avatar_url, dancer_styles(style_name), dancer_reviews(rating)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error || !data) {
      console.error('getFeaturedDancers error:', JSON.stringify(error));
      return [];
    }
    return data.map((row: Record<string, unknown>) => {
      const styles = (row.dancer_styles as { style_name: string }[]) || [];
      const reviews = (row.dancer_reviews as { rating: number | null }[]) || [];
      const ratingAvg =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length
          : 4.9;
      return {
        id: row.id as string,
        handle: row.handle as string,
        display_name: row.display_name as string,
        location: (row.location as string | null) ?? null,
        avatar_url: (row.avatar_url as string | null) ?? null,
        top_style: styles[0]?.style_name ?? null,
        rating: Number(ratingAvg.toFixed(1)),
      };
    });
  } catch (e) {
    console.error('getFeaturedDancers threw:', e);
    return [];
  }
}

async function getFeedVideos(): Promise<FeedVideo[]> {
  try {
    const sb = serverSupabase();
    const { data, error } = await sb
      .from('dancer_media')
      .select('id, url, dancers!inner(handle, display_name, is_published)')
      .eq('media_type', 'video')
      .eq('dancers.is_published', true)
      .limit(6);
    if (error || !data) {
      console.error('getFeedVideos error:', JSON.stringify(error));
      return [];
    }
    return data
      .map((row: Record<string, unknown>) => {
        const d = row.dancers as { handle: string; display_name: string } | undefined;
        if (!d) return null;
        return {
          id: row.id as string,
          url: row.url as string,
          dancer_handle: d.handle,
          dancer_name: d.display_name,
        };
      })
      .filter((x): x is FeedVideo => x !== null);
  } catch (e) {
    console.error('getFeedVideos threw:', e);
    return [];
  }
}

export default async function HomePage() {
  const [dancers, videos] = await Promise.all([getFeaturedDancers(), getFeedVideos()]);

  return (
    <>
      <Particles count={45} />
      <Nav />
      <Hero />
      <SocialProofMarquee />
      <HowItWorks />
      <FeaturedProfiles dancers={dancers} />
      <MerchCTA />
      <VideoFeedPreview videos={videos} />
      <Footer />
    </>
  );
}
