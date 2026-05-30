import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Lightbulb, Battery, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { SkeletonCard } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import { timeAgo } from '../../lib/utils';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [lamps, setLamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [placeRes, lampsRes] = await Promise.allSettled([
          api.get(`/places/${id}`),
          api.get(`/places/${id}/lamps`),
        ]);
        if (placeRes.status === 'fulfilled') setPlace(placeRes.value.data);
        if (lampsRes.status === 'fulfilled') {
          const d = lampsRes.value.data;
          setLamps(d.items || d || []);
        }
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const lampCols = [
    { key: 'lamp_code', label: 'Kode', render: (v, row) => <Link to={`/dashboard/lamps/${row.id}`} className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">{v}</Link> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'online' ? 'online' : v === 'fault' ? 'fault' : v === 'warning' ? 'warning' : 'offline'} size="sm">{v}</Badge> },
    { key: 'last_battery_level', label: 'Baterai', render: (v) => v != null ? `${v.toFixed(0)}%` : '—' },
    { key: 'health_score', label: 'Health', render: (v) => v != null ? `${v.toFixed(0)}%` : '—' },
    { key: 'last_seen', label: 'Update', render: (v) => <span className="text-text-muted text-xs">{timeAgo(v)}</span> },
  ];

  const summary = {
    total: lamps.length,
    online: lamps.filter(l => l.status === 'online').length,
    fault: lamps.filter(l => l.status === 'fault').length,
    avgBattery: lamps.length ? (lamps.reduce((s, l) => s + (l.last_battery_level || 0), 0) / lamps.length).toFixed(0) : 0,
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>;

  if (!place) return <div className="text-center py-16 text-text-muted"><MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Tempat tidak ditemukan.</p></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/places" className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{place.name}</h1>
          <p className="text-text-muted text-sm">{place.type && <Badge variant="info" size="sm">{place.type}</Badge>} {place.description}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Lampu', value: summary.total, icon: Lightbulb, color: 'text-neon-blue' },
          { label: 'Online', value: summary.online, icon: Lightbulb, color: 'text-neon-green' },
          { label: 'Fault', value: summary.fault, icon: AlertTriangle, color: 'text-neon-red' },
          { label: 'Avg Baterai', value: `${summary.avgBattery}%`, icon: Battery, color: 'text-neon-amber' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Informasi Lokasi</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Tipe', place.type],
            ['Koordinat', place.latitude && place.longitude ? `${Number(place.latitude).toFixed(6)}, ${Number(place.longitude).toFixed(6)}` : '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-text-muted">{k}:</span>
              <span className="text-text-primary ml-2">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lamps Table */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Lampu di Area Ini ({lamps.length})</h3>
        <DataTable columns={lampCols} data={lamps} isLoading={false} emptyMessage="Tidak ada lampu di area ini" />
      </div>
    </div>
  );
}
