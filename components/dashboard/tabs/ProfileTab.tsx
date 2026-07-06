'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useToast } from '@/components/ui/Toaster';
import {
  PROFILE_SECTIONS,
  STYLE_OPTIONS,
  isValidVideoUrl,
  pickEditableDancerColumns,
  type ProfileSection,
} from '@/lib/dancer-fields';
import { toEmbedUrl, isValidReelUrl, inferReelPlatform } from '@/lib/video';
import { SOCIAL_PLATFORMS, isValidSocial, type SocialPlatform } from '@/lib/social';
import { InstagramIcon, TikTokIcon, YouTubeIcon, TwitchIcon, VimeoIcon } from '@/components/SocialIcons';
import type { DashboardData } from '@/app/dashboard/page';
import type { Dancer, DancerStyle, DancerSocialLink, DancerReelVideo } from '@/lib/database.types';

const SOCIAL_ICON: Record<string, (p: { className?: string }) => JSX.Element> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  twitch: TwitchIcon,
  vimeo: VimeoIcon,
};

type Draft = Record<string, string | string[]>;

export default function ProfileTab({
  data,
  onRefresh,
}: {
  data: DashboardData;
  onRefresh: (p: Partial<DashboardData>) => void;
}) {
  const [editing, setEditing] = useState<ProfileSection | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const profileUrl = useMemo(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.origin}/${data.dancer.handle}`
        : `https://danceisasport.com/${data.dancer.handle}`,
    [data.dancer.handle],
  );

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ type: 'success', message: 'Profile link copied' });
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header + preview CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-ink">Your profile</h2>
          <p className="text-sm text-gray mt-0.5">Manage what recruiters and clients see.</p>
        </div>
        <a
          href={`/${data.dancer.handle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-br from-purple to-purple-mid text-white px-5 py-3 rounded-xl text-sm font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
        >
          Preview my public profile ↗
        </a>
      </div>

      {/* Share link + QR */}
      <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">Your link</div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 bg-purple-pale rounded-xl px-4 py-3 font-mono text-sm text-purple truncate">
            {profileUrl}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="bg-purple text-white px-5 py-3 rounded-xl text-sm font-serif tracking-widest active:scale-95 hover:shadow-purple-soft transition-all"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button
              onClick={() => setShowQR((s) => !s)}
              className="bg-white border border-purple/30 text-purple px-5 py-3 rounded-xl text-sm font-serif tracking-widest active:scale-95 transition-all"
            >
              {showQR ? 'Hide QR' : 'QR'}
            </button>
          </div>
        </div>
        {showQR && (
          <div className="mt-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="QR code"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}`}
              className="rounded-xl border border-purple/15 bg-white p-2"
            />
          </div>
        )}
      </div>

      {/* Editable sections */}
      {PROFILE_SECTIONS.map((section) => {
        if (section.id === 'video')
          return <VideoCard key={section.id} dancer={data.dancer} onSaved={onRefresh} />;
        if (section.id === 'social')
          return (
            <SocialLinksCard
              key={section.id}
              dancerId={data.dancer.id}
              links={data.socialLinks}
              onChange={(socialLinks) => onRefresh({ socialLinks })}
            />
          );
        if (section.id === 'reel')
          return (
            <ReelCard
              key={section.id}
              dancerId={data.dancer.id}
              videos={data.reelVideos}
              onChange={(reelVideos) => onRefresh({ reelVideos })}
            />
          );
        return (
          <SectionCard
            key={section.id}
            section={section}
            dancer={data.dancer}
            styles={data.styles}
            onEdit={() => setEditing(section)}
          />
        );
      })}

      {/* Guardian cosign — read-only, admin-managed */}
      {data.dancer.requires_guardian_cosign && (
        <GuardianCard dancer={data.dancer} />
      )}

      <AnimatePresence>
        {editing && (
          <EditModal
            section={editing}
            data={data}
            onClose={() => setEditing(null)}
            onSaved={(patch) => {
              onRefresh(patch);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Summary card ------------------------------ */

function SectionCard({
  section,
  dancer,
  styles,
  onEdit,
}: {
  section: ProfileSection;
  dancer: Dancer;
  styles: DancerStyle[];
  onEdit: () => void;
}) {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-3">
            {section.title}
          </div>
          <SectionSummary section={section} dancer={dancer} styles={styles} />
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 text-sm text-purple border border-purple/30 px-4 py-2 rounded-xl hover:bg-purple-pale active:scale-95 transition-all"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function SectionSummary({
  section,
  dancer,
  styles,
}: {
  section: ProfileSection;
  dancer: Dancer;
  styles: DancerStyle[];
}) {
  if (section.childTable === 'dancer_styles') {
    if (styles.length === 0) return <Empty />;
    return (
      <div className="flex flex-wrap gap-2">
        {styles.map((s) => (
          <span
            key={s.id}
            className="text-xs tracking-wide px-3 py-1.5 rounded-full bg-purple-pale text-purple border border-purple/20"
          >
            {s.style_name}
          </span>
        ))}
      </div>
    );
  }

  const rows = section.fields
    .map((f) => {
      const raw = (dancer as unknown as Record<string, unknown>)[f.column];
      const value =
        raw === null || raw === undefined || raw === '' ? null : String(raw);
      return { label: f.label, value };
    })
    .filter((r) => r.value !== null);

  if (rows.length === 0) return <Empty />;

  // Single-field sections (bio, video, instagram) read cleaner without a label grid.
  if (section.fields.length === 1) {
    const only = rows[0];
    if (section.fields[0].type === 'url') {
      return (
        <a href={only.value!} target="_blank" rel="noreferrer" className="text-sm text-purple break-all underline underline-offset-2">
          {only.value}
        </a>
      );
    }
    return <p className="text-sm text-ink2 leading-relaxed whitespace-pre-wrap">{only.value}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-3">
          <span className="text-[0.62rem] tracking-[0.15em] uppercase text-gray">{r.label}</span>
          <span className="text-sm text-ink text-right">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-gray-light italic">Not added yet — tap Edit to add.</p>;
}

/* ------------------------------- Video card -------------------------------- */

function VideoCard({
  dancer,
  onSaved,
}: {
  dancer: Dancer;
  onSaved: (patch: Partial<DashboardData>) => void;
}) {
  const current = dancer.video_url;
  const embed = toEmbedUrl(current);
  // 'view' → showing current video; 'editing' → entering a link; 'confirming' → replace guard.
  const [mode, setMode] = useState<'view' | 'editing' | 'confirming'>('view');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function startEditing() {
    setUrl(current ?? '');
    setError(null);
    setMode('editing');
  }

  function submitLink() {
    const v = url.trim();
    // Reuse the exact same validation as the onboarding wizard's media-link input.
    if (!isValidVideoUrl(v)) {
      setError('Enter a valid YouTube or Vimeo link');
      return;
    }
    setError(null);
    // Replacing an existing, different video requires an explicit confirmation step.
    if (current && v !== current) {
      setMode('confirming');
      return;
    }
    void persist(v);
  }

  async function persist(v: string) {
    setSaving(true);
    setError(null);
    const sb = getSupabaseBrowser();
    // Single column → the write overwrites the old link entirely (no duplicate rows).
    const patch = pickEditableDancerColumns({ video_url: v });
    const { error: e } = await sb.from('dancers').update(patch).eq('id', dancer.id);
    setSaving(false);
    if (e) {
      setError(e.message);
      toast({ type: 'error', message: e.message });
      return;
    }
    toast({ type: 'success', message: current ? 'Video replaced' : 'Video added' });
    onSaved({ dancer: { ...dancer, video_url: v } });
    setMode('view');
  }

  return (
    <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid">Recruiting video</div>
        {mode === 'view' && (
          <button
            onClick={startEditing}
            className="shrink-0 text-sm text-purple border border-purple/30 px-4 py-2 rounded-xl hover:bg-purple-pale active:scale-95 transition-all"
          >
            {current ? 'Replace video' : 'Add video'}
          </button>
        )}
      </div>

      {/* Current video */}
      {embed ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-purple/15 bg-purple-pale/40">
          <iframe
            src={embed}
            title="Recruiting video"
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : current ? (
        <p className="text-sm text-gray-light italic break-all">Saved link: {current}</p>
      ) : (
        mode === 'view' && <Empty />
      )}

      {/* Editor */}
      {mode === 'editing' && (
        <div className="mt-4 flex flex-col gap-3">
          <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray">
            Video link <span className="normal-case tracking-normal text-gray-light">— YouTube or Vimeo</span>
          </label>
          <input
            autoFocus
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && submitLink()}
            placeholder="https://youtube.com/watch?v=…"
            className={inputCls}
          />
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setMode('view');
                setError(null);
              }}
              className="px-5 py-3 text-gray border border-gray-pale rounded-xl text-sm hover:text-ink hover:border-gray transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={submitLink}
              disabled={saving}
              className="ml-auto bg-gradient-to-br from-purple to-purple-mid text-white px-7 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : current ? 'Replace' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm replace */}
      {mode === 'confirming' && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-ink2">
            This will replace your current video on your live profile — continue?
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setMode('editing')}
              className="px-5 py-2.5 text-gray border border-gray-pale rounded-xl text-sm hover:text-ink hover:border-gray transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => persist(url.trim())}
              disabled={saving}
              className="ml-auto bg-gradient-to-br from-purple to-purple-mid text-white px-6 py-2.5 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? 'Replacing…' : 'Yes, replace it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Social links card ---------------------------- */

function SocialLinksCard({
  dancerId,
  links,
  onChange,
}: {
  dancerId: string;
  links: DancerSocialLink[];
  onChange: (links: DancerSocialLink[]) => void;
}) {
  function upsertLocal(link: DancerSocialLink) {
    onChange([...links.filter((l) => l.platform !== link.platform), link]);
  }
  function removeLocal(platform: string) {
    onChange(links.filter((l) => l.platform !== platform));
  }

  return (
    <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
      <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-4">Social links</div>
      <div className="flex flex-col gap-4">
        {SOCIAL_PLATFORMS.map((p) => (
          <SocialRow
            key={p.key}
            dancerId={dancerId}
            platform={p.key}
            label={p.label}
            placeholder={p.placeholder}
            current={links.find((l) => l.platform === p.key)}
            onUpsert={upsertLocal}
            onRemove={removeLocal}
          />
        ))}
      </div>
      <p className="text-xs text-gray mt-4">
        Paste a handle (e.g. @you) or a full profile URL. Each platform is optional and independent.
      </p>
    </div>
  );
}

function SocialRow({
  dancerId,
  platform,
  label,
  placeholder,
  current,
  onUpsert,
  onRemove,
}: {
  dancerId: string;
  platform: SocialPlatform;
  label: string;
  placeholder: string;
  current?: DancerSocialLink;
  onUpsert: (link: DancerSocialLink) => void;
  onRemove: (platform: string) => void;
}) {
  const Icon = SOCIAL_ICON[platform];
  const saved = current?.handle_or_url ?? '';
  const [value, setValue] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const dirty = value.trim() !== saved.trim();

  async function remove() {
    setBusy(true);
    setError(null);
    const sb = getSupabaseBrowser();
    const { error: e } = await sb
      .from('dancer_social_links')
      .delete()
      .eq('dancer_id', dancerId)
      .eq('platform', platform);
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    setValue('');
    onRemove(platform);
    toast({ type: 'info', message: `${label} removed` });
  }

  async function save() {
    const v = value.trim();
    if (!v) {
      if (current) await remove();
      return;
    }
    if (!isValidSocial(platform, v)) {
      setError(`Enter a valid ${label} handle or URL`);
      return;
    }
    setBusy(true);
    setError(null);
    const sb = getSupabaseBrowser();
    const { data, error: e } = await sb
      .from('dancer_social_links')
      .upsert(
        {
          dancer_id: dancerId,
          platform,
          handle_or_url: v,
          connection_type: 'manual',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'dancer_id,platform' },
      )
      .select()
      .single();
    setBusy(false);
    if (e || !data) {
      setError(e?.message ?? 'Could not save');
      toast({ type: 'error', message: e?.message ?? 'Could not save' });
      return;
    }
    onUpsert(data as DancerSocialLink);
    toast({ type: 'success', message: `${label} saved` });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-purple-pale text-purple flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && dirty && save()}
          placeholder={placeholder}
          aria-label={label}
          className={inputCls}
        />
        <button
          onClick={save}
          disabled={busy || !dirty}
          className="shrink-0 text-sm text-purple border border-purple/30 px-4 py-2.5 rounded-xl hover:bg-purple-pale active:scale-95 transition-all disabled:opacity-40"
        >
          Save
        </button>
        {current && (
          <button
            onClick={remove}
            disabled={busy}
            className="shrink-0 text-sm text-gray hover:text-red-500 px-2 py-2.5 transition-colors active:scale-95 disabled:opacity-40"
            aria-label={`Remove ${label}`}
          >
            ✕
          </button>
        )}
      </div>
      {error && <div className="mt-1.5 ml-12 text-xs text-red-500">{error}</div>}
    </div>
  );
}

/* -------------------------------- Reel card -------------------------------- */

function ReelCard({
  dancerId,
  videos,
  onChange,
}: {
  dancerId: string;
  videos: DancerReelVideo[];
  onChange: (videos: DancerReelVideo[]) => void;
}) {
  const sorted = [...videos].sort((a, b) => a.display_order - b.display_order);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();

  async function add() {
    const v = url.trim();
    if (!isValidReelUrl(v)) {
      setError('Paste a YouTube, Vimeo, Instagram Reel, or TikTok link');
      return;
    }
    setAdding(true);
    setError(null);
    const sb = getSupabaseBrowser();
    const nextOrder = sorted.length ? Math.max(...sorted.map((x) => x.display_order)) + 1 : 0;
    const { data, error: e } = await sb
      .from('dancer_reel_videos')
      .insert({ dancer_id: dancerId, video_url: v, platform: inferReelPlatform(v), display_order: nextOrder })
      .select()
      .single();
    setAdding(false);
    if (e || !data) {
      setError(e?.message ?? 'Could not add');
      toast({ type: 'error', message: e?.message ?? 'Could not add' });
      return;
    }
    setUrl('');
    onChange([...videos, data as DancerReelVideo]);
    toast({ type: 'success', message: 'Video added' });
  }

  async function remove(id: string) {
    setBusyId(id);
    const sb = getSupabaseBrowser();
    const { error: e } = await sb.from('dancer_reel_videos').delete().eq('id', id);
    setBusyId(null);
    if (e) {
      toast({ type: 'error', message: e.message });
      return;
    }
    onChange(videos.filter((x) => x.id !== id));
    toast({ type: 'info', message: 'Video removed' });
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= sorted.length) return;
    const arr = [...sorted];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    // Renumber to positions; persist only the rows whose order changed.
    const renumbered = arr.map((v, i) => ({ ...v, display_order: i }));
    const changed = renumbered.filter(
      (v) => v.display_order !== videos.find((x) => x.id === v.id)?.display_order,
    );
    setBusyId(sorted[index].id);
    const sb = getSupabaseBrowser();
    const results = await Promise.all(
      changed.map((v) =>
        sb.from('dancer_reel_videos').update({ display_order: v.display_order }).eq('id', v.id),
      ),
    );
    setBusyId(null);
    if (results.some((r) => r.error)) {
      toast({ type: 'error', message: 'Could not reorder' });
      return;
    }
    onChange(renumbered);
  }

  return (
    <div className="bg-white/85 backdrop-blur-md border border-purple/15 rounded-3xl p-6 md:p-7">
      <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid mb-1">Video reel</div>
      <p className="text-xs text-gray mb-4">
        A scrollable collection of your short-form clips — separate from your recruiting video.
      </p>

      {sorted.length > 0 ? (
        <div className="flex flex-col gap-2 mb-4">
          {sorted.map((v, i) => {
            const Icon = SOCIAL_ICON[v.platform ?? ''] ?? YouTubeIcon;
            return (
              <div
                key={v.id}
                className="flex items-center gap-3 border border-purple/15 rounded-xl p-3 bg-white/60"
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-pale text-purple flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-ink truncate">{v.video_url}</div>
                  <div className="text-[0.62rem] uppercase tracking-widest text-gray-light">
                    {v.platform ?? 'video'}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busyId !== null}
                    className="w-8 h-8 rounded-lg border border-gray-pale text-gray hover:text-purple hover:border-purple/40 disabled:opacity-30 active:scale-95 transition-all"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === sorted.length - 1 || busyId !== null}
                    className="w-8 h-8 rounded-lg border border-gray-pale text-gray hover:text-purple hover:border-purple/40 disabled:opacity-30 active:scale-95 transition-all"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => remove(v.id)}
                    disabled={busyId === v.id}
                    className="w-8 h-8 rounded-lg border border-gray-pale text-gray hover:text-red-500 hover:border-red-200 disabled:opacity-40 active:scale-95 transition-all"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-4">
          <Empty />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Paste a YouTube, Vimeo, Instagram Reel, or TikTok link"
            className={inputCls}
          />
          <button
            onClick={add}
            disabled={adding || !url.trim()}
            className="shrink-0 bg-gradient-to-br from-purple to-purple-mid text-white px-5 py-2.5 rounded-xl text-sm font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift active:scale-95 transition-all disabled:opacity-50"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Guardian card ------------------------------ */

function GuardianCard({ dancer }: { dancer: Dancer }) {
  const confirmed = dancer.guardian_cosign_confirmed;
  return (
    <div className="bg-white/85 backdrop-blur-md border border-mint/30 rounded-3xl p-6 md:p-7">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-[0.62rem] tracking-[0.2em] uppercase text-mint">Guardian co-sign</div>
        <span
          className={`text-xs font-medium tracking-wide px-3 py-1.5 rounded-full ${
            confirmed
              ? 'bg-mint-pale text-mint border border-mint/30'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}
        >
          {confirmed ? 'Confirmed ✓' : 'Pending'}
        </span>
      </div>
      <div className="text-sm text-ink2 leading-relaxed">
        {dancer.guardian_name && (
          <div>
            Guardian: <span className="text-ink">{dancer.guardian_name}</span>
          </div>
        )}
        {dancer.guardian_email && (
          <div>
            Contact: <span className="text-ink">{dancer.guardian_email}</span>
          </div>
        )}
        <p className="mt-3 text-xs text-gray">
          Co-sign status is managed by Dance Is A Sport for NIL compliance and can&apos;t be changed
          here. Contact support if something looks wrong.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- Edit modal -------------------------------- */

function initialDraft(section: ProfileSection, data: DashboardData): Draft {
  const draft: Draft = {};
  if (section.childTable === 'dancer_styles') {
    draft.styles = data.styles.map((s) => s.style_name);
    return draft;
  }
  for (const f of section.fields) {
    const raw = (data.dancer as unknown as Record<string, unknown>)[f.column];
    draft[f.column] = raw === null || raw === undefined ? '' : String(raw);
  }
  return draft;
}

function EditModal({
  section,
  data,
  onClose,
  onSaved,
}: {
  section: ProfileSection;
  data: DashboardData;
  onClose: () => void;
  onSaved: (patch: Partial<DashboardData>) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(section, data));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  function setField(column: string, value: string | string[]) {
    setDraft((d) => ({ ...d, [column]: value }));
    if (error) setError(null);
  }

  function toggleStyle(style: string) {
    const cur = Array.isArray(draft.styles) ? draft.styles : [];
    setField('styles', cur.includes(style) ? cur.filter((s) => s !== style) : [...cur, style]);
  }

  async function save() {
    setError(null);

    // Validation
    for (const f of section.fields) {
      if (f.type === 'url') {
        const v = String(draft[f.column] ?? '').trim();
        if (v && !isValidVideoUrl(v)) {
          setError('Enter a valid YouTube or Vimeo link');
          return;
        }
      }
    }

    setSaving(true);
    const sb = getSupabaseBrowser();

    try {
      if (section.childTable === 'dancer_styles') {
        const selected = (Array.isArray(draft.styles) ? draft.styles : []).filter(Boolean);
        // Replace the dancer's style set (owner-scoped RLS enforces ownership).
        const { error: delErr } = await sb
          .from('dancer_styles')
          .delete()
          .eq('dancer_id', data.dancer.id);
        if (delErr) throw delErr;
        let newStyles: DancerStyle[] = [];
        if (selected.length > 0) {
          const { data: inserted, error: insErr } = await sb
            .from('dancer_styles')
            .insert(selected.map((style_name) => ({ dancer_id: data.dancer.id, style_name })))
            .select();
          if (insErr) throw insErr;
          newStyles = (inserted as DancerStyle[]) ?? [];
        }
        toast({ type: 'success', message: 'Styles updated' });
        onSaved({ styles: newStyles });
        return;
      }

      // Column-based section → build a whitelisted patch.
      const rawPatch: Record<string, unknown> = {};
      for (const f of section.fields) {
        const v = String(draft[f.column] ?? '').trim();
        if (f.type === 'number') {
          rawPatch[f.column] = v === '' ? null : Number(v);
        } else {
          rawPatch[f.column] = v === '' ? null : v;
        }
      }
      const patch = pickEditableDancerColumns(rawPatch);

      const { error: updErr } = await sb
        .from('dancers')
        .update(patch)
        .eq('id', data.dancer.id);
      if (updErr) throw updErr;

      toast({ type: 'success', message: `${section.title} saved` });
      onSaved({ dancer: { ...data.dancer, ...(patch as Partial<Dancer>) } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save';
      setError(msg);
      toast({ type: 'error', message: msg });
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-ink/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl border border-purple/15 p-6 md:p-8 max-h-[90dvh] overflow-y-auto"
        initial={{ y: 40, opacity: 0.6, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-2xl text-ink">Edit {section.title.toLowerCase()}</h3>
          <button onClick={onClose} className="text-gray hover:text-ink text-2xl leading-none active:scale-90">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {section.childTable === 'dancer_styles' ? (
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => {
                const active = Array.isArray(draft.styles) && draft.styles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`text-sm tracking-wide px-4 py-2.5 rounded-full border transition-all active:scale-95 ${
                      active
                        ? 'bg-purple text-white border-purple shadow-purple-soft'
                        : 'bg-purple-pale text-purple border-purple/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          ) : (
            section.fields.map((f) => {
              const value = String(draft[f.column] ?? '');
              return (
                <div key={f.column}>
                  <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray mb-2">
                    {f.label}
                    {f.help && <span className="ml-2 normal-case tracking-normal text-gray-light">— {f.help}</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <div>
                      <textarea
                        autoFocus
                        className={`${inputCls} min-h-[120px] resize-y`}
                        placeholder={f.placeholder}
                        maxLength={f.maxLength}
                        value={value}
                        onChange={(e) => setField(f.column, e.target.value)}
                      />
                      {f.maxLength && (
                        <div className="mt-1 text-right text-[0.7rem] text-gray-light tabular-nums">
                          {value.length}/{f.maxLength}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      autoFocus
                      type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                      inputMode={f.type === 'number' ? 'numeric' : undefined}
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={value}
                      onChange={(e) => setField(f.column, e.target.value)}
                    />
                  )}
                </div>
              );
            })
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-7">
          <button
            onClick={onClose}
            className="px-5 py-3 text-gray border border-gray-pale rounded-xl text-sm hover:text-ink hover:border-gray transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="ml-auto bg-gradient-to-br from-purple to-purple-mid text-white px-7 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const inputCls =
  'w-full bg-bg border border-gray-pale rounded-xl px-3.5 py-3 text-sm font-light outline-none focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] transition-all';
