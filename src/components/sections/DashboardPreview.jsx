import { motion } from 'framer-motion';
import { Battery, Sun as SunIcon, Wifi, AlertTriangle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { lampStatuses, energyChartData } from '../../data/mockData';

function StatusBadge({ status }) {
  const styles = {
    online: { bg: 'rgba(0,255,136,0.1)', color: '#00FF88', text: 'Online' },
    offline: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', text: 'Offline' },
    warning: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', text: 'Warning' },
  };
  const s = styles[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: s.bg, color: s.color }}>
      <span className={`status-dot ${status}`} />
      {s.text}
    </span>
  );
}

function BatteryIndicator({ level }) {
  const color = level > 60 ? '#00FF88' : level > 30 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-3 rounded-full bg-surface overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-text-muted">{level}%</span>
    </div>
  );
}

function EnergyChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.generated, d.consumed)));
  const barWidth = 100 / data.length;

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            {/* Generated bar */}
            <motion.div
              className="w-full rounded-t"
              style={{
                background: 'linear-gradient(180deg, #F59E0B, #F59E0B40)',
                maxWidth: '12px',
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.generated / maxVal) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />
            {/* Consumed bar */}
            <motion.div
              className="w-full rounded-t"
              style={{
                background: 'linear-gradient(180deg, #00D4FF, #00D4FF40)',
                maxWidth: '12px',
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.consumed / maxVal) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[8px] text-text-muted">{d.hour}h</span>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#F59E0B' }} />
          <span className="text-[10px] text-text-muted">Generated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#00D4FF' }} />
          <span className="text-[10px] text-text-muted">Consumed</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const onlineCount = lampStatuses.filter(l => l.status === 'online').length;
  const warningCount = lampStatuses.filter(l => l.status === 'warning').length;
  const offlineCount = lampStatuses.filter(l => l.status === 'offline').length;

  return (
    <section id="dashboard" className="relative section-padding bg-gradient-section overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-blue text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            Dashboard
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#E2E8F0" to="#00D4FF">
              Command & Control Center
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            A unified dashboard providing complete visibility across your entire 
            street lamp network — from a single lamp to an entire city.
          </p>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          className="glass-strong rounded-2xl p-4 md:p-6 border border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-neon-green animate-[neon-pulse_2s_ease-in-out_infinite]" />
              <span className="heading-section text-sm text-text-primary">Network Overview</span>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-neon-green">{onlineCount} Online</span>
              <span className="text-neon-amber" style={{ color: '#F59E0B' }}>{warningCount} Warning</span>
              <span className="text-neon-red" style={{ color: '#EF4444' }}>{offlineCount} Offline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lamp status table */}
            <div className="lg:col-span-2">
              <GlassCard hover={false} className="p-4 overflow-x-auto">
                <h4 className="text-text-primary text-sm font-medium mb-4">Lamp Network Status</h4>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="text-left pb-2 font-medium">ID</th>
                      <th className="text-left pb-2 font-medium">Location</th>
                      <th className="text-left pb-2 font-medium">Status</th>
                      <th className="text-left pb-2 font-medium">Battery</th>
                      <th className="text-left pb-2 font-medium">Brightness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lampStatuses.map((lamp) => (
                      <tr key={lamp.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                        <td className="py-2.5 font-mono text-neon-blue">{lamp.id}</td>
                        <td className="py-2.5 text-text-secondary">{lamp.location}</td>
                        <td className="py-2.5"><StatusBadge status={lamp.status} /></td>
                        <td className="py-2.5"><BatteryIndicator level={lamp.battery} /></td>
                        <td className="py-2.5">
                          <span className="text-text-secondary">{lamp.brightness}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Energy chart */}
              <GlassCard hover={false} className="p-4">
                <h4 className="text-text-primary text-sm font-medium mb-4">Energy Flow (24h)</h4>
                <EnergyChart data={energyChartData} />
              </GlassCard>

              {/* Quick stats */}
              <GlassCard hover={false} className="p-4">
                <h4 className="text-text-primary text-sm font-medium mb-3">Quick Summary</h4>
                <div className="space-y-3">
                  {[
                    { icon: Battery, label: 'Avg Battery', value: '79%', color: '#00FF88' },
                    { icon: SunIcon, label: 'Solar Status', value: 'Charging', color: '#F59E0B' },
                    { icon: Wifi, label: 'Network', value: '87.5% Online', color: '#00D4FF' },
                    { icon: AlertTriangle, label: 'Active Alerts', value: '1', color: '#F59E0B' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-text-secondary text-[11px]">{label}</span>
                      </div>
                      <span className="text-[11px] font-medium" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
