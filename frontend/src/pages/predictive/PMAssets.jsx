import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Server, Search, Filter, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import usePredictiveData from '../../hooks/usePredictiveData';
import SectionHeader from '../../components/dashboard/SectionHeader';
import AssetHealthPanel from '../../components/predictive/AssetHealthPanel';
import StatusBadge from '../../components/dashboard/StatusBadge';
import LampDetailModal from '../../components/dashboard/LampDetailModal';

const statusColors = { healthy: '#00FF88', warning: '#F59E0B', critical: '#EF4444' };

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-2 rounded-lg text-xs border border-border">
      <span style={{ color: payload[0].payload.fill }}>{payload[0].name}: </span>
      <span className="font-bold text-text-primary">{payload[0].value}</span>
    </div>
  );
}

export default function PMAssets() {
  const { lamps, assetHealth, lampDetail } = usePredictiveData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLamp, setSelectedLamp] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = [...lamps];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.id.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.sector.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter);
    }
    return result;
  }, [lamps, search, statusFilter]);

  const pieData = useMemo(() => {
    const counts = { healthy: 0, warning: 0, critical: 0 };
    lamps.forEach((l) => { if (counts[l.status] !== undefined) counts[l.status]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: statusColors[name] }));
  }, [lamps]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          Asset <span className="text-gradient-blue">Management</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">All street lamp assets and component health overview</p>
      </motion.div>

      {/* Asset Health */}
      <div>
        <SectionHeader icon={Server} title="Component Health Overview" color="green" />
        <AssetHealthPanel assetHealth={assetHealth} />
      </div>

      {/* Distribution + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-5 border border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-text-muted capitalize">{d.name}</span>
                <span className="font-bold text-text-primary">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Table */}
        <div className="lg:col-span-3 glass-card border border-border overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface rounded-xl px-3 py-2 border border-border focus-within:border-neon-blue/30 transition-colors">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search lamp ID, location, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-text-primary outline-none w-full placeholder:text-text-muted"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-secondary hover:border-neon-blue/30 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-1 right-0 z-20 glass-strong border border-border rounded-xl overflow-hidden py-1 min-w-[140px]"
                >
                  {['all', 'healthy', 'warning', 'critical'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                      className={`block w-full text-left px-3 py-2 text-xs capitalize transition-colors ${
                        statusFilter === s ? 'text-neon-blue bg-neon-blue/10' : 'text-text-secondary hover:bg-surface-hover'
                      }`}
                    >
                      {s === 'all' ? 'All Status' : s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <span className="text-[11px] text-text-muted">{filtered.length} lamps</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" style={{ maxHeight: 480 }}>
            <table className="w-full">
              <thead className="sticky top-0 bg-bg-secondary z-10">
                <tr className="border-b border-border">
                  {['Lamp ID', 'Location', 'Sector', 'Status', 'Battery', 'Solar', 'LED', 'Uptime'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((lamp, i) => (
                  <tr
                    key={lamp.id}
                    onClick={() => setSelectedLamp(lamp)}
                    className="border-b border-border/30 hover:bg-surface-hover/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm font-semibold text-neon-blue font-[family-name:var(--font-display)]">{lamp.id}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{lamp.location}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{lamp.sector}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={lamp.status} /></td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${lamp.batteryHealth >= 70 ? 'text-neon-green' : lamp.batteryHealth >= 40 ? 'text-neon-amber' : 'text-neon-red'}`}>
                        {lamp.batteryHealth}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${lamp.solarEfficiency >= 70 ? 'text-neon-green' : lamp.solarEfficiency >= 40 ? 'text-neon-amber' : 'text-neon-red'}`}>
                        {lamp.solarEfficiency}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${lamp.ledHealth >= 70 ? 'text-neon-green' : lamp.ledHealth >= 40 ? 'text-neon-amber' : 'text-neon-red'}`}>
                        {lamp.ledHealth}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-text-secondary">{lamp.uptime}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedLamp && (
        <LampDetailModal lamp={selectedLamp} lampDetail={lampDetail} onClose={() => setSelectedLamp(null)} />
      )}
    </div>
  );
}
