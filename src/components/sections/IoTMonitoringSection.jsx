import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Cloud, Radio } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { connectionStatus as fallbackConnectionStatus, iotGauges as fallbackIotGauges } from '../../data/mockData';

function AnimatedGauge({ value, max, color, label, unit }) {
  const [current, setCurrent] = useState(0);
  const percentage = (current / max) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  useEffect(() => {
    const timer = setTimeout(() => setCurrent(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Animated arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="heading-display text-xl md:text-2xl text-text-primary">
            {current}
          </span>
          <span className="text-text-muted text-xs">{unit}</span>
        </div>
      </div>
      <span className="text-text-secondary text-xs mt-2 text-center">{label}</span>
    </div>
  );
}

function ConnectionCard({ icon: Icon, name, status }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="relative">
        <Icon className="w-5 h-5 text-neon-green" />
        {status.connected && (
          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-green transition-opacity duration-500 ${pulse ? 'opacity-100' : 'opacity-40'}`} />
        )}
      </div>
      <div className="flex-1">
        <span className="text-text-primary text-xs font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${status.connected ? 'online' : 'offline'}`} />
          <span className="text-text-muted text-[10px]">
            {status.connected ? (status.latency ? `${status.latency}ms` : status.signal ? `${status.signal}%` : status.lastSync) : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function IoTMonitoringSection({ gauges = fallbackIotGauges, connection = fallbackConnectionStatus, kpi = null, isLive = false }) {
  const stats = [
    { label: 'Packets Sent', value: kpi?.total_lamps ? `${kpi.total_lamps}` : '12.4K', color: '#00D4FF' },
    { label: 'Uptime', value: kpi?.total_lamps ? `${Math.round((kpi.online_lamps / kpi.total_lamps) * 100)}%` : '99.97%', color: '#00FF88' },
    { label: 'Alerts', value: `${kpi?.unresolved_alerts ?? 0}`, color: (kpi?.unresolved_alerts ?? 0) > 0 ? '#F59E0B' : '#00FF88' },
  ];

  return (
    <section id="monitoring" className="relative section-padding bg-bg-primary overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)' }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-blue text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            IoT Monitoring
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#E2E8F0" to="#00D4FF">
              Real-Time Intelligence
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            Monitor every aspect of your street lamp network with live telemetry data,
            intelligent alerts, and cloud-connected dashboards.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauges panel */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-6 md:p-8">
              <h3 className="heading-section text-lg text-text-primary mb-6">
                System Telemetry
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gauges.map((gauge) => (
                  <AnimatedGauge key={gauge.id} {...gauge} />
                ))}
              </div>

              {/* Bottom stats bar */}
              <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="heading-display text-lg block" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-text-muted text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Connection status */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="heading-section text-lg text-text-primary mb-6">
                Connectivity
              </h3>
              <div className="mb-4 inline-flex items-center gap-2 text-[10px] text-text-muted">
                <span className={`status-dot ${isLive ? 'online' : 'warning'}`} />
                {isLive ? 'Live backend data' : 'Demo data fallback'}
              </div>
              <div className="space-y-3">
                <ConnectionCard icon={Wifi} name="WiFi 802.11n" status={connection.wifi} />
                <ConnectionCard icon={Radio} name="MQTT Broker" status={connection.mqtt} />
                <ConnectionCard icon={Cloud} name="Cloud Sync" status={connection.cloud} />
              </div>

              {/* Signal visualization */}
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-text-muted text-xs mb-3 block">Signal Strength</span>
                <div className="flex items-end gap-1 h-12">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const height = 28 + Math.sin(i * 0.5) * 16 + ((i * 17) % 9);
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ background: '#00D4FF', opacity: 0.3 + (i / 20) * 0.7 }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                      />
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
