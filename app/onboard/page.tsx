'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '@/components/Nav';
import Particles from '@/components/Particles';
import { browserSupabase } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';

const STYLE_OPTIONS = [
  'Contemporary',
  'Hip-Hop',
  'Jazz',
  'Ballet',
  'Lyrical',
  'Tap',
  'Freestyle',
  'Ballroom',
  'Latin',
  'Acro',
  'Pom',
  'Cheer',
];

const NIL_STATUS_OPTIONS = [
  'High School Uncommitted',
  'High School Committed',
  'College Athlete',
  'Professional',
  'Other',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const EMOJI_OPTIONS = ['🎬', '🎉', '✨', '🏫', '💃', '🩰', '🎤', '🔥', '🎵', '🏆', '💫', '🌟'];

type ServiceDraft = {
  id: string;
  name: string;
  description: string;
  price_label: string;
  icon: string;
};

type MediaDraft = { id: string; url: string; media_type: 'photo' | 'video'; uploading?: boolean };

type FormState = {
  display_name: string;
  handle: string;
  location: string;
  bio: string;
  styles: string[];
  customStyle: string;
  years: number;
  services: ServiceDraft[];
  avatarUrl: string | null;
  avatarUploading: boolean;
  media: MediaDraft[];
  instagram: string;
  tiktok: string;
  of_handle: string;
  dob: string;
  nil_state: string;
  nil_status: string;
  parental_consent: boolean;
};

const STEPS = ['Identity', 'Style & Experience', 'Services', 'Media & NIL'];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    display_name: '',
    handle: '',
    location: '',
    bio: '',
    styles: [],
    customStyle: '',
    years: 5,
    services: [],
    avatarUrl: null,
    avatarUploading: false,
    media: [],
    instagram: '',
    tiktok: '',
    of_handle: '',
    dob: '',
    nil_state: '',
    nil_status: '',
    parental_consent: false,
  });

  const isUnder18 = useMemo(() => {
    if (!form.dob) return false;
    const dob = new Date(form.dob);
    const now = new Date();
    const age =
      now.getFullYear() -
      dob.getFullYear() -
      (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    return age < 18;
  }, [form.dob]);

  function validate(s: number): string | null {
    if (s === 0) {
      if (!form.display_name.trim()) return 'Stage name is required';
      if (!form.handle.trim()) return 'Handle is required';
      if (!/^[a-z0-9._-]{3,30}$/.test(form.handle)) return 'Handle: 3–30 chars, lowercase, dot/underscore/dash ok';
      if (!form.bio.trim()) return 'A short bio is required';
    }
    if (s === 1) {
      if (form.styles.length === 0) return 'Pick at least one style';
    }
    if (s === 2) {
      if (form.services.length === 0) return 'Add at least one service';
      const incomplete = form.services.find((sv) => !sv.name.trim());
      if (incomplete) return 'Every service needs a name';
    }
    if (s === 3) {
      if (!form.nil_state) return 'NIL state is required';
      if (!form.nil_status) return 'NIL status is required';
      if (isUnder18 && !form.parental_consent) return 'Parental consent required for under 18';
    }
    return null;
  }

  function advance() {
    const err = validate(step);
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submitAll() {
    const err = validate(3);
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const sb = browserSupabase();

      const { data: inserted, error: dancerErr } = await sb
        .from('dancers')
        .insert({
          handle: form.handle.toLowerCase(),
          display_name: form.display_name,
          location: form.location || null,
          bio: form.bio,
          avatar_url: form.avatarUrl,
          years_experience: form.years,
          instagram: form.instagram || null,
          tiktok: form.tiktok || null,
          of_handle: form.of_handle || null,
          nil_state: form.nil_state,
          nil_status: form.nil_status,
          nil_verified: true,
          parental_consent: isUnder18 ? form.parental_consent : false,
          is_published: true,
        })
        .select()
        .single();

      if (dancerErr || !inserted) {
        console.error('dancers insert failed:', dancerErr);
        setSubmitError(dancerErr?.message || 'Could not save profile');
        setSubmitting(false);
        return;
      }
      const dancerId = inserted.id;

      const allStyles = [...form.styles, ...(form.customStyle ? [form.customStyle] : [])];
      if (allStyles.length > 0) {
        const { error: stylesErr } = await sb
          .from('dancer_styles')
          .insert(allStyles.map((s) => ({ dancer_id: dancerId, style_name: s })));
        if (stylesErr) console.error('dancer_styles insert failed:', stylesErr);
      }
      if (form.services.length > 0) {
        const { error: servicesErr } = await sb.from('dancer_services').insert(
          form.services.map((sv, i) => ({
            dancer_id: dancerId,
            name: sv.name,
            description: sv.description || null,
            price_label: sv.price_label || null,
            icon: sv.icon || null,
            sort_order: i,
          })),
        );
        if (servicesErr) console.error('dancer_services insert failed:', servicesErr);
      }
      if (form.media.length > 0) {
        const { error: mediaErr } = await sb.from('dancer_media').insert(
          form.media.map((m, i) => ({
            dancer_id: dancerId,
            url: m.url,
            media_type: m.media_type,
            is_featured: i === 0,
            sort_order: i,
          })),
        );
        if (mediaErr) console.error('dancer_media insert failed:', mediaErr);
      }

      router.push(`/${form.handle.toLowerCase()}`);
    } catch (e) {
      console.error('Onboarding submit threw:', e);
      const msg = e instanceof Error ? e.message : 'Something went wrong publishing your profile.';
      setSubmitError(msg);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Particles count={35} />
      <Nav />
      <main className="relative z-[1] max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <ProgressBar step={step} total={STEPS.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mt-8 md:mt-12 bg-white/85 backdrop-blur-md border border-purple/15 rounded-2xl p-6 md:p-10">
              <div className="text-[0.62rem] tracking-[0.2em] uppercase text-purple-mid">
                Step {step + 1} of {STEPS.length}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink mt-2 mb-6">{STEPS[step]}</h1>

              {step === 0 && <Step1Identity form={form} setForm={setForm} />}
              {step === 1 && <Step2Style form={form} setForm={setForm} />}
              {step === 2 && <Step3Services form={form} setForm={setForm} />}
              {step === 3 && <Step4Media form={form} setForm={setForm} isUnder18={isUnder18} />}

              {submitError && (
                <div className="mt-5 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="px-5 py-3 text-gray border border-gray-pale rounded-xl text-sm hover:text-ink hover:border-gray transition-all"
                  >
                    Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={advance}
                    className="ml-auto bg-gradient-to-br from-purple to-purple-mid text-white px-7 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitAll}
                    disabled={submitting}
                    className="ml-auto bg-gradient-to-br from-purple to-mint text-white px-7 py-3 rounded-xl font-serif tracking-widest shadow-purple-soft hover:shadow-purple-lift hover:-translate-y-0.5 transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Publishing…' : 'Publish Profile'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div>
      <div className="flex justify-between mb-2 text-[0.65rem] uppercase tracking-[0.15em] text-gray">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? 'text-purple' : ''}>
            {i + 1}. {s}
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-purple-pale rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple to-mint"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[0.62rem] tracking-[0.15em] uppercase text-gray mb-2">{children}</label>;
}

const inputCls =
  'w-full bg-bg border border-gray-pale text-ink px-3.5 py-3 font-sans text-sm font-light outline-none rounded-xl transition-all focus:border-purple-light focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,191,0.1)] focus:-translate-y-px';

function Step1Identity({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!form.handle || !/^[a-z0-9._-]{3,30}$/.test(form.handle)) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      const sb = browserSupabase();
      const { data } = await sb.rpc('check_handle_available', { p_handle: form.handle });
      setAvailable(Boolean(data));
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [form.handle]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel>Stage Name</FieldLabel>
        <input
          className={inputCls}
          placeholder="Jasmine Carter"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Unique Handle</FieldLabel>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-mid text-sm">@</span>
          <input
            className={inputCls + ' pl-7'}
            placeholder="jasmine.dances"
            value={form.handle}
            onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
            {checking && <span className="text-gray-light">Checking…</span>}
            {!checking && available === true && form.handle && <span className="text-mint">✓ Available</span>}
            {!checking && available === false && <span className="text-red-500">Taken</span>}
          </div>
        </div>
      </div>
      <div>
        <FieldLabel>Location</FieldLabel>
        <input
          className={inputCls}
          placeholder="St. Louis, MO"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          className={inputCls + ' min-h-[120px] resize-y'}
          placeholder="Tell clients about your background, what you bring, and what you're open to..."
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step2Style({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  function toggle(s: string) {
    setForm({
      ...form,
      styles: form.styles.includes(s) ? form.styles.filter((x) => x !== s) : [...form.styles, s],
    });
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel>Styles (multi-select)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => {
            const active = form.styles.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={`text-xs tracking-wider uppercase px-3.5 py-2 rounded-full border transition-all ${
                  active
                    ? 'bg-purple text-white border-purple shadow-purple-soft'
                    : 'bg-purple-pale text-purple border-purple/20 hover:-translate-y-0.5'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <FieldLabel>Other / Custom</FieldLabel>
        <input
          className={inputCls}
          placeholder="e.g. Voguing, Krump..."
          value={form.customStyle}
          onChange={(e) => setForm({ ...form, customStyle: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Years of Experience: {form.years === 20 ? '20+' : form.years}</FieldLabel>
        <input
          type="range"
          min={1}
          max={20}
          value={form.years}
          onChange={(e) => setForm({ ...form, years: Number(e.target.value) })}
          className="w-full accent-purple"
        />
        <div className="flex justify-between text-[0.6rem] text-gray-light mt-1 tracking-wider">
          <span>1</span>
          <span>20+</span>
        </div>
      </div>
    </div>
  );
}

function Step3Services({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const dragId = useRef<string | null>(null);

  function addService() {
    if (form.services.length >= 6) return;
    setForm({
      ...form,
      services: [
        ...form.services,
        { id: crypto.randomUUID(), name: '', description: '', price_label: '', icon: '✨' },
      ],
    });
  }
  function updateService(id: string, patch: Partial<ServiceDraft>) {
    setForm({ ...form, services: form.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function removeService(id: string) {
    setForm({ ...form, services: form.services.filter((s) => s.id !== id) });
  }
  function handleDrop(targetId: string) {
    if (!dragId.current || dragId.current === targetId) return;
    const draggedIndex = form.services.findIndex((s) => s.id === dragId.current);
    const targetIndex = form.services.findIndex((s) => s.id === targetId);
    const reordered = [...form.services];
    const [item] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, item);
    setForm({ ...form, services: reordered });
    dragId.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-ink2">
        Add up to 6 services. Drag a card to reorder — the first one will appear first on your profile.
      </div>
      {form.services.map((sv) => (
        <div
          key={sv.id}
          draggable
          onDragStart={() => (dragId.current = sv.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(sv.id)}
          className="bg-white/95 border border-purple/15 rounded-xl p-4 flex gap-3 items-start cursor-move hover:border-purple-light transition-colors"
        >
          <div className="flex flex-col items-center gap-1">
            <select
              value={sv.icon}
              onChange={(e) => updateService(sv.id, { icon: e.target.value })}
              className="text-2xl bg-transparent border-none outline-none cursor-pointer"
            >
              {EMOJI_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <span className="text-[0.55rem] uppercase tracking-widest text-gray-light">drag</span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              className={inputCls}
              placeholder="Service name"
              value={sv.name}
              onChange={(e) => updateService(sv.id, { name: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Price label (e.g. From $300/day)"
              value={sv.price_label}
              onChange={(e) => updateService(sv.id, { price_label: e.target.value })}
            />
            <textarea
              className={inputCls + ' md:col-span-2 min-h-[60px] resize-y'}
              placeholder="Short description"
              value={sv.description}
              onChange={(e) => updateService(sv.id, { description: e.target.value })}
            />
          </div>
          <button
            onClick={() => removeService(sv.id)}
            className="text-gray-light hover:text-red-500 text-lg leading-none"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      {form.services.length < 6 && (
        <button
          onClick={addService}
          className="border border-dashed border-purple/30 text-purple text-sm rounded-xl py-4 hover:bg-purple-pale transition-colors"
        >
          + Add Service
        </button>
      )}
    </div>
  );
}

function Step4Media({
  form,
  setForm,
  isUnder18,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  isUnder18: boolean;
}) {
  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, avatarUploading: true });
    try {
      const { secure_url } = await uploadToCloudinary(file);
      setForm({ ...form, avatarUrl: secure_url, avatarUploading: false });
    } catch (err) {
      console.error(err);
      setForm({ ...form, avatarUploading: false });
    }
  }

  async function pickMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || form.media.length >= 6) return;
    const draftId = crypto.randomUUID();
    const isVideo = file.type.startsWith('video/');
    const draft: MediaDraft = { id: draftId, url: '', media_type: isVideo ? 'video' : 'photo', uploading: true };
    setForm({ ...form, media: [...form.media, draft] });
    try {
      const { secure_url, resource_type } = await uploadToCloudinary(file);
      setForm({
        ...form,
        media: [
          ...form.media,
          { id: draftId, url: secure_url, media_type: resource_type === 'video' ? 'video' : 'photo' },
        ],
      });
    } catch (err) {
      console.error(err);
      setForm({ ...form, media: form.media.filter((m) => m.id !== draftId) });
    }
    e.target.value = '';
  }

  function removeMedia(id: string) {
    setForm({ ...form, media: form.media.filter((m) => m.id !== id) });
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Avatar */}
      <div>
        <FieldLabel>Profile Photo</FieldLabel>
        <div className="flex items-center gap-4">
          <div className="w-24 h-32 rounded-md border border-purple/15 overflow-hidden bg-purple-pale flex items-center justify-center text-purple-light text-xs">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : form.avatarUploading ? (
              'Uploading…'
            ) : (
              'No photo'
            )}
          </div>
          <label className="cursor-pointer text-sm text-purple border border-purple/30 px-4 py-2.5 rounded-xl hover:bg-purple-pale">
            <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            Upload Photo
          </label>
        </div>
      </div>

      {/* Media */}
      <div>
        <FieldLabel>Photos & Videos (up to 6)</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {form.media.map((m) => (
            <div key={m.id} className="relative aspect-square bg-purple-pale rounded-md overflow-hidden border border-purple/15 group">
              {m.uploading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-purple-light">
                  Uploading…
                </div>
              ) : m.media_type === 'video' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={m.url} className="w-full h-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => removeMedia(m.id)}
                className="absolute top-1 right-1 bg-ink/70 text-white text-xs px-1.5 rounded opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          {form.media.length < 6 && (
            <label className="aspect-square border border-dashed border-purple/30 rounded-md flex items-center justify-center text-purple text-xs cursor-pointer hover:bg-purple-pale">
              <input type="file" accept="image/*,video/*" className="hidden" onChange={pickMedia} />
              + Add
            </label>
          )}
        </div>
      </div>

      {/* Social */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <FieldLabel>Instagram</FieldLabel>
          <input
            className={inputCls}
            placeholder="@handle"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>TikTok</FieldLabel>
          <input
            className={inputCls}
            placeholder="@handle"
            value={form.tiktok}
            onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>OF (optional, private)</FieldLabel>
          <input
            className={inputCls}
            placeholder="@handle"
            value={form.of_handle}
            onChange={(e) => setForm({ ...form, of_handle: e.target.value })}
          />
        </div>
      </div>

      {/* NIL */}
      <div className="border border-purple/15 bg-gradient-to-br from-purple-pale/60 to-mint-pale/60 rounded-xl p-5">
        <div className="font-serif text-lg text-ink mb-3">NIL Compliance</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Date of Birth</FieldLabel>
            <input
              type="date"
              className={inputCls}
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <select
              className={inputCls}
              value={form.nil_state}
              onChange={(e) => setForm({ ...form, nil_state: e.target.value })}
            >
              <option value="">Select state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Status</FieldLabel>
            <select
              className={inputCls}
              value={form.nil_status}
              onChange={(e) => setForm({ ...form, nil_status: e.target.value })}
            >
              <option value="">Select status…</option>
              {NIL_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isUnder18 && (
          <label className="flex items-start gap-2 mt-4 text-sm text-ink2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.parental_consent}
              onChange={(e) => setForm({ ...form, parental_consent: e.target.checked })}
              className="mt-1 accent-purple"
            />
            <span>
              I confirm that a parent or legal guardian has consented to this profile being published on Dance Is A
              Sport. Required for dancers under 18.
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
