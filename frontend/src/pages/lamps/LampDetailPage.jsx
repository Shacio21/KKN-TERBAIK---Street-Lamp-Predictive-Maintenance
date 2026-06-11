import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Lightbulb, MapPin, Cpu, Battery, Sun, Thermometer,
  Signal, Sliders, AlertTriangle, Wrench, FileText, Activity,
  RefreshCw, BarChart2, Loader2
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import { formatDateTime, timeAgo } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";

function MetricCard({ label, value, unit, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'border-neon-blue/20 text-neon-blue bg-neon-blue/5',
    green: 'border-neon-green/20 text-neon-green bg-neon-green/5',
    amber: 'border-neon-amber/20 text-neon-amber bg-neon-amber/5',
    red: 'border-neon-red/20 text-neon-red bg-neon-red/5',
    purple: 'border-neon-purple/20 text-neon-purple bg-neon-purple/5',
  };
  return (
    <div className={`glass-card p-4 border ${colors[color]} text-center`}>
      <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
      <p className="text-xl font-bold">{value ?? '—'}{unit && <span className="text-sm font-normal ml-0.5">{unit}</span>}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  );
}

export default function LampDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [lamp, setLamp] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brightness, setBrightness] = useState(80);
  const [settingBrightness, setSettingBrightness] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [lampRes, alertsRes, ticketsRes, predRes, logsRes] = await Promise.allSettled([
          api.get(`/lamps/${id}`),
          api.get(`/lamps/${id}/alerts?limit=5`),
          api.get(`/lamps/${id}/tickets?limit=5`),
          api.get(`/lamps/${id}/predictions`),
          api.get(`/lamps/${id}/device-logs?limit=20`),
        ]);
        if (lampRes.status === 'fulfilled') {
          setLamp(lampRes.value.data);
          setBrightness(lampRes.value.data.last_brightness ?? 80);
        }
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data?.items || alertsRes.value.data || []);
        if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.data?.items || ticketsRes.value.data || []);
        if (predRes.status === 'fulfilled') {
          const preds = predRes.value.data?.items || predRes.value.data || [];
          setPrediction(preds[0] || null);
        }
        if (logsRes.status === 'fulfilled') setDeviceLogs(logsRes.value.data?.items || logsRes.value.data || []);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const applyBrightness = async () => {
    setSettingBrightness(true);
    try {
      await api.patch(`/lamps/${id}/brightness`, { brightness });
      toast.success(`Brightness diatur ke ${brightness}%`);
    } catch {
      toast.error('Gagal mengatur brightness');
    } finally { setSettingBrightness(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!lamp) return (
    <div className="text-center py-16 text-text-muted">
      <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Lampu tidak ditemukan.</p>
    </div>
  );

  const statusVariant = { online: 'online', warning: 'warning', fault: 'fault', maintenance: 'maintenance', offline: 'offline' };
  const riskVariant = { high: 'high', medium: 'medium', low: 'low' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/dashboard/lamps" className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-text-primary font-display">{lamp.lamp_code}</h1>
            <Badge variant={statusVariant[lamp.status] || 'default'} dot>{lamp.status}</Badge>
            {lamp.risk_level && <Badge variant={riskVariant[lamp.risk_level] || 'default'} size="sm">Risk: {lamp.risk_level}</Badge>}
          </div>
          <p className="text-text-muted text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            {lamp.place?.name || 'Lokasi tidak diketahui'} — Terakhir update: {timeAgo(lamp.last_seen)}
          </p>
        </div>
      </div>

      {/* Section 1: Info + Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Info Umum */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neon-blue" /> Informasi Umum
          </h3>
          {[
            ['Model', lamp.model],
            ['Power Rating', lamp.power_rating ? `${lamp.power_rating} W` : '—'],
            ['Panel Solar', lamp.panel_watt_peak ? `${lamp.panel_watt_peak} Wp` : '—'],
            ['Kapasitas Baterai', lamp.battery_capacity_wh ? `${lamp.battery_capacity_wh} Wh` : '—'],
            ['Firmware', lamp.firmware_version || '—'],
            ['Terpasang', formatDateTime(lamp.installed_at)],
            ['Koordinat', lamp.latitude && lamp.longitude ? `${lamp.latitude}, ${lamp.longitude}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
              <span className="text-text-muted">{label}</span>
              <span className="text-text-primary font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Live Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-green" /> Status Real-time
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Baterai" value={lamp.last_battery_level?.toFixed(0)} unit="%" icon={Battery} color="green" />
            <MetricCard label="Kecerahan" value={lamp.last_brightness?.toFixed(0)} unit="%" icon={Sliders} color="blue" />
            <MetricCard label="Sinyal" value={lamp.last_signal_strength?.toFixed(0)} unit="%" icon={Signal} color="purple" />
            <MetricCard label="Health Score" value={lamp.health_score?.toFixed(0)} unit="%" icon={BarChart2} color={lamp.health_score > 70 ? 'green' : lamp.health_score > 40 ? 'amber' : 'red'} />
          </div>
        </div>
      </div>

      {/* Section 2: Brightness Control */}
      <div className="glass-card p-5 border border-neon-blue/20">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-neon-blue" /> Kontrol Kecerahan
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range" min="0" max="100" value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="flex-1 accent-neon-blue"
          />
          <span className="text-neon-blue font-bold text-lg w-14 text-right">{brightness}%</span>
          <Button
            onClick={applyBrightness}
            disabled={settingBrightness}
            className="flex items-center gap-2 px-4 py-2 font-medium text-bg-primary bg-neon-blue hover:bg-neon-blue/90"
          >
            {settingBrightness ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Terapkan
          </Button>
        </div>
        {isAdmin && (
          <div className="mt-3">
            <Link to={`/dashboard/lamps/${id}/schedule`} className="text-xs text-neon-purple hover:text-neon-purple/80 transition-colors">
              ⚙ Konfigurasi jadwal lampu →
            </Link>
          </div>
        )}
      </div>

      {/* Section 3: ML Prediction */}
      <div className="glass-card p-5 border border-neon-purple/20">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-neon-purple" /> Prediksi Pemeliharaan (ML)
        </h3>
        {!lamp.ml_ready ? (
          <div className="bg-neon-amber/5 border border-neon-amber/20 rounded-lg px-4 py-3 text-sm text-neon-amber">
            ⚠ Data belum cukup untuk prediksi ML. Butuh minimal 48 data telemetri (±4 hari).
            <span className="text-text-muted ml-2">({lamp.telemetry_count || 0}/48)</span>
          </div>
        ) : prediction ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${prediction.risk_level === 'high' ? 'text-neon-red' : prediction.risk_level === 'medium' ? 'text-neon-amber' : 'text-neon-green'}`}>
                {prediction.risk_level?.toUpperCase() || '—'}
              </p>
              <p className="text-xs text-text-muted mt-1">Risk Level</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-neon-amber">{((prediction.failure_probability || 0) * 100).toFixed(0)}%</p>
              <p className="text-xs text-text-muted mt-1">Probabilitas Gagal</p>
            </div>
            <div className="text-center border-r border-border">
              <p className="text-2xl font-bold text-neon-blue">{prediction.days_to_failure ?? '—'}</p>
              <p className="text-xs text-text-muted mt-1">Hari Hingga Gagal</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Rekomendasi</p>
              <p className="text-sm text-text-secondary">{prediction.recommendation || '—'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Belum ada prediksi tersedia.</p>
        )}
      </div>

      {/* Section 4: Recent Alerts & Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neon-red" /> Alert Terbaru
            </h3>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Tidak ada alert</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-sm border-b border-border/30 pb-2 last:border-0">
                  <Badge variant={a.severity === 'critical' ? 'fault' : a.severity === 'warning' ? 'warning' : 'info'} size="sm">{a.severity}</Badge>
                  <span className="text-text-secondary flex-1 truncate">{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Wrench className="w-4 h-4 text-neon-amber" /> Tiket Terbaru
            </h3>
            <Link to="/dashboard/tickets" className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">Lihat semua</Link>
          </div>
          {tickets.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Tidak ada tiket</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-sm border-b border-border/30 pb-2 last:border-0">
                  <Badge variant={t.status === 'open' ? 'warning' : t.status === 'resolved' ? 'success' : 'info'} size="sm">{t.status}</Badge>
                  <Link to={`/dashboard/tickets/${t.id}`} className="text-text-secondary hover:text-neon-blue flex-1 truncate transition-colors">{t.title}</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Device Logs */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-text-muted" /> Device Log
        </h3>
        {deviceLogs.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Tidak ada log</p>
        ) : (
          <div className="space-y-1 font-mono text-xs max-h-64 overflow-y-auto">
            {deviceLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/20 last:border-0">
                <span className="text-text-muted shrink-0">{formatDateTime(log.time)}</span>
                <span className={`shrink-0 font-semibold ${log.log_level === 'error' ? 'text-neon-red' : log.log_level === 'warn' ? 'text-neon-amber' : 'text-neon-green'}`}>
                  [{log.log_level?.toUpperCase()}]
                </span>
                <span className="text-text-secondary">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
