import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, UserCheck, Lightbulb, Wrench, Battery, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import { Button } from "@/components/ui/button";

const TYPE_ICON = {
  alert:            AlertCircle,
  approval_request: UserCheck,
  account_approved: UserCheck,
  lamp_fault:       Lightbulb,
  maintenance_due:  Wrench,
  battery_low:      Battery,
  default:          Info,
};

const TYPE_COLOR = {
  alert:            'text-[#EF4444]',
  approval_request: 'text-[#F59E0B]',
  account_approved: 'text-[#10B981]',
  lamp_fault:       'text-[#EF4444]',
  maintenance_due:  'text-[#F59E0B]',
  battery_low:      'text-[#F59E0B]',
  default:          'text-[#2563EB]',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=10');
      const items = data.items || data || [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch {
      // Backend may be offline — use empty state
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="relative text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#EF4444] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#0F172A]">Notifikasi</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] h-8 px-2"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Baca semua
                </Button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-[#94A3B8] text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Tidak ada notifikasi
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICON[n.type] || TYPE_ICON.default;
                  const color = TYPE_COLOR[n.type] || TYPE_COLOR.default;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#F8FAFC]
                        ${!n.is_read ? 'border-l-2 border-[#2563EB] bg-[#EFF6FF]/50' : ''}`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${n.is_read ? 'text-[#475569]' : 'text-[#0F172A]'} truncate`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[10px] text-[#94A3B8] mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
