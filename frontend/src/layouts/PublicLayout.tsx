import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  ChevronDown,
  Sprout,
  MapPinned,
  Building2,
  Handshake,
  Landmark,
  FolderKanban,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAuthModalStore } from '../store/authModalStore';
import { images } from '../assets/images';
import { SOCIAL_LINKS } from '../constants/social';
import { InstagramPreviewSection } from '../components/InstagramPreviewSection';
import { PublicChatbot } from '../components/chatbot/PublicChatbot';

const topLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
];

const navGroups = [
  {
    label: 'Solutions',
    items: [
      { label: 'Agro Tourism', to: '/agro-tourism', icon: Sprout },
      { label: 'Land Development', to: '/land-development', icon: MapPinned },
      { label: 'Resort Development', to: '/resort-development', icon: Building2 },
      { label: 'Services', to: '/services', icon: Handshake },
    ],
  },
  {
    label: 'Opportunities',
    items: [
      { label: 'Investments', to: '/investments', icon: Landmark },
      { label: 'Projects', to: '/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Explore',
    items: [
      { label: 'Gallery', to: '/gallery', icon: ImageIcon },
      { label: 'Knowledge Center', to: '/knowledge-center', icon: BookOpen },
    ],
  },
];

const careersLink = { label: 'Careers', to: '/careers' };
const contactLink = { label: 'Contact', to: '/contact' };

function NavDropdown({ label, items }: { label: string; items: { label: string; to: string; icon: typeof Sprout }[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const isActive = items.some((item) => location.pathname === item.to);

  function handleEnter() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-md px-1 py-1 text-[14.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-1 ${
          isActive ? 'text-brand-forest' : 'text-brand-slate hover:text-brand-forest'
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-brand-border bg-white p-1.5 shadow-lg">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive: active }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-brand-cream text-brand-forest' : 'text-brand-charcoal hover:bg-brand-cream hover:text-brand-forest'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0 text-brand-forest" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthModalStore((s) => s.openModal);
  // Homepage nav matches the original reference design, which predates the Careers
  // link — every other public page still shows it.
  const isHome = useLocation().pathname === '/';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-brand-offwhite">
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur transition-all duration-200 ${
          scrolled ? 'border-brand-gold/25 bg-white/95 shadow-sm' : 'border-brand-gold/15 bg-white/90'
        }`}
      >
        <div className="mx-auto flex h-[92px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src={images.logo}
              alt="Agrotourism Connect"
              className="h-[50px] w-auto max-w-[220px] object-contain object-left sm:h-[62px] lg:h-[72px] lg:max-w-[280px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {topLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-md px-1 py-1 text-[14.5px] font-medium transition-colors after:absolute after:-bottom-[3px] after:left-0 after:h-[1.5px] after:rounded-full after:bg-[#C79A50] after:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-1 ${isActive ? 'text-brand-forest after:w-full' : 'text-brand-slate after:w-0 hover:text-brand-forest hover:after:w-full'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {navGroups.map((group) => (
              <NavDropdown key={group.label} label={group.label} items={group.items} />
            ))}
            {!isHome && (
              <NavLink
                to={careersLink.to}
                className={({ isActive }) =>
                  `relative rounded-md px-1 py-1 text-[14.5px] font-medium transition-colors after:absolute after:-bottom-[3px] after:left-0 after:h-[1.5px] after:rounded-full after:bg-[#C79A50] after:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-1 ${isActive ? 'text-brand-forest after:w-full' : 'text-brand-slate after:w-0 hover:text-brand-forest hover:after:w-full'}`
                }
              >
                {careersLink.label}
              </NavLink>
            )}
            <NavLink
              to={contactLink.to}
              className={({ isActive }) =>
                `relative rounded-md px-1 py-1 text-[14.5px] font-medium transition-colors after:absolute after:-bottom-[3px] after:left-0 after:h-[1.5px] after:rounded-full after:bg-[#C79A50] after:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-1 ${isActive ? 'text-brand-forest after:w-full' : 'text-brand-slate after:w-0 hover:text-brand-forest hover:after:w-full'}`
              }
            >
              {contactLink.label}
            </NavLink>
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-[#C79A50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B08640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A50] focus-visible:ring-offset-2"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-md px-2 py-1 text-[14.5px] font-medium text-brand-charcoal transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-1"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="rounded-lg bg-[#C79A50] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B08640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A50] focus-visible:ring-offset-2"
                >
                  Register
                </button>
              </>
            )}
          </div>

          <button className="rounded-md p-1.5 text-brand-charcoal xl:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="max-h-[calc(100vh-92px)] overflow-y-auto border-t border-brand-border bg-white px-4 py-4 xl:hidden">
            <div className="flex flex-col gap-1">
              {topLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-2 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-cream text-brand-forest' : 'text-brand-charcoal'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {navGroups.map((group) => (
                <div key={group.label} className="border-t border-brand-border pt-1">
                  <button
                    type="button"
                    onClick={() => setMobileGroupOpen(mobileGroupOpen === group.label ? null : group.label)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-brand-charcoal"
                    aria-expanded={mobileGroupOpen === group.label}
                  >
                    {group.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroupOpen === group.label ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileGroupOpen === group.label && (
                    <div className="ml-2 flex flex-col gap-0.5 border-l border-brand-border pl-3">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-md px-2 py-2 text-sm ${isActive ? 'bg-brand-cream text-brand-forest' : 'text-brand-slate'}`
                          }
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-brand-forest" />
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="border-t border-brand-border pt-1">
                {!isHome && (
                  <NavLink
                    to={careersLink.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-cream text-brand-forest' : 'text-brand-charcoal'}`
                    }
                  >
                    {careersLink.label}
                  </NavLink>
                )}
                <NavLink
                  to={contactLink.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-2 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-cream text-brand-forest' : 'text-brand-charcoal'}`
                  }
                >
                  {contactLink.label}
                </NavLink>
              </div>

              <div className="mt-2 flex gap-2 border-t border-brand-border pt-4">
                {user ? (
                  <Link to="/dashboard" className="w-full rounded-lg bg-[#C79A50] px-4 py-2.5 text-center text-sm font-semibold text-white">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); openAuthModal('login'); }}
                      className="w-1/2 rounded-lg border border-brand-border px-4 py-2.5 text-center text-sm font-medium text-brand-charcoal"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); openAuthModal('register'); }}
                      className="w-1/2 rounded-lg bg-[#C79A50] px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <InstagramPreviewSection />

      <footer className="border-t border-white/10 bg-brand-deep text-brand-sage">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 font-semibold text-white">
              <img src={images.logo} alt="Agrotourism Connect logo" className="h-9 w-9 shrink-0 object-contain" />
              Agrotourism Connect
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-sage">
              Connect Land &middot; Develop Tourism &middot; Generate Revenue. One land, multiple businesses, lasting
              value.
            </p>
            <div className="mt-5 flex gap-3">
              <span className="rounded-full bg-white/5 p-2 text-brand-sage transition-colors hover:bg-white/10 hover:text-white">
                <Facebook className="h-4 w-4" />
              </span>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Agrotourism Connect on Instagram"
                className="rounded-full bg-white/5 p-2 text-brand-sage transition-colors hover:bg-white/10 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <span className="rounded-full bg-white/5 p-2 text-brand-sage transition-colors hover:bg-white/10 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Explore</h4>
            <ul className="space-y-2.5 text-sm text-brand-sage">
              <li><Link to="/projects" className="transition-colors hover:text-white">Projects</Link></li>
              <li><Link to="/investments" className="transition-colors hover:text-white">Investment Opportunities</Link></li>
              <li><Link to="/land-development" className="transition-colors hover:text-white">Land Development</Link></li>
              <li><Link to="/resort-development" className="transition-colors hover:text-white">Resort Development</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2.5 text-sm text-brand-sage">
              <li><Link to="/about" className="transition-colors hover:text-white">About</Link></li>
              <li><Link to="/services" className="transition-colors hover:text-white">Services</Link></li>
              <li><Link to="/knowledge-center" className="transition-colors hover:text-white">Knowledge Center</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Get Started</h4>
            <ul className="space-y-2.5 text-sm text-brand-sage">
              <li><button type="button" onClick={() => openAuthModal('register')} className="text-left transition-colors hover:text-white">List Your Land</button></li>
              <li><button type="button" onClick={() => openAuthModal('register')} className="text-left transition-colors hover:text-white">Become an Investor</button></li>
              <li><button type="button" onClick={() => openAuthModal('login')} className="text-left transition-colors hover:text-white">Login</button></li>
            </ul>
            <ul className="mt-5 space-y-2 text-sm text-brand-sage">
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> India</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /> info@agrotourismconnect.com</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /> +91 00000 00000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-brand-sage/70">
          &copy; {new Date().getFullYear()} Agrotourism Connect. All rights reserved.
        </div>
      </footer>

      <PublicChatbot />
    </div>
  );
}
