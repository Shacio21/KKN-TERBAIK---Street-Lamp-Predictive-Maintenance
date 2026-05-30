import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Search, Filter, Layers, Battery, Wifi, Activity, Ticket } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Fix default marker icons for bundled builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  online: '#00FF88',
  warning: '#F59E0B',
  fault: '#EF4444',
  maintenance: '#00D4FF',
  offline: '#64748B',
};

const STATUS_LABELS = {
  online: 'Online',
  warning: 'Warning',
  fault: 'Fault',
  maintenance: 'Maintenance',
  offline: 'Offline',
};

// Custom SVG circle marker
function createIcon(status) {
  const color = STATUS_COLORS[status] || '#64748B';
  return L.divIcon({
    className: 'custom-lamp-marker',
    html: `<div style="
      width: 14px; height: 14px; border-radius: 50%;
      background: ${color}; border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 0 8px ${color}, 0 0 16px ${color}40;
      transition: all 0.3s;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  });
}

// Fly-to component for search
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

// Map tile layers
const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};

export default function MapPage() {
  const [lamps, setLamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTo, setFlyTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tileLayer, setTileLayer] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLamps();
  }, []);

  const fetchLamps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/lamps?limit=1000');
      const items = data.items || data || [];
      // Only show lamps with coordinates
      setLamps(items.filter((l) => l.latitude && l.longitude));
    } catch {
      toast.error('Gagal memuat data lampu');
    } finally {
      setLoading(false);
    }
  };

  // Filter lamps
  const filteredLamps = useMemo(() => {
    let result = lamps;
    if (filterStatus) {
      result = result.filter((l) => l.status === filterStatus);
    }
    return result;
  }, [lamps, filterStatus]);

  // Search lamp by code
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const found = lamps.find((l) =>
      l.lamp_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found && found.latitude && found.longitude) {
      setFlyTo([parseFloat(found.latitude), parseFloat(found.longitude)]);
      toast.success(`Ditemukan: ${found.lamp_code}`);
    } else {
      toast.error('Lampu tidak ditemukan');
    }
  };

  // Summary stats
  const stats = useMemo(() => ({
    total: lamps.length,
    online: lamps.filter((l) => l.status === 'online').length,
    fault: lamps.filter((l) => l.status === 'fault').length,
    offline: lamps.filter((l) => l.status === 'offline').length,
    avgBattery: lamps.length > 0
      ? Math.round(lamps.reduce((s, l) => s + (parseFloat(l.last_battery_level) || 0), 0) / lamps.length)
      : 0,
  }), [lamps]);

  // Default center (Indonesia)
  const defaultCenter = [-6.2, 106.8];
  const center = lamps.length > 0
    ? [
        lamps.reduce((s, l) => s + parseFloat(l.latitude), 0) / lamps.length,
        lamps.reduce((s, l) => s + parseFloat(l.longitude), 0) / lamps.length,
      ]
    : defaultCenter;

  const tile = TILE_LAYERS[tileLayer];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Map className="w-5 h-5 text-neon-green" /> Peta Lampu
        </h1>
        <p className="text-text-muted text-sm mt-0.5">Visualisasi posisi semua lampu PJU</p>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: 'Total', value: stats.total, color: 'text-neon-blue' },
          { label: 'Online', value: stats.online, color: 'text-neon-green' },
          { label: 'Fault', value: stats.fault, color: 'text-neon-red' },
          { label: 'Offline', value: stats.offline, color: 'text-text-muted' },
          { label: 'Avg Battery', value: `${stats.avgBattery}%`, color: 'text-neon-amber' },
        ].map((s) => (
          <div key={s.label} className="glass-card px-3 py-2 flex items-center gap-2">
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Cari kode lampu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} className="font-semibold bg-neon-blue hover:shadow-[var(--shadow-neon-blue)] hover:bg-neon-blue/90 border-none text-bg-primary">
            Cari
          </Button>
        </div>

        {/* Status filter */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            {filterStatus ? STATUS_LABELS[filterStatus] : 'Semua Status'}
          </Button>
          {filterOpen && (
            <div className="absolute top-full mt-1 right-0 glass-strong rounded-lg border border-border shadow-lg z-50 py-1 min-w-[140px]">
              <Button
                variant="ghost"
                onClick={() => { setFilterStatus(''); setFilterOpen(false); }}
                className="w-full justify-start rounded-none font-normal"
              >Semua</Button>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant="ghost"
                  onClick={() => { setFilterStatus(key); setFilterOpen(false); }}
                  className="w-full justify-start gap-2 rounded-none font-normal"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Layer toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden p-0.5 space-x-0.5">
          {['dark', 'street', 'satellite'].map((layer) => (
            <Button
              key={layer}
              variant={tileLayer === layer ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTileLayer(layer)}
              className={`capitalize px-3 ${
                tileLayer === layer
                  ? 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 hover:text-neon-blue'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >{layer}</Button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="glass-card overflow-hidden rounded-xl border border-border" style={{ height: '550px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="spinner w-8 h-8" />
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={lamps.length > 0 ? 13 : 5}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            zoomControl={true}
          >
            <TileLayer url={tile.url} attribution={tile.attribution} />
            <FlyToLocation position={flyTo} />

            {filteredLamps.map((lamp) => (
              <Marker
                key={lamp.id}
                position={[parseFloat(lamp.latitude), parseFloat(lamp.longitude)]}
                icon={createIcon(lamp.status)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: 1.6, minWidth: '200px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#0a0f1e' }}>
                      {lamp.lamp_code}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                      <span style={{ color: '#64748B' }}>Status</span>
                      <span style={{ fontWeight: 600, color: STATUS_COLORS[lamp.status] }}>{STATUS_LABELS[lamp.status] || lamp.status}</span>

                      <span style={{ color: '#64748B' }}>Battery</span>
                      <span>{lamp.last_battery_level != null ? `${parseFloat(lamp.last_battery_level).toFixed(0)}%` : '—'}</span>

                      <span style={{ color: '#64748B' }}>Brightness</span>
                      <span>{lamp.last_brightness != null ? `${parseFloat(lamp.last_brightness).toFixed(0)}%` : '—'}</span>

                      <span style={{ color: '#64748B' }}>Health</span>
                      <span>{lamp.health_score != null ? `${parseFloat(lamp.health_score).toFixed(0)}` : '—'}</span>

                      <span style={{ color: '#64748B' }}>Risk</span>
                      <span style={{ textTransform: 'capitalize' }}>{lamp.risk_level || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        onClick={() => navigate(`/dashboard/lamps/${lamp.id}`)}
                        style={{ flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none', background: '#00D4FF', color: '#030712', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >Detail</button>
                      <button
                        onClick={() => navigate(`/dashboard/tickets?lamp=${lamp.lamp_code}`)}
                        style={{ flex: 1, padding: '5px 0', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#333', fontSize: '12px', cursor: 'pointer' }}
                      >Buat Tiket</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-text-muted">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[key], boxShadow: `0 0 6px ${STATUS_COLORS[key]}40` }} />
            {label}
            <span className="text-text-muted/60">
              ({lamps.filter((l) => l.status === key).length})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
