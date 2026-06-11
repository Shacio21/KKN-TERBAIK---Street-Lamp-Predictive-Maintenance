import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Radio, Brain, Shield, Info, Monitor } from 'lucide-react';
import SectionHeader from '../../components/dashboard/SectionHeader';

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-neon-blue' : 'bg-surface-active'
      }`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-0">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100, unit = '' }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 h-1.5 bg-surface-active rounded-full appearance-none cursor-pointer accent-neon-blue"
      />
      <span className="text-xs font-bold text-neon-blue tabular-nums w-12 text-right">{value}{unit}</span>
    </div>
  );
}

export default function PMSettings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    criticalOnly: false,
    autoSchedule: true,
    darkMode: true,
    dataRetention: 90,
    pollingInterval: 2,
    riskThreshold: 75,
    batteryWarning: 40,
    batteryDanger: 20,
    modelVersion: 'v3.2.1',
    lastTrained: '2026-05-28',
    accuracy: 94.2,
  });

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          System <span className="text-gradient-blue">Settings</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Configure alerts, thresholds, and system parameters</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div>
          <SectionHeader icon={Bell} title="Notifications" color="amber" />
          <div className="glass-card p-5 border border-border">
            <SettingRow label="Email Alerts" description="Receive alert notifications via email">
              <Toggle enabled={settings.emailAlerts} onChange={(v) => update('emailAlerts', v)} />
            </SettingRow>
            <SettingRow label="Push Notifications" description="Browser push notifications for critical events">
              <Toggle enabled={settings.pushNotifications} onChange={(v) => update('pushNotifications', v)} />
            </SettingRow>
            <SettingRow label="Critical Alerts Only" description="Only notify for critical severity alerts">
              <Toggle enabled={settings.criticalOnly} onChange={(v) => update('criticalOnly', v)} />
            </SettingRow>
            <SettingRow label="Auto-Schedule Maintenance" description="Automatically schedule maintenance for high-risk lamps">
              <Toggle enabled={settings.autoSchedule} onChange={(v) => update('autoSchedule', v)} />
            </SettingRow>
          </div>
        </div>

        {/* Thresholds */}
        <div>
          <SectionHeader icon={Shield} title="Alert Thresholds" color="red" />
          <div className="glass-card p-5 border border-border">
            <SettingRow label="Risk Alert Threshold" description="Trigger alert when risk score exceeds this value">
              <Slider value={settings.riskThreshold} onChange={(v) => update('riskThreshold', v)} unit="%" />
            </SettingRow>
            <SettingRow label="Battery Warning Level" description="Show warning when battery health drops below">
              <Slider value={settings.batteryWarning} onChange={(v) => update('batteryWarning', v)} unit="%" />
            </SettingRow>
            <SettingRow label="Battery Danger Level" description="Trigger critical alert when battery health drops below">
              <Slider value={settings.batteryDanger} onChange={(v) => update('batteryDanger', v)} unit="%" />
            </SettingRow>
          </div>
        </div>

        {/* Sensor Polling */}
        <div>
          <SectionHeader icon={Radio} title="Data Collection" color="green" />
          <div className="glass-card p-5 border border-border">
            <SettingRow label="Sensor Polling Interval" description="How frequently to read sensor data">
              <Slider value={settings.pollingInterval} onChange={(v) => update('pollingInterval', v)} min={1} max={30} unit="s" />
            </SettingRow>
            <SettingRow label="Data Retention Period" description="How long to keep historical sensor data">
              <Slider value={settings.dataRetention} onChange={(v) => update('dataRetention', v)} min={30} max={365} unit=" days" />
            </SettingRow>
            <SettingRow label="Dark Mode" description="Use dark theme for dashboard interface">
              <Toggle enabled={settings.darkMode} onChange={(v) => update('darkMode', v)} />
            </SettingRow>
          </div>
        </div>

        {/* AI Model Info */}
        <div>
          <SectionHeader icon={Brain} title="AI Model Parameters" subtitle="Read-only" color="purple" />
          <div className="glass-card p-5 border border-neon-purple/20">
            <div className="space-y-4">
              {[
                { label: 'Model Version', value: settings.modelVersion, color: 'text-neon-purple' },
                { label: 'Last Trained', value: settings.lastTrained, color: 'text-text-primary' },
                { label: 'Prediction Accuracy', value: `${settings.accuracy}%`, color: 'text-neon-green' },
                { label: 'Algorithm', value: 'Gradient Boosted Trees + LSTM', color: 'text-text-primary' },
                { label: 'Features Used', value: '24 sensor features', color: 'text-text-primary' },
                { label: 'Training Data', value: '1.2M data points', color: 'text-text-primary' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-text-muted font-medium">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="lg:col-span-2">
          <SectionHeader icon={Monitor} title="System Information" color="blue" />
          <div className="glass-card p-5 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Platform', value: 'Smart City IoT v4.2' },
                { label: 'Region', value: 'Southeast Asia' },
                { label: 'Connected Lamps', value: '248 active' },
                { label: 'Uptime', value: '99.97%' },
                { label: 'API Version', value: 'v3.1.0' },
                { label: 'Database', value: 'PostgreSQL 16' },
                { label: 'MQTT Broker', value: 'Mosquitto 2.x' },
                { label: 'Last Deploy', value: '2026-05-30' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-surface/50 border border-border/30">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
