export const metadata = { title: 'Offline — Dance Is A Sport' };

export default function Offline() {
  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-6 text-center">
      <div className="font-serif text-purple text-xs tracking-[0.2em] uppercase mb-4">Offline</div>
      <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">No connection.</h1>
      <p className="mt-4 text-ink2 max-w-sm">
        Your profile and feed need a network connection to load. We&apos;ll try again as soon as you&apos;re back.
      </p>
    </main>
  );
}
