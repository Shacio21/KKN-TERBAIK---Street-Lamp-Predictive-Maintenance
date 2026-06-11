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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-3 shrink-0 z-30">
          {/* Hamburger (mobile + desktop toggle) */}
          <Button
            variant="ghost" size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page title / search hint */}
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center justify-start gap-2 flex-1 max-w-sm px-3 py-2 text-[#94A3B8] text-sm font-normal bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]"
          >
            <Search className="w-4 h-4" />
            <span>Cari lampu, tempat, tiket...</span>
            <kbd className="ml-auto text-[10px] bg-[#E2E8F0] px-1.5 py-0.5 rounded font-mono text-[#64748B]">Ctrl K</kbd>
          </Button>

          <div className="flex-1 sm:flex-none" />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-[#F1F5F9]"
            >
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[#0F172A] leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-[#64748B] capitalize">{user?.role || 'operator'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#94A3B8] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden py-1"
                >
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profil Saya
                  </Link>
                  <div className="border-t border-[#E2E8F0] my-1" />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-none"
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
