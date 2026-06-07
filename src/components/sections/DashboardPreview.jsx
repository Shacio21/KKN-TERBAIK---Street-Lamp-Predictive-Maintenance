import { motion } from 'framer-motion';
import { Battery, Sun as SunIcon, Wifi, AlertTriangle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { lampStatuses, energyChartData } from '../../data/mockData';

function StatusBadge({ status }) {
  const styles = {
    online: { bg: '#F0FDF4', color: '#10B981', border: '#A7F3D0', text: 'Online' },
    offline: { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA', text: 'Offline' },
    warning: { bg: '#FFFBEB', color: '#F59E0B', border: '#FDE68A', text: 'Warning' },
  };
  const s = styles[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className={`status-dot ${status}`} />
      {s.text}
    </span>
  );
}

function BatteryIndicator({ level }) {
  const color = level > 60 ? '#10B981' : level > 30 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-[#64748B]">{level}%</span>
    </div>
  );
}

function EnergyChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.generated, d.consumed)));

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            {/* Generated bar */}
            <motion.div
              className="w-full rounded-t"
              style={{
                background: '#F59E0B',
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
                background: '#2563EB',
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
          <span key={i} className="flex-1 text-center text-[8px] text-[#94A3B8]">{d.hour}h</span>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#F59E0B' }} />
          <span className="text-[10px] text-[#64748B]">Generated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#2563EB' }} />
          <span className="text-[10px] text-[#64748B]">Consumed</span>
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
    <section id="dashboard" className="relative section-padding bg-[#F8FAFC] overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#2563EB] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            Dashboard
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6 text-[#0F172A]">
            Infrastructure Monitoring Dashboard
          </h2>
          <p className="text-[#475569] text-base md:text-lg">
            A unified dashboard providing complete visibility across your 
            village street lamp network — status, energy, and maintenance at a glance.
          </p>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          className="bg-white rounded-2xl p-4 md:p-6 border border-[#E2E8F0] shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="font-semibold text-sm text-[#0F172A]">Network Overview</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium">
              <span className="text-[#10B981]">{onlineCount} Online</span>
              <span className="text-[#F59E0B]">{warningCount} Warning</span>
              <span className="text-[#EF4444]">{offlineCount} Offline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lamp status table */}
            <div className="lg:col-span-2">
              <GlassCard hover={false} className="p-4 overflow-x-auto">
                <h4 className="text-[#0F172A] text-sm font-medium mb-4">Lamp Network Status</h4>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-[#64748B] border-b border-[#E2E8F0]">
                      <th className="text-left pb-2 font-medium">ID</th>
                      <th className="text-left pb-2 font-medium">Location</th>
                      <th className="text-left pb-2 font-medium">Status</th>
                      <th className="text-left pb-2 font-medium">Battery</th>
                      <th className="text-left pb-2 font-medium">Brightness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lampStatuses.map((lamp) => (
                      <tr key={lamp.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2.5 font-mono text-[#2563EB] font-medium">{lamp.id}</td>
                        <td className="py-2.5 text-[#475569]">{lamp.location}</td>
                        <td className="py-2.5"><StatusBadge status={lamp.status} /></td>
                        <td className="py-2.5"><BatteryIndicator level={lamp.battery} /></td>
                        <td className="py-2.5">
                          <span className="text-[#475569]">{lamp.brightness}%</span>
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
                <h4 className="text-[#0F172A] text-sm font-medium mb-4">Energy Flow (24h)</h4>
                <EnergyChart data={energyChartData} />
              </GlassCard>

              {/* Quick stats */}
              <GlassCard hover={false} className="p-4">
                <h4 className="text-[#0F172A] text-sm font-medium mb-3">Quick Summary</h4>
                <div className="space-y-3">
                  {[
                    { icon: Battery, label: 'Avg Battery', value: '79%', color: '#10B981' },
                    { icon: SunIcon, label: 'Solar Status', value: 'Charging', color: '#F59E0B' },
                    { icon: Wifi, label: 'Network', value: '87.5% Online', color: '#2563EB' },
                    { icon: AlertTriangle, label: 'Active Alerts', value: '1', color: '#F59E0B' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-[#475569] text-[11px]">{label}</span>
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
