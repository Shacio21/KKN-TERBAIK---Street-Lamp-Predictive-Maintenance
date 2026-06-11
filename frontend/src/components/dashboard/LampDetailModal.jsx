import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Battery, Sun, Cpu, Lightbulb, Wrench, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatusBadge from './StatusBadge';
import CircularProgress from './CircularProgress';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'sensors', label: 'Sensors', icon: TrendingUp },
  { id: 'maintenance', label: 'History', icon: Wrench },
  { id: 'predictions', label: 'Predictions', icon: Cpu },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs shadow-lg">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function LampDetailModal({ lamp, lampDetail, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lamp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-hidden glass-strong border border-border rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)]">
                  Lamp {lamp.id}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-text-muted" />
                  <span className="text-xs text-text-muted">{lamp.location}</span>
                  <StatusBadge status={lamp.status} size="sm" />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            {activeTab === 'overview' && (
              <OverviewTab lamp={lamp} />
            )}
            {activeTab === 'sensors' && (
              <SensorsTab data={lampDetail?.sensorTimeSeries} />
            )}
            {activeTab === 'maintenance' && (
              <MaintenanceTab history={lampDetail?.maintenanceHistory} />
            )}
            {activeTab === 'predictions' && (
              <PredictionsTab lamp={lamp} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function OverviewTab({ lamp }) {
  const infoItems = [
    { icon: MapPin, label: 'Location', value: lamp.location },
    { icon: Calendar, label: 'Installed', value: lamp.installDate },
    { icon: Wrench, label: 'Last Maintenance', value: lamp.lastMaintenance },
    { icon: Activity, label: 'Uptime', value: `${lamp.uptime}%` },
    { icon: Lightbulb, label: 'Brightness', value: `${Math.round(lamp.brightness)}%` },
    { icon: Sun, label: 'Power Output', value: `${lamp.powerOutput}W` },
  ];

  return (
    <div className="space-y-6">
      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {infoItems.map((item) => (
          <div key={item.label} className="glass-card p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{item.label}</span>
            </div>
            <p className="text-sm font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Health Gauges */}
      <div className="glass-card p-5 border border-border">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Component Health</h4>
        <div className="grid grid-cols-4 gap-4">
          <CircularProgress value={lamp.batteryHealth} size={80} label="Battery" />
          <CircularProgress value={lamp.solarEfficiency} size={80} label="Solar Panel" />
          <CircularProgress value={lamp.ledHealth} size={80} label="LED" />
          <CircularProgress value={lamp.espHealth} size={80} label="ESP32" />
        </div>
      </div>
    </div>
  );
}

function SensorsTab({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No sensor data available</p>;
  }

  const charts = [
    { key: 'batteryVoltage', name: 'Battery Voltage (V)', color: '#00FF88' },
    { key: 'temperature', name: 'Temperature (°C)', color: '#EF4444' },
    { key: 'solarPower', name: 'Solar Power (W)', color: '#F59E0B' },
    { key: 'brightness', name: 'Brightness (%)', color: '#8B5CF6' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart) => (
        <div key={chart.key} className="glass-card p-4 border border-border">
          <p className="text-xs font-semibold text-text-muted mb-3">{chart.name}</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748B' }} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: '#64748B' }} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

function MaintenanceTab({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No maintenance history</p>;
  }

  const typeColors = {
    Preventive: 'text-neon-green border-neon-green/30 bg-neon-green/10',
    Corrective: 'text-neon-amber border-neon-amber/30 bg-neon-amber/10',
    Emergency: 'text-neon-red border-neon-red/30 bg-neon-red/10',
  };

  return (
    <div className="space-y-3">
      {history.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card p-4 border border-border flex items-start gap-4"
        >
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border ${typeColors[entry.type]?.includes('green') ? 'border-neon-green bg-neon-green/30' : typeColors[entry.type]?.includes('red') ? 'border-neon-red bg-neon-red/30' : 'border-neon-amber bg-neon-amber/30'}`} />
            {i < history.length - 1 && <div className="w-px h-full bg-border mt-1" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${typeColors[entry.type] || ''}`}>
                {entry.type}
              </span>
              <span className="text-xs text-text-muted">{entry.date}</span>
            </div>
            <p className="text-sm text-text-primary">{entry.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
              <span>Tech: {entry.technician}</span>
              <span>Cost: ${entry.cost}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PredictionsTab({ lamp }) {
  const risks = [
    { label: 'Battery Failure', risk: 100 - lamp.batteryHealth, color: '#00FF88' },
    { label: 'Solar Degradation', risk: 100 - lamp.solarEfficiency, color: '#F59E0B' },
    { label: 'LED Failure', risk: 100 - lamp.ledHealth, color: '#8B5CF6' },
    { label: 'Controller Fault', risk: 100 - lamp.espHealth, color: '#00D4FF' },
  ];

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 border border-border">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Failure Risk Breakdown</h4>
        <div className="space-y-4">
          {risks.map((r) => (
            <div key={r.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-text-secondary font-medium">{r.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: r.risk > 50 ? '#EF4444' : r.risk > 25 ? '#F59E0B' : '#00FF88' }}>
                  {Math.round(r.risk)}%
                </span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.risk}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${r.color}40, ${r.color})`,
                    boxShadow: `0 0 8px ${r.color}40`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 border border-neon-purple/20">
        <h4 className="text-sm font-semibold text-text-primary mb-2">AI Recommendation</h4>
        <p className="text-sm text-text-secondary leading-relaxed">
          {lamp.status === 'critical'
            ? `Immediate attention required. This lamp shows multiple degrading components. Priority maintenance should be scheduled within the next 48 hours to prevent complete failure.`
            : lamp.status === 'warning'
            ? `This lamp requires monitoring. Schedule a preventive maintenance visit within the next 2 weeks. Focus on the component with the highest risk score.`
            : `This lamp is operating within normal parameters. Continue regular maintenance schedule. Next scheduled check recommended in 30 days.`
          }
        </p>
      </div>
    </div>
  );
}
