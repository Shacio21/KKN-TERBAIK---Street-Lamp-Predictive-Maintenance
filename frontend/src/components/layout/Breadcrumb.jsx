import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const LABELS = {
  dashboard:    'Dashboard',
  lamps:        'Lampu',
  places:       'Tempat',
  monitoring:   'Monitoring',
  energy:       'Energi',
  tickets:      'Tiket',
  reports:      'Laporan',
  admin:        'Admin',
  users:        'Pengguna',
  settings:     'Pengaturan',
  'audit-log':  'Audit Log',
  map:          'Peta',
  profile:      'Profil',
  schedule:     'Jadwal',
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  // Build cumulative paths
  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
    isId: /^[0-9a-f-]{8,}$/i.test(seg), // UUID-like → show as 'Detail'
  }));

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm mb-5" aria-label="Breadcrumb">
      <Link to="/" className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          {crumb.isLast ? (
            <span className="font-medium text-[#2563EB]">
              {crumb.isId ? 'Detail' : crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {crumb.isId ? 'Detail' : crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
