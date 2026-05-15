import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import DashboardShell from '@/components/dashboard/DashboardShell';
import type {
  DancerService,
  DancerStyle,
  DancerMedia,
  Dancer,
  BookingRequest,
} from '@/lib/database.types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard — Dance Is A Sport' };

export type DashboardData = {
  user: { id: string; email: string | null };
  dancer: Dancer;
  styles: DancerStyle[];
  services: DancerService[];
  media: DancerMedia[];
  bookings: BookingRequest[];
  viewsLast7: { day: string; views: number }[];
  totalViews: number;
};

export default async function DashboardPage() {
  const sb = getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/dashboard');

  const { data: dancer } = await sb
    .from('dancers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!dancer) redirect('/onboard');

  const [stylesRes, servicesRes, mediaRes, bookingsRes, viewsRes] = await Promise.all([
    sb.from('dancer_styles').select('*').eq('dancer_id', dancer.id),
    sb.from('dancer_services').select('*').eq('dancer_id', dancer.id).order('sort_order'),
    sb.from('dancer_media').select('*').eq('dancer_id', dancer.id).order('sort_order'),
    sb
      .from('booking_requests')
      .select('*')
      .eq('dancer_id', dancer.id)
      .order('created_at', { ascending: false }),
    sb
      .from('profile_views')
      .select('viewed_at')
      .eq('dancer_id', dancer.id)
      .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const viewsByDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    viewsByDay.set(key, 0);
  }
  for (const row of (viewsRes.data as { viewed_at: string }[] | null) || []) {
    const key = new Date(row.viewed_at).toISOString().slice(5, 10);
    if (viewsByDay.has(key)) viewsByDay.set(key, viewsByDay.get(key)! + 1);
  }

  const data: DashboardData = {
    user: { id: user.id, email: user.email ?? null },
    dancer: dancer as Dancer,
    styles: (stylesRes.data as DancerStyle[]) || [],
    services: (servicesRes.data as DancerService[]) || [],
    media: (mediaRes.data as DancerMedia[]) || [],
    bookings: (bookingsRes.data as BookingRequest[]) || [],
    viewsLast7: Array.from(viewsByDay.entries()).map(([day, views]) => ({ day, views })),
    totalViews: (viewsRes.data as unknown[] | null)?.length ?? 0,
  };

  return <DashboardShell initial={data} />;
}
