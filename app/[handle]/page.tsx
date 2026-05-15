import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Particles from '@/components/Particles';
import Reveal from '@/components/Reveal';
import StatCountUp from '@/components/StatCountUp';
import BookButton from '@/components/BookButton';
import { serverSupabase } from '@/lib/supabase';
import type {
  DancerWithRelations,
  DancerStyle,
  DancerService,
  DancerMedia,
  DancerReview,
} from '@/lib/database.types';

export const dynamic = 'force-dynamic';

async function getDancer(handle: string): Promise<DancerWithRelations | null> {
  const { data, error } = await serverSupabase()
    .from('dancers')
    .select(
      `
      *,
      dancer_styles(*),
      dancer_services(*),
      dancer_media(*),
      dancer_reviews(*)
    `,
    )
    .eq('handle', handle.toLowerCase())
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.error(`getDancer(${handle}) supabase error:`, JSON.stringify(error));
    return null;
  }
  if (!data) {
    console.warn(`getDancer(${handle}) no row returned`);
    return null;
  }
  return data as unknown as DancerWithRelations;
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const dancer = await getDancer(params.handle);
  if (!dancer) return { title: 'Profile not found — Dance Is A Sport' };
  const bioExcerpt = (dancer.bio || '').slice(0, 160);
  return {
    title: `${dancer.display_name} — Dance Is A Sport`,
    description: bioExcerpt,
    openGraph: {
      title: `${dancer.display_name} — Dance Is A Sport`,
      description: bioExcerpt,
      images: dancer.avatar_url ? [{ url: dancer.avatar_url }] : [],
    },
  };
}

const MINT_TAGS = new Set(['D1 Prospect', 'Choreographer', 'College Athlete']);

