import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb, Wifi, WifiOff, AlertTriangle, Bell, Heart, Battery, Sun,
  TrendingUp, TrendingDown, ArrowRight, Activity, Zap, Users, CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { SkeletonKPI } from '../../components/ui/Skeleton';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import { formatNumber, timeAgo } from '../../lib/utils';

// ── KPI Card ───────────────────────────────────────────────
function KPICard({ label, value, unit, icon: Icon, color, trend, sub, delay = 0 }) {
  const colorMap = {
    blue:   { bg: 'bg-neon-blue/10', border: 'border-neon-blue/20', text: 'text-neon-blue', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]' },
    green:  { bg: 'bg-neon-green/10', border: 'border-neon-green/20', text: 'text-neon-green', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.15)]' },
    red:    { bg: 'bg-neon-red/10', border: 'border-neon-red/20', text: 'text-neon-red', glow: '' },
    amber:  { bg: 'bg-neon-amber/10', border: 'border-neon-amber/20', text: 'text-neon-amber', glow: '' },
    purple: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', text: 'text-neon-purple', glow: '' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card p-5 border ${c.border} ${c.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</span>
        {unit && <span className="text-sm text-text-muted mb-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}% dari kemarin</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Summary Row ────────────────────────────────────────────
function RiskBadge({ label, count, color }) {
  return (
    <div className={`flex-1 glass-card p-4 border ${color.border} text-center`}>
      <p className={`text-2xl font-bold ${color.text}`}>{count}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

// ── Recent Alert Item ──────────────────────────────────────
function AlertItem({ alert }) {
  const sev = alert.severity;
  const colors = { critical: 'text-neon-red bg-neon-red/10', warning: 'text-neon-amber bg-neon-amber/10', info: 'text-neon-blue bg-neon-blue/10' };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colors[sev] || colors.info}`}>{sev}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{alert.message}</p>
        <p className="text-xs text-text-muted mt-0.5">{timeAgo(alert.created_at)}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function DashboardHome() {
  const { user } = useAuthStore();
  const [kpi, setKpi] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [energy, setEnergy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, riskRes, alertsRes, energyRes] = await Promise.allSettled([
          api.get('/monitoring/kpi'),
          api.get('/monitoring/risk-summary'),
          api.get('/alerts?is_resolved=false&limit=5'),
          api.get('/energy/summary'),
        ]);

        if (kpiRes.status === 'fulfilled') setKpi(kpiRes.value.data);
        if (riskRes.status === 'fulfilled') setRiskSummary(riskRes.value.data);
        if (alertsRes.status === 'fulfilled') {
          const d = alertsRes.value.data;
          setAlerts(d.items || d || []);
        }
        if (energyRes.status === 'fulfilled') setEnergy(energyRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">
          Selamat datang, <span className="text-gradient-blue">{user?.name?.split(' ')[0] || 'User'}</span> 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">Ringkasan status sistem lampu PJU hari ini</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonKPI key={i} />)
        ) : (
          <>
            <KPICard label="Total Lampu"    value={formatNumber(kpi?.total_lamps)}   icon={Lightbulb}  color="blue"   delay={0.0} />
            <KPICard label="Online"         value={formatNumber(kpi?.online)}         icon={Wifi}       color="green"  delay={0.05} />
            <KPICard label="Offline"        value={formatNumber(kpi?.offline)}        icon={WifiOff}    color="red"    delay={0.1} />
            <KPICard label="Fault"          value={formatNumber(kpi?.fault)}          icon={AlertTriangle} color="red" delay={0.15} />
            <KPICard label="Alert Hari Ini" value={formatNumber(kpi?.alerts_today)}  icon={Bell}       color="amber"  delay={0.2} />
            <KPICard label="Avg Health"     value={kpi?.avg_health_score?.toFixed(0)} unit="%" icon={Heart} color="purple" delay={0.25} />
            <KPICard label="Avg Baterai"    value={kpi?.avg_battery?.toFixed(0)}      unit="%" icon={Battery} color="green" delay={0.3} />
            <KPICard
              label="Solar Status"
              value={kpi?.solar_status || 'N/A'}
              icon={Sun}
              color={kpi?.solar_status === 'Charging' ? 'amber' : 'blue'}
              delay={0.35}
            />
          </>
        )}
      </div>

      {/* Energy strip + Risk summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Energy Summary Strip */}
        <div className="lg:col-span-2 glass-card p-5 border border-neon-green/20">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-neon-green" />
            <h3 className="text-sm font-semibold text-text-primary">Ringkasan Energi Hari Ini</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-green">{energy?.solar_generated_today?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-text-muted mt-0.5">kWh Dihasilkan</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-neon-blue">{energy?.consumed_today?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-text-muted mt-0.5">kWh Dikonsumsi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-purple">{energy?.efficiency_pct?.toFixed(0) ?? '—'}<span className="text-sm font-normal">%</span></p>
              <p className="text-xs text-text-muted mt-0.5">Efisiensi Sistem</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Link to="/dashboard/energy" className="flex items-center gap-1 text-xs text-neon-green hover:text-neon-green/80 transition-colors">
              Lihat detail energi <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Predictive Risk Summary */}
        <div className="glass-card p-5 border border-neon-purple/20">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-neon-purple" />
            <h3 className="text-sm font-semibold text-text-primary">Prediksi Risiko (ML)</h3>
          </div>
          <div className="flex gap-3">
            <RiskBadge label="High Risk"   count={riskSummary?.high ?? '—'}    color={{ text: 'text-neon-red',    border: 'border-neon-red/20' }} />
            <RiskBadge label="Medium Risk" count={riskSummary?.medium ?? '—'}  color={{ text: 'text-neon-amber',  border: 'border-neon-amber/20' }} />
            <RiskBadge label="Low Risk"    count={riskSummary?.low ?? '—'}     color={{ text: 'text-neon-green',  border: 'border-neon-green/20' }} />
          </div>
          <div className="mt-4 flex justify-end">
            <Link to="/dashboard/monitoring" className="flex items-center gap-1 text-xs text-neon-purple hover:text-neon-purple/80 transition-colors">
              Lihat monitoring <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Alerts + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <div className="glass-card p-5 border border-neon-red/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neon-red" />
              <h3 className="text-sm font-semibold text-text-primary">Alert Terbaru</h3>
            </div>
            <Link to="/dashboard/monitoring" className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">Lihat semua</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-surface shimmer rounded-lg" />)}</div>
          ) : alerts.length > 0 ? (
            alerts.map((a) => <AlertItem key={a.id} alert={a} />)
          ) : (
            <div className="py-8 text-center">
              <CheckCircle className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <p className="text-sm text-text-muted">Tidak ada alert aktif</p>
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Daftar Lampu', icon: Lightbulb, to: '/dashboard/lamps', color: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10' },
              { label: 'Peta Lampu', icon: Activity, to: '/dashboard/map', color: 'text-neon-green border-neon-green/20 bg-neon-green/5 hover:bg-neon-green/10' },
              { label: 'Tiket Perbaikan', icon: AlertTriangle, to: '/dashboard/tickets', color: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5 hover:bg-neon-amber/10' },
              { label: 'Laporan', icon: TrendingUp, to: '/dashboard/reports', color: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 hover:bg-neon-purple/10' },
              ...(isAdmin ? [
                { label: 'Manajemen User', icon: Users, to: '/dashboard/admin/users', color: 'text-text-secondary border-border bg-surface hover:bg-surface-hover' },
                { label: 'Pengaturan', icon: CheckCircle, to: '/dashboard/admin/settings', color: 'text-text-secondary border-border bg-surface hover:bg-surface-hover' },
              ] : []),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${item.color}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
