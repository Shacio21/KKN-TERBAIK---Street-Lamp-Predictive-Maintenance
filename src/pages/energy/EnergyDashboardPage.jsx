import { useState, useEffect } from 'react';
import { Zap, Leaf, TrendingUp, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SkeletonKPI, SkeletonChart } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import { formatNumber, formatRupiah } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-border">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong></p>
      ))}
    </div>
  );
};

function MetricCard({ label, value, unit, sub, icon: Icon, color }) {
  const colors = {
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green',
    blue: 'border-neon-blue/20 bg-neon-blue/5 text-neon-blue',
    amber: 'border-neon-amber/20 bg-neon-amber/5 text-neon-amber',
    purple: 'border-neon-purple/20 bg-neon-purple/5 text-neon-purple',
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`glass-card p-5 border ${c.split(' ')[0]} ${c.split(' ')[1]}`}>
      <Icon className={`w-5 h-5 ${c.split(' ')[2]} mb-3`} />
      <p className={`text-3xl font-bold ${c.split(' ')[2]}`}>{value ?? '—'}{unit && <span className="text-sm font-normal ml-0.5">{unit}</span>}</p>
      <p className="text-sm font-medium text-text-secondary mt-1">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function EnergyDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [flow, setFlow] = useState([]);
  const [costComp, setCostComp] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, flowRes, costRes] = await Promise.allSettled([
        api.get('/energy/summary'),
        api.get('/energy/flow'),
        api.get('/energy/cost-comparison'),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (flowRes.status === 'fulfilled') {
        const d = flowRes.value.data;
        setFlow(d.items || d || []);
      }
      if (costRes.status === 'fulfilled') setCostComp(costRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived values from summary
  const co2Today = summary ? (summary.solar_generated_today * 0.85).toFixed(2) : null;
  const treesToday = summary ? ((summary.solar_generated_today * 0.85) / 21.77).toFixed(1) : null;
  const co2Total = summary?.co2_avoided_kg?.toFixed(1) ?? '—';
  const treesTotal = summary ? (summary.co2_avoided_kg / 21.77).toFixed(0) : '—';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-green" /> Energi & Sustainability
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Performa energi surya dan dampak lingkungan</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />) : (
          <>
            <MetricCard label="Solar Dihasilkan" value={summary?.solar_generated_today?.toFixed(2)} unit="kWh" icon={Zap} color="green" sub="Hari ini" />
            <MetricCard label="Dikonsumsi" value={summary?.consumed_today?.toFixed(2)} unit="kWh" icon={TrendingUp} color="blue" sub="Hari ini" />
            <MetricCard label="CO₂ Tersimpan" value={co2Today} unit="kg" icon={Leaf} color="green" sub={`≈ ${treesToday} pohon`} />
            <MetricCard label="Efisiensi Sistem" value={summary?.efficiency_pct?.toFixed(0)} unit="%" icon={TrendingUp} color="amber" />
          </>
        )}
      </div>

      {/* Energy Flow Chart */}
      <div className="glass-card p-5 border border-neon-green/20">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Aliran Energi 24 Jam</h3>
        {loading ? <SkeletonChart /> : (
          flow.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={flow}>
                <defs>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="solar_power" name="Solar (W)" stroke="#00FF88" fill="url(#gradSolar)" strokeWidth={2} />
                <Area type="monotone" dataKey="load_power" name="Konsumsi (W)" stroke="#00D4FF" fill="url(#gradConsumed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-text-muted text-sm">Belum ada data aliran energi</div>
          )
        )}
      </div>

      {/* Cost Comparison */}
      {!loading && costComp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 border border-neon-amber/20">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Perbandingan Biaya Bulanan</h3>
            <div className="space-y-4">
              {[
                { label: 'Lampu Konvensional', value: formatRupiah(costComp.traditional_monthly_cost), color: 'text-neon-red' },
                { label: 'Smart Solar PJU', value: formatRupiah(costComp.smart_monthly_cost), color: 'text-neon-green' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary font-medium">Penghematan</span>
                  <span className="text-neon-green font-bold">{formatRupiah(costComp.estimated_saving)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 border border-neon-green/20">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-neon-green" /> Dampak Lingkungan Kumulatif
            </h3>
            <div className="space-y-3">
              {[
                { label: 'CO₂ Tersimpan Total', value: `${co2Total} kg` },
                { label: 'Setara Pohon', value: `${treesTotal} pohon` },
                { label: 'Energi Solar Total', value: `${summary?.solar_generated_kwh?.toFixed(1) ?? '—'} kWh` },
                { label: 'Jumlah Lampu', value: `${summary?.lamp_count ?? '—'} unit` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-neon-green font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
