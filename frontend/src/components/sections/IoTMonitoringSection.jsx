import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Cloud, Radio } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { iotGauges, connectionStatus } from '../../data/mockData';

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
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="6" />
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
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="heading-display text-xl md:text-2xl text-[#0F172A]">
            {current}
          </span>
          <span className="text-[#64748B] text-xs">{unit}</span>
        </div>
      </div>
      <span className="text-[#475569] text-xs mt-2 text-center">{label}</span>
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
      <div className="relative">
        <Icon className="w-5 h-5 text-[#10B981]" />
        {status.connected && (
          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981] transition-opacity duration-500 ${pulse ? 'opacity-100' : 'opacity-40'}`} />
        )}
      </div>
      <div className="flex-1">
        <span className="text-[#0F172A] text-xs font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${status.connected ? 'online' : 'offline'}`} />
          <span className="text-[#64748B] text-[10px]">
            {status.connected ? (status.latency ? `${status.latency}ms` : status.signal ? `${status.signal}%` : status.lastSync) : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function IoTMonitoringSection() {
  return (
    <section id="monitoring" className="relative section-padding bg-white overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#2563EB] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            IoT Monitoring
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6 text-[#0F172A]">
            Street Lamp Monitoring
          </h2>
          <p className="text-[#475569] text-base md:text-lg">
            Monitor every aspect of your street lamp network with live telemetry data,
            status alerts, and cloud-connected dashboards.
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
              <h3 className="font-semibold text-lg text-[#0F172A] mb-6">
                System Telemetry
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {iotGauges.map((gauge) => (
                  <AnimatedGauge key={gauge.id} {...gauge} />
                ))}
              </div>

              {/* Bottom stats bar */}
              <div className="mt-6 pt-4 border-t border-[#E2E8F0] grid grid-cols-3 gap-4">
                {[
                  { label: 'Packets Sent', value: '12.4K', color: '#2563EB' },
                  { label: 'Uptime', value: '99.97%', color: '#10B981' },
                  { label: 'Alerts', value: '0', color: '#10B981' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="heading-display text-lg block" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-[#64748B] text-xs">{s.label}</span>
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
              <h3 className="font-semibold text-lg text-[#0F172A] mb-6">
                Connectivity
              </h3>
              <div className="space-y-3">
                <ConnectionCard icon={Wifi} name="WiFi 802.11n" status={connectionStatus.wifi} />
                <ConnectionCard icon={Radio} name="MQTT Broker" status={connectionStatus.mqtt} />
                <ConnectionCard icon={Cloud} name="Cloud Sync" status={connectionStatus.cloud} />
              </div>

              {/* Signal visualization */}
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <span className="text-[#64748B] text-xs mb-3 block">Signal Strength</span>
                <div className="flex items-end gap-1 h-12">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ background: '#2563EB', opacity: 0.2 + (i / 20) * 0.6 }}
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
