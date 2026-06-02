import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Lightbulb, MapPin, Activity, Zap,
  Wrench, FileText, Users, ScrollText, Settings, X, Lamp,
  ChevronRight, BrainCircuit, Server, TrendingUp, Radio,
  BarChart3, ShieldAlert, SlidersHorizontal,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button } from "@/components/ui/button";

const mainMenu = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboard',           end: true },
  { label: 'Peta Lampu',      icon: Map,             to: '/dashboard/map' },
  { label: 'Daftar Lampu',    icon: Lightbulb,       to: '/dashboard/lamps' },
  { label: 'Daftar Tempat',   icon: MapPin,           to: '/dashboard/places' },
  { label: 'Monitoring',      icon: Activity,        to: '/dashboard/monitoring' },
  { label: 'Energi',          icon: Zap,             to: '/dashboard/energy' },
  { label: 'Tiket Perbaikan', icon: Wrench,          to: '/dashboard/tickets' },
  { label: 'Laporan',         icon: FileText,        to: '/dashboard/reports' },
];

const adminMenu = [
  { label: 'User Management', icon: Users,           to: '/dashboard/admin/users' },
  { label: 'Audit Log',       icon: ScrollText,      to: '/dashboard/admin/audit-log' },
  { label: 'Settings',        icon: Settings,        to: '/dashboard/admin/settings' },
];

const pmMenu = [
  { label: 'PM Overview',     icon: BrainCircuit,       to: '/dashboard/pm',             end: true },
  { label: 'Assets',          icon: Server,             to: '/dashboard/pm/assets' },
  { label: 'Predictions',     icon: TrendingUp,         to: '/dashboard/pm/predictions' },
  { label: 'RT Monitoring',   icon: Radio,              to: '/dashboard/pm/monitoring' },
  { label: 'Analytics',       icon: BarChart3,          to: '/dashboard/pm/analytics' },
  { label: 'Alerts',          icon: ShieldAlert,        to: '/dashboard/pm/alerts' },
  { label: 'PM Settings',     icon: SlidersHorizontal,  to: '/dashboard/pm/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-surface-active text-neon-blue border-l-2 border-neon-blue pl-[10px]'
        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-l-2 border-transparent'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col
          bg-bg-secondary border-r border-border
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
              <Lamp className="w-4 h-4 text-neon-blue" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-text-primary leading-tight">PJU Monitor</p>
              <p className="text-[10px] text-text-muted">Smart Solar Lamp</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden w-6 h-6 text-text-muted hover:text-text-primary hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {mainMenu.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Predictive Maintenance section */}
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-semibold text-neon-blue/60 uppercase tracking-wider">Predictive Maintenance</p>
          </div>
          {pmMenu.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Admin</p>
              </div>
              {adminMenu.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User info at bottom */}
        {user && (
          <div className="p-3 border-t border-border">
            <NavLink to="/dashboard/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-neon-purple text-xs font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate capitalize">{user.role}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
