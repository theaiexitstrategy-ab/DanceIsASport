import Image from 'next/image';
import Link from 'next/link';

type Props = {
  size?: number;
  className?: string;
  href?: string | null;
  priority?: boolean;
  /** Wrap in a white rounded pill so the logo is legible on dark backgrounds. */
  onDark?: boolean;
};

export default function Logo({ size = 36, className = '', href = '/', priority = false, onDark = false }: Props) {
  const img = (
    <Image
      src="/logo.png"
      alt="Dance Is A Sport"
      width={size}
      height={size}
      priority={priority}
      className={onDark ? 'block' : 'block'}
      style={{ width: size, height: size }}
    />
  );

  const wrapped = onDark ? (
    <span className="inline-flex items-center justify-center rounded-xl bg-white p-1">{img}</span>
  ) : (
    img
  );

  if (href === null) return <span className={className}>{wrapped}</span>;
  return (
    <Link href={href} aria-label="Dance Is A Sport — home" className={`inline-flex items-center ${className}`}>
      {wrapped}
    </Link>
  );
}
