import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function PublicLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <Heart className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-800">Digital Heroes</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Home</Link>
              <Link to="/charities" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Charities</Link>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Login</Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>

            <button
              className="md:hidden text-slate-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="flex flex-col gap-3 px-4 py-4">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/charities" className="text-sm font-medium text-slate-600 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Charities</Link>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-sm font-medium text-emerald-600" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">{children}</main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Heart className="text-white" size={18} />
                </div>
                <span className="text-lg font-bold text-white">Digital Heroes</span>
              </div>
              <p className="text-sm text-slate-400">
                Golf-based charity lottery platform. Play, win, and give back to causes that matter.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link to="/charities" className="hover:text-emerald-400 transition-colors">Charities</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-emerald-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">How It Works</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Subscribe to participate</li>
                <li>Enter your golf scores</li>
                <li>Numbers drawn monthly</li>
                <li>Win prizes & support charity</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
            <p>&copy; 2026 Digital Heroes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
