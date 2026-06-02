import { motion } from 'framer-motion';
import { Radio, Wifi, Clock, Signal } from 'lucide-react';
import usePredictiveData from '../../hooks/usePredictiveData';
import SectionHeader from '../../components/dashboard/SectionHeader';
import SensorGrid from '../../components/dashboard/SensorGrid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs shadow-lg border border-border">
      <p className="text-text-muted mb-1">Reading #{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  );
}

export default function PMMonitoring() {
  const { sensorMeta, liveSensors, sparklines } = usePredictiveData();

  const connectionStatus = {
    mqtt: { connected: true, latency: 42 },
    wifi: { connected: true, signal: 94 },
    cloud: { connected: true, lastSync: '2s ago' },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          Real-Time <span className="text-gradient-green">Monitoring</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Live sensor data and system telemetry</p>
      </motion.div>

      {/* Connection Status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'MQTT Broker', status: connectionStatus.mqtt.connected, detail: `${connectionStatus.mqtt.latency}ms latency`, icon: Signal, color: '#00FF88' },
          { label: 'WiFi Network', status: connectionStatus.wifi.connected, detail: `${connectionStatus.wifi.signal}% signal`, icon: Wifi, color: '#00D4FF' },
          { label: 'Cloud Sync', status: connectionStatus.cloud.connected, detail: connectionStatus.cloud.lastSync, icon: Clock, color: '#8B5CF6' },
        ].map((conn, i) => (
          <motion.div
            key={conn.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 border border-border flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: conn.color + '15', border: `1px solid ${conn.color}30` }}>
              <conn.icon className="w-4 h-4" style={{ color: conn.color }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-primary">{conn.label}</p>
              <p className="text-[10px] text-text-muted">{conn.detail}</p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${conn.status ? 'bg-neon-green' : 'bg-neon-red'}`} style={{ boxShadow: conn.status ? '0 0 8px rgba(0,255,136,0.6)' : '0 0 8px rgba(239,68,68,0.6)' }} />
          </motion.div>
        ))}
      </div>

      {/* Live Sensor Widgets */}
      <div>
        <SectionHeader
          icon={Radio}
          title="Live Sensor Readings"
          subtitle="Values update every 2 seconds"
          color="green"
          action={
            <span className="flex items-center gap-1.5 text-[11px] text-neon-green">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              LIVE
            </span>
          }
        />
        <SensorGrid sensorMeta={sensorMeta} liveSensors={liveSensors} sparklines={sparklines} />
      </div>

      {/* Sensor Detail Charts */}
      <div>
        <SectionHeader icon={Radio} title="Sensor Trend Charts" subtitle="Last 20 readings per sensor" color="blue" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sparklines).slice(0, 4).map(([key, data]) => {
            const meta = sensorMeta[key];
            return (
              <div key={key} className="glass-card p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="text-xs font-semibold text-text-primary capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-[10px] text-text-muted ml-auto">
                    Current: <span className="font-bold" style={{ color: meta.color }}>{liveSensors[key]?.toFixed(1)} {meta.unit}</span>
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={data}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748B' }} width={40} domain={['auto', 'auto']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="value" stroke={meta.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
