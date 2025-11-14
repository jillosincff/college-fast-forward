import { navigate } from '@/components/router/SimpleRouter';

const GatorLogo = () => (
  <div onClick={() => navigate('LandingPage')} className="flex items-center gap-2 cursor-pointer">
    <span className="text-2xl" role="img" aria-label="Gator">🐊</span>
    <span className="font-bold text-xl text-slate-800">College Fast Forward</span>
  </div>
);

const footerLinks = {
  'About Us': [
    { name: 'Our Mission', href: 'About' },
    { name: 'Success Stories', href: 'SuccessStories' },
    { name: 'Brand Ambassadors', href: 'BrandAmbassador' },
    { name: 'Contact Us', href: 'Contact' },
  ],
  'For Students': [
    { name: 'Find a Job', href: 'Connections' },
    { name: 'Find a Roommate', href: 'Roommates' },
    { name: 'How It Works', href: 'LandingPage#how-it-works' },
  ],
  'For Alumni & Parents': [
    { name: 'Help a Gator', href: 'Connections' },
    { name: 'Parent Resources', href: 'ParentResources' },
  ],
  'Legal': [
    { name: 'Terms of Service', href: 'Terms' },
    { name: 'Privacy Policy', href: 'Privacy' },
    { name: 'Cookie Policy', href: 'CookiePolicy' },
  ],
};

const FooterLink = ({ href, children }) => (
  <button onClick={() => navigate(href)} className="text-slate-600 hover:text-[var(--uf-blue)] transition-colors text-left">
    {children}
  </button>
);

export default function AppFooter({ snugTop = false }) {
  return (
    <footer className={`bg-slate-100 border-t ${snugTop ? '-mt-20' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1 mb-4 lg:mb-0">
            <GatorLogo />
            <p className="mt-4 text-slate-600 text-sm">Once a Gator, always a Gator.</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} College Fast Forward. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}