import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LayoutDashboard, Trophy, HandHeart, Users, Award, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/authSlice';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const subscriberNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/scores', label: 'Scores', icon: Trophy },
    { path: '/dashboard/charity', label: 'Charity', icon: HandHeart },
    { path: '/dashboard/winnings', label: 'Winnings', icon: Award },
  ];

  const adminNav = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/draws', label: 'Draws', icon: Trophy },
    { path: '/admin/charities', label: 'Charities', icon: HandHeart },
    { path: '/admin/winners', label: 'Winners', icon: Award },
  ];

  const nav = isAdmin ? adminNav : subscriberNav;

  const handleSignOut = async () => {
    await dispatch(signOut());
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Heart className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-white">Digital Heroes</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-4"
            >
              <Home size={18} />
              User Dashboard
            </Link>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <div className="px-3 mb-2">
            <p className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Heart className="text-white" size={18} />
                </div>
                <span className="text-lg font-bold text-white">Digital Heroes</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {nav.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-slate-700">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-64">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
              <Heart className="text-white" size={16} />
            </div>
            <span className="font-bold text-slate-800">Digital Heroes</span>
          </div>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
