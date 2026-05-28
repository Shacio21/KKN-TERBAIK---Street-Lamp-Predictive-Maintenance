import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menu, Search, LogOut, User, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import NotificationDropdown from './NotificationDropdown';
import SearchModal from './SearchModal';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="glass-strong border-b border-border px-4 py-3 flex items-center gap-3 shrink-0 z-30">
          {/* Hamburger (mobile + desktop toggle) */}
          <Button
            variant="ghost" size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page title / search hint */}
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center justify-start gap-2 flex-1 max-w-sm px-3 py-2 text-text-muted text-sm font-normal bg-surface hover:bg-surface"
          >
            <Search className="w-4 h-4" />
            <span>Cari lampu, tempat, tiket...</span>
            <kbd className="ml-auto text-[10px] bg-surface-active px-1.5 py-0.5 rounded font-mono text-text-primary">Ctrl K</kbd>
          </Button>

          <div className="flex-1 sm:flex-none" />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-surface-hover"
            >
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-neon-purple text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role || 'operator'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-[var(--radius-card)] shadow-[var(--shadow-glass)] z-50 overflow-hidden py-1"
                >
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profil Saya
                  </Link>
                  <div className="border-t border-border/50 my-1" />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2.5 text-sm text-neon-red hover:bg-neon-red/10 hover:text-neon-red rounded-none"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={(toggle) => setSearchOpen(typeof toggle === 'boolean' ? toggle : false)} />
    </div>
  );
}