export default async function ProfilePage({ params }: { params: { handle: string } }) {
  const dancer = await getDancer(params.handle);
  if (!dancer) notFound();

  const services = (dancer.dancer_services || []).sort((a: DancerService, b: DancerService) => a.sort_order - b.sort_order);
  const media = (dancer.dancer_media || []).sort((a: DancerMedia, b: DancerMedia) => a.sort_order - b.sort_order);
  const styles = dancer.dancer_styles || [];
  const reviews = dancer.dancer_reviews || [];

  const featuredMedia = media.find((m) => m.is_featured) ?? media[0];
  const otherMedia = media.filter((m) => m !== featuredMedia).slice(0, 5);
  const ratingAvg =
    reviews.length > 0
      ? reviews.reduce((s: number, r: DancerReview) => s + (r.rating ?? 5), 0) / reviews.length
      : 4.9;

  return (
    <>
      <Particles />
      <Nav />

      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] min-h-[calc(100vh-66px)] relative z-[1]">
        {/* LEFT PANEL */}
        <aside className="bg-white/90 border-r border-purple/15 px-7 py-8 flex flex-col gap-7 md:sticky md:top-[66px] md:h-[calc(100vh-66px)] md:overflow-y-auto backdrop-blur-md animate-[leftSlide_0.8s_0.1s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Avatar */}
          <div className="relative overflow-hidden rounded-md">
            {dancer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dancer.avatar_url}
                alt={dancer.display_name}
                className="w-full aspect-[3/4] object-cover rounded-md border border-purple/15"
              />
            ) : (
              <div className="relative overflow-hidden w-full aspect-[3/4] rounded-md border border-purple/15 flex flex-col items-center justify-center gap-2 text-purple-light text-[0.7rem] tracking-[0.12em] uppercase shimmer-overlay" style={{ background: 'linear-gradient(160deg, var(--purple-pale) 0%, var(--bg3) 50%, var(--mint-pale) 100%)' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-50 pulse-icon">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                Profile Photo
              </div>
            )}
            {dancer.nil_verified && (
              <div className="absolute top-3.5 right-3.5 bg-mint text-white text-[0.58rem] font-medium tracking-[0.1em] uppercase px-3 py-1 rounded-full shadow-mint-soft animate-[badgePop_0.5s_0.9s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                ✓ NIL Verified
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex flex-col gap-1">
            <div className="font-serif text-[2rem] font-semibold tracking-[0.02em] leading-[1.05] text-ink animate-[fadeUp_0.6s_0.3s_both]">
              {dancer.display_name}
            </div>
            <div className="text-purple-mid text-[0.8rem] tracking-[0.05em] animate-[fadeUp_0.6s_0.4s_both]">
              @{dancer.handle}
            </div>
            {dancer.location && (
              <div className="text-gray text-[0.75rem] flex items-center gap-1.5 mt-0.5 animate-[fadeUp_0.6s_0.5s_both]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {dancer.location}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-purple/15 border border-purple/15 rounded-[10px] overflow-hidden animate-[fadeUp_0.6s_0.6s_both]">
            <Stat>
              <StatNum>
                <StatCountUp target={Number(ratingAvg.toFixed(1))} />
              </StatNum>
              <StatLabel>Rating</StatLabel>
            </Stat>
            <Stat>
              <StatNum>
                <StatCountUp target={reviews.length || 0} isInt />
              </StatNum>
              <StatLabel>Bookings</StatLabel>
            </Stat>
            <Stat>
              <StatNum>{dancer.years_experience ?? '—'}yr</StatNum>
              <StatLabel>Experience</StatLabel>
            </Stat>
          </div>

          {/* Tags */}
          {styles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 animate-[fadeUp_0.6s_0.7s_both]">
              {styles.map((s: DancerStyle) => {
                const mint = MINT_TAGS.has(s.style_name);
                return (
                  <span
                    key={s.id}
                    className={`text-[0.65rem] tracking-[0.08em] uppercase px-3 py-1 rounded-full border transition-all hover:-translate-y-0.5 cursor-default ${
                      mint
                        ? 'bg-mint-pale text-mint border-mint/25 hover:bg-mint hover:text-white hover:shadow-mint-soft'
                        : 'bg-purple-pale text-purple border-purple/20 hover:bg-purple hover:text-white hover:shadow-purple-soft'
                    }`}
                  >
                    {s.style_name}
                  </span>
                );
              })}
            </div>
          )}

          {/* Social Links */}
          {(dancer.instagram || dancer.tiktok || dancer.of_handle) && (
            <div className="flex flex-col gap-2 animate-[fadeUp_0.6s_0.8s_both]">
              {dancer.instagram && (
                <a
                  href={`https://instagram.com/${dancer.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-ink2 text-[0.78rem] no-underline px-3 py-2 border border-gray-pale rounded-[10px] transition-all bg-bg hover:border-purple-light hover:text-purple hover:bg-purple-pale hover:translate-x-1"
                >
                  <span className="social-dot" /> @{dancer.instagram.replace(/^@/, '')} — Instagram
                </a>
              )}
              {dancer.tiktok && (
                <a
                  href={`https://tiktok.com/@${dancer.tiktok.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-ink2 text-[0.78rem] no-underline px-3 py-2 border border-gray-pale rounded-[10px] transition-all bg-bg hover:border-purple-light hover:text-purple hover:bg-purple-pale hover:translate-x-1"
                >
                  <span className="social-dot" style={{ animationDelay: '0.5s' }} /> @{dancer.tiktok.replace(/^@/, '')} —
                  TikTok
                </a>
              )}
            </div>
          )}

          <BookButton dancerId={dancer.id} dancerName={dancer.display_name} />

          <p className="text-[0.64rem] text-gray-light text-center leading-relaxed animate-[fadeUp_0.6s_1s_both]">
            Your real info is never shared with clients. All bookings are privacy-protected through our platform.
          </p>
        </aside>

        {/* RIGHT PANEL */}
        <main className="px-6 py-10 md:px-12 md:py-12 flex flex-col gap-12 bg-transparent">
          {dancer.bio && (
            <Reveal>
              <SectionLabel>About</SectionLabel>
              <p className="font-serif text-[1.1rem] font-normal leading-[1.85] text-ink2 max-w-[580px]">
                {dancer.bio}
              </p>
            </Reveal>
          )}

          {services.length > 0 && (
            <Reveal>
              <SectionLabel>Services &amp; Rates</SectionLabel>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
                {services.map((s: DancerService) => (
                  <div
                    key={s.id}
                    className="relative overflow-hidden bg-white/90 border border-purple/15 rounded-[14px] p-5 flex flex-col gap-2 transition-all duration-[0.35s] backdrop-blur-sm cursor-pointer hover:border-purple-light hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(124,92,191,0.12)] group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-pale to-mint-pale opacity-0 group-hover:opacity-100 transition-opacity duration-[0.35s] rounded-[14px]" />
                    <div className="text-[1.6rem] relative z-[1] transition-transform group-hover:scale-[1.2] group-hover:-rotate-6">
                      {s.icon || '✨'}
                    </div>
                    <div className="font-serif text-[1.05rem] font-semibold text-ink relative z-[1]">{s.name}</div>
                    {s.description && (
                      <div className="text-[0.75rem] text-gray leading-[1.65] relative z-[1]">{s.description}</div>
                    )}
                    {s.price_label && (
                      <div className="text-[0.78rem] text-mint font-medium mt-auto pt-2 border-t border-purple/10 relative z-[1] transition-colors group-hover:text-purple">
                        {s.price_label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal>
            <SectionLabel>Availability</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              <AvailChip open>Weekends — Open</AvailChip>
              <AvailChip open>Weekday Evenings — Open</AvailChip>
              <AvailChip>Travel — On Request</AvailChip>
              <AvailChip>2+ weeks notice preferred</AvailChip>
            </div>
          </Reveal>

          {media.length > 0 && (
            <Reveal>
              <SectionLabel>Media</SectionLabel>
              <div className="grid grid-cols-3 gap-1 rounded-[14px] overflow-hidden">
                {featuredMedia && (
                  <MediaTile m={featuredMedia} featured />
                )}
                {otherMedia.map((m: DancerMedia) => (
                  <MediaTile key={m.id} m={m} />
                ))}
              </div>
            </Reveal>
          )}

          <Reveal>
            <SectionLabel>NIL Status</SectionLabel>
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-pale/80 to-mint-pale/80 border border-purple/15 rounded-[14px] p-7 backdrop-blur-sm">
              <div
                className="absolute -top-1/2 -right-[20%] w-[300px] h-[300px] rounded-full orb-anim pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(91,191,160,0.1) 0%, transparent 70%)' }}
              />
              <div className="flex items-center gap-4 mb-6 relative z-[1]">
                <div className="font-serif text-[1.2rem] font-semibold text-ink">NIL Compliance Info</div>
                {dancer.nil_verified && (
                  <div className="bg-mint text-white text-[0.6rem] font-medium tracking-[0.1em] uppercase px-3 py-1 rounded-full shadow-mint-soft animate-[badgePop_0.5s_1.2s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                    ✓ Verified
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[1]">
                <NilItem label="Eligibility State" value={dancer.nil_state || '—'} />
                <NilItem label="Status" value={dancer.nil_status || '—'} />
                <NilItem label="Deal Restrictions" value="No performance-based pay" />
                <NilItem
                  label="Parental Consent"
                  value={dancer.parental_consent ? 'On File ✓' : 'Not Required'}
                />
              </div>
            </div>
          </Reveal>

          {reviews.length > 0 && (
            <Reveal>
              <SectionLabel>Reviews</SectionLabel>
              <div className="flex flex-col gap-5">
                {reviews.map((r: DancerReview) => (
                  <div
                    key={r.id}
                    className="bg-white/90 border border-purple/15 rounded-xl px-6 py-5 transition-all backdrop-blur-sm hover:border-purple-light hover:translate-x-1.5 hover:shadow-[0_8px_24px_rgba(124,92,191,0.1)] cursor-default"
                  >
                    <div className="text-purple-mid text-[0.75rem] tracking-[0.15em] mb-2">
                      {'★'.repeat(r.rating || 5)}
                    </div>
                    <div className="font-serif text-base text-ink2 leading-[1.75] italic">&ldquo;{r.body}&rdquo;</div>
                    {(r.reviewer_role || r.reviewer_name) && (
                      <div className="text-[0.7rem] text-gray-light mt-2.5 tracking-wide">
                        — {r.reviewer_role || r.reviewer_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </main>
      </div>

      <style>{`
        @keyframes navSlide { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes leftSlide { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes badgePop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white px-1.5 py-3.5 text-center transition-colors hover:bg-purple-pale cursor-default group">
      {children}
    </div>
  );
}

function StatNum({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-serif text-[1.6rem] font-semibold text-purple leading-none transition-transform group-hover:scale-[1.15] group-hover:text-purple-mid">
      {children}
    </div>
  );
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[0.6rem] text-gray-light tracking-[0.1em] uppercase mt-1">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-4 flex items-center gap-3">
      {children}
      <span
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, rgba(124,92,191,0.15), transparent)' }}
      />
    </div>
  );
}

function AvailChip({ children, open: isOpen }: { children: React.ReactNode; open?: boolean }) {
  return (
    <div
      className={`px-4 py-1.5 border text-[0.7rem] tracking-[0.07em] rounded-full transition-all cursor-default hover:-translate-y-0.5 hover:shadow-md ${
        isOpen
          ? 'border-mint-light text-mint bg-mint-pale avail-glow'
          : 'border-purple/15 text-gray bg-white/80'
      }`}
    >
      {children}
    </div>
  );
}

function NilItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[0.6rem] tracking-[0.15em] uppercase text-gray">{label}</div>
      <div className="text-[0.83rem] text-ink">{value}</div>
    </div>
  );
}

function MediaTile({ m, featured = false }: { m: DancerMedia; featured?: boolean }) {
  const isVideo = m.media_type === 'video';
  return (
    <div
      className={`relative overflow-hidden aspect-square cursor-pointer transition-all duration-[0.35s] border border-purple/10 group hover:scale-[1.04] hover:z-[2] hover:shadow-[0_8px_24px_rgba(124,92,191,0.2)] ${
        featured ? 'col-span-2 row-span-2 shimmer-soft' : ''
      }`}
      style={{
        background: featured
          ? 'linear-gradient(140deg, var(--purple-pale) 0%, var(--mint-pale) 100%)'
          : 'linear-gradient(140deg, var(--purple-pale), var(--bg3))',
      }}
    >
      {isVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={m.url} className="w-full h-full object-cover" muted playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.url} alt="" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 flex items-center justify-center text-purple-light text-xs tracking-[0.1em] uppercase opacity-0 group-hover:opacity-80 transition-opacity bg-black/0 group-hover:bg-black/0">
        <span className="text-purple text-2xl">▶</span>
      </div>
    </div>
  );
}
