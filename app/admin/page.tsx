import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import AdminShell from '@/components/admin/AdminShell';
import type { Dancer, BookingRequest } from '@/lib/database.types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Dance Is A Sport' };

export type AdminSettings = {
  open_signups: boolean;
  feed_enabled: boolean;
  notify_admin_email: boolean;
};

export type AdminData = {
  totals: { dancers: number; published: number; bookings: number; views: number };
  recentDancers: Dancer[];
  recentBookings: BookingRequest[];
  allDancers: Dancer[];
  allBookings: (BookingRequest & { dancer_handle?: string; dancer_name?: string })[];
  settings: AdminSettings;
};

export default async function AdminPage() {
  const sb = getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== 'admin') redirect('/dashboard');

  const [dancersCountRes, publishedCountRes, bookingsCountRes, viewsCountRes, recentDancersRes, recentBookingsRes, allDancersRes, allBookingsRes, settingsRes] =
    await Promise.all([
      sb.from('dancers').select('id', { count: 'exact', head: true }),
      sb.from('dancers').select('id', { count: 'exact', head: true }).eq('is_published', true),
      sb.from('booking_requests').select('id', { count: 'exact', head: true }),
      sb.from('profile_views').select('id', { count: 'exact', head: true }),
      sb.from('dancers').select('*').order('created_at', { ascending: false }).limit(10),
      sb.from('booking_requests').select('*').order('created_at', { ascending: false }).limit(10),
      sb.from('dancers').select('*').order('created_at', { ascending: false }),
      sb
        .from('booking_requests')
        .select('*, dancers!inner(handle, display_name)')
        .order('created_at', { ascending: false }),
      sb.from('admin_settings').select('*').eq('id', 1).maybeSingle(),
    ]);

  const data: AdminData = {
    totals: {
      dancers: dancersCountRes.count || 0,
      published: publishedCountRes.count || 0,
      bookings: bookingsCountRes.count || 0,
      views: viewsCountRes.count || 0,
    },
    recentDancers: (recentDancersRes.data as Dancer[]) || [],
    recentBookings: (recentBookingsRes.data as BookingRequest[]) || [],
    allDancers: (allDancersRes.data as Dancer[]) || [],
    allBookings: ((allBookingsRes.data as Record<string, unknown>[]) || []).map((row) => {
      const d = row.dancers as { handle: string; display_name: string } | undefined;
      const { dancers: _dancers, ...rest } = row;
      return {
        ...(rest as unknown as BookingRequest),
        dancer_handle: d?.handle,
        dancer_name: d?.display_name,
      };
    }),
    settings: (settingsRes.data as AdminSettings | null) || {
      open_signups: true,
      feed_enabled: true,
      notify_admin_email: true,
    },
  };

  return <AdminShell initial={data} adminEmail={user.email ?? ''} />;
}
