import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, Battery, Zap, Download, RefreshCw } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SkeletonKPI, SkeletonChart } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import { formatNumber } from '../../lib/utils';
import { Button } from "@/components/ui/button";

const CHART_COLORS = {
  voltage: '#00D4FF',
  current: '#8B5CF6',
  power: '#F59E0B',
  solar: '#00FF88',
  consumed: '#00D4FF',
  battery: '#00FF88',
  lux: '#F59E0B',
  temp_internal: '#EF4444',
  temp_ambient: '#F59E0B',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-border">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value?.toFixed(2)}</strong></p>
      ))}
    </div>
  );
};

function KPICard({ label, value, unit, icon: Icon, color }) {
  const map = {
    blue: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    red: 'text-neon-red border-neon-red/20 bg-neon-red/5',
    amber: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5',
  };
  const c = map[color] || map.blue;
  return (
    <div className={`glass-card p-4 border ${c}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-muted">{label}</p>
        <Icon className={`w-4 h-4 ${c.split(' ')[0]}`} />
      </div>
      <p className={`text-2xl font-bold ${c.split(' ')[0]}`}>{value ?? '—'}{unit && <span className="text-sm font-normal ml-0.5">{unit}</span>}</p>
    </div>
  );
}

export default function MonitoringPage() {
  const [kpi, setKpi] = useState(null);
  const [trend, setTrend] = useState([]);
  const [riskSummary, setRiskSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('24h');
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const limitMap = { '24h': 100, '7d': 300, '30d': 500 };
      const [kpiRes, trendRes, riskRes] = await Promise.allSettled([
        api.get('/monitoring/kpi'),
        api.get(`/monitoring/trend?limit=${limitMap[range] || 100}`),
        api.get('/monitoring/risk-summary'),
      ]);
      if (kpiRes.status === 'fulfilled') setKpi(kpiRes.value.data);
      if (trendRes.status === 'fulfilled') {
        const d = trendRes.value.data;
        setTrend(d.items || d || []);
      }
      if (riskRes.status === 'fulfilled') setRiskSummary(riskRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [range]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/monitoring/telemetry/export', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telemetry_export_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      import('react-hot-toast').then(({ default: toast }) => toast.error('Gagal mengekspor data'));
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon-blue" /> Dashboard Monitoring
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Telemetri dan analitik sistem lampu PJU</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Mengekspor...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
        ) : (
          <>
            <KPICard label="Online" value={formatNumber(kpi?.online)} icon={Wifi} color="green" />
            <KPICard label="Fault" value={formatNumber(kpi?.fault)} icon={WifiOff} color="red" />
            <KPICard label="Warning" value={formatNumber(kpi?.warning)} icon={AlertTriangle} color="amber" />
            <KPICard label="Uptime" value={kpi?.uptime_pct?.toFixed(1)} unit="%" icon={Activity} color="blue" />
          </>
        )}
      </div>

      {/* Range selector + Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-card p-5 border border-neon-blue/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Tren Telemetri</h3>
            <div className="flex gap-1">
              {['24h', '7d', '30d'].map((r) => (
                <Button 
                  key={r} 
                  variant={range === r ? 'outline' : 'ghost'} 
                  size="sm"
                  onClick={() => setRange(r)}
                  className={range === r ? 'border-neon-blue/30 text-neon-blue bg-neon-blue/10' : ''}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          {loading ? <div className="h-52 bg-surface shimmer rounded-lg" /> : (
            trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={208}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="voltage" name="Voltage (V)" stroke={CHART_COLORS.voltage} dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="power" name="Power (W)" stroke={CHART_COLORS.power} dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-text-muted text-sm">Belum ada data tren</div>
            )
          )}
        </div>

        {/* Risk Summary */}
        <div className="glass-card p-5 border border-neon-purple/20">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-purple" /> Distribusi Risiko ML
          </h3>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-surface shimmer rounded-lg" />)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'High Risk', count: riskSummary?.high ?? 0, color: 'bg-neon-red', text: 'text-neon-red' },
                { label: 'Medium Risk', count: riskSummary?.medium ?? 0, color: 'bg-neon-amber', text: 'text-neon-amber' },
                { label: 'Low Risk', count: riskSummary?.low ?? 0, color: 'bg-neon-green', text: 'text-neon-green' },
                { label: 'Unknown', count: riskSummary?.unknown ?? 0, color: 'bg-text-muted', text: 'text-text-muted' },
              ].map((r) => {
                const total = (riskSummary?.high || 0) + (riskSummary?.medium || 0) + (riskSummary?.low || 0) + (riskSummary?.unknown || 0) || 1;
                const pct = (r.count / total * 100).toFixed(0);
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">{r.label}</span>
                      <span className={`font-semibold ${r.text}`}>{r.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-surface-active rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Energy Flow Chart */}
      <div className="glass-card p-5 border border-neon-green/20">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-green" /> Aliran Energi (Solar vs Konsumsi)
        </h3>
        {loading ? <div className="h-48 bg-surface shimmer rounded-lg" /> : (
          trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={192}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="solar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="consumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="solar_power" name="Solar (W)" stroke="#00FF88" fill="url(#solar)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="power" name="Konsumsi (W)" stroke="#00D4FF" fill="url(#consumed)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">Belum ada data energi</div>
          )
        )}
      </div>
    </div>
  );
}
