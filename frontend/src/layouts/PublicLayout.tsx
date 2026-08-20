import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Agro Tourism', to: '/agro-tourism' },
  { label: 'Land Development', to: '/land-development' },
  { label: 'Resort Development', to: '/resort-development' },
  { label: 'Investments', to: '/investments' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Knowledge Center', to: '/knowledge-center' },
  { label: 'Contact', to: '/contact' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col bg-sand-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-forest-800">
            <span className="rounded-md bg-forest-700 p-1.5 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            Agrotourism Connect
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-forest-800' : 'text-slate-600 hover:text-forest-700'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-md bg-forest-700 px-4 py-2 text-sm font-medium text-white hover:bg-forest-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-forest-700">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-forest-700 px-4 py-2 text-sm font-medium text-white hover:bg-forest-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-1.5 text-sm text-slate-700">
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                {user ? (
                  <Link to="/dashboard" className="rounded-md bg-forest-700 px-4 py-2 text-sm text-white">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="rounded-md border border-slate-300 px-4 py-2 text-sm">
                      Login
                    </Link>
                    <Link to="/register" className="rounded-md bg-forest-700 px-4 py-2 text-sm text-white">
                      Register
                    </Link>
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

      <footer className="border-t border-slate-200 bg-forest-950 text-sand-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="rounded-md bg-forest-700 p-1.5">
                <Leaf className="h-4 w-4" />
              </span>
              Agrotourism Connect
            </div>
            <p className="mt-3 text-sm text-sand-200">
              Connect Land - Develop Tourism - Generate Revenue
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-sand-200">
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/investments">Investment Opportunities</Link></li>
              <li><Link to="/land-development">Land Development</Link></li>
              <li><Link to="/resort-development">Resort Development</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm text-sand-200">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/knowledge-center">Knowledge Center</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Get Started</h4>
            <ul className="space-y-2 text-sm text-sand-200">
              <li><Link to="/register">List Your Land</Link></li>
              <li><Link to="/register">Become an Investor</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-forest-900 px-4 py-4 text-center text-xs text-sand-300">
          &copy; {new Date().getFullYear()} Agrotourism Connect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
