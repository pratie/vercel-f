import Image from 'next/image';
import Link from 'next/link';
import { FOCUS, logoHeight } from './styles';

export const FOOTER_LINKS: [string, string][] = [
  ['/tools', 'Free tools'],
  ['/alternatives', 'Compare'],
  ['/affiliates', 'Affiliates'],
  ['/blog', 'Blog'],
  ['/about', 'About'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
];

/** The landing page footer. */
export function MarketingFooter() {
  return (
    <footer className="border-t-2 border-[#1c1917]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className={`flex items-center gap-2 rounded-lg ${FOCUS}`}>
            <Image src="/logo-dark.png" alt="" width={32} height={logoHeight(32)} className="h-auto w-8 no-outline" />
            <span className="font-play font-bold text-[#1c1917]">SneakyGuy</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] font-medium text-[#44403c]" aria-label="Footer">
            {FOOTER_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={`hover:text-[#1c1917] rounded transition-colors ${FOCUS}`}>
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-[14px] text-[#78716c]">© {new Date().getFullYear()} SneakyGuy</p>
        </div>
      </div>
    </footer>
  );
}
