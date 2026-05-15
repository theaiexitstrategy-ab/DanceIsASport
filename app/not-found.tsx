import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="font-serif text-purple text-sm tracking-[0.2em] uppercase mb-4">404</div>
      <h1 className="font-serif text-4xl md:text-6xl text-ink leading-tight">Profile not found.</h1>
      <p className="mt-4 text-ink2">This dancer doesn&apos;t exist or hasn&apos;t published their profile yet.</p>
      <Link href="/" className="mt-8 text-purple underline underline-offset-4">
        Back home
      </Link>
    </main>
  );
}
