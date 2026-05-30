import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, LogIn, Radio, Send, ShieldCheck } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { fetchKpi, fetchLamps, login, sendTelemetry } from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass = 'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-neon-blue';

export default function OperationsPanel() {
  const [email, setEmail] = useState('admin@pju.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [token, setToken] = useState(() => localStorage.getItem('pju_access_token') || '');
  const [kpi, setKpi] = useState(null);
  const [lamps, setLamps] = useState([]);
  const [lampCode, setLampCode] = useState('SL-001');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedLamp = useMemo(() => lamps.find((lamp) => lamp.lamp_code === lampCode), [lamps, lampCode]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await login(email, password);
      localStorage.setItem('pju_access_token', data.access_token);
      setToken(data.access_token);
      setMessage('Login API berhasil.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadBackendData() {
    setBusy(true);
    setMessage('');
    try {
      const [nextKpi, nextLamps] = await Promise.all([fetchKpi(), fetchLamps()]);
      setKpi(nextKpi);
      setLamps(nextLamps);
      if (nextLamps[0]?.lamp_code) setLampCode(nextLamps[0].lamp_code);
      setMessage('Data backend diperbarui.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function pushTelemetry() {
    setBusy(true);
    setMessage('');
    try {
      await sendTelemetry({
        lamp_code: lampCode,
        timestamp: new Date().toISOString(),
        voltage: 220.5,
        current: 0.45,
        power: 35,
        energy: 0.099,
        solar_voltage: 18.2,
        solar_current: 2.3,
        solar_power: 42,
        solar_energy_today: 480,
        battery_level: selectedLamp?.last_battery_level || 87,
        battery_voltage: 13.2,
        battery_current: 1.5,
        temperature_internal: 42.3,
        temperature_ambient: 32.4,
        lux: 892,
        motion_count: 3,
        signal_strength: 92,
        mqtt_latency_ms: 45,
        brightness: selectedLamp?.last_brightness || 80,
      });
      setMessage(`Telemetry ${lampCode} terkirim.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="operations" className="relative section-padding bg-bg-primary overflow-hidden">
      <div className="section-container relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-green text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            Operations
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#00FF88" to="#00D4FF">
              Backend Control Surface
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            Authenticate to the FastAPI backend, inspect protected monitoring data, and send a telemetry sample to the IoT ingestion pipeline.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <LogIn className="w-5 h-5 text-neon-blue" />
              <h3 className="heading-section text-lg text-text-primary">API Login</h3>
            </div>
            <form className="space-y-3" onSubmit={handleLogin}>
              <Input className="w-full" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
              <Input className="w-full" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
              <Button variant="outline" className="w-full text-neon-blue border-neon-blue/40 hover:bg-neon-blue/10" disabled={busy}>
                {busy ? 'Processing...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4" style={{ color: token ? '#00FF88' : '#F59E0B' }} />
              {token ? 'Access token tersimpan' : 'Belum login'}
            </div>
          </GlassCard>

          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database className="w-5 h-5 text-neon-green" />
              <h3 className="heading-section text-lg text-text-primary">Protected Data</h3>
            </div>
            <Button variant="outline" className="mb-4 w-full text-neon-green border-neon-green/40 hover:bg-neon-green/10" onClick={loadBackendData} disabled={busy}>
              Refresh KPI & Lamps
            </Button>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Total Lamps" value={kpi?.total_lamps ?? '-'} icon={Activity} color="#00D4FF" />
              <Metric label="Online" value={kpi?.online_lamps ?? '-'} icon={Radio} color="#00FF88" />
              <Metric label="Alerts" value={kpi?.unresolved_alerts ?? '-'} icon={Activity} color="#F59E0B" />
              <Metric label="Avg Battery" value={kpi ? `${Math.round(kpi.avg_battery_level)}%` : '-'} icon={Activity} color="#8B5CF6" />
            </div>
          </GlassCard>

          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Send className="w-5 h-5 text-neon-amber" style={{ color: '#F59E0B' }} />
              <h3 className="heading-section text-lg text-text-primary">Telemetry Simulator</h3>
            </div>
            <div className="space-y-3">
              <Input className="w-full" value={lampCode} onChange={(event) => setLampCode(event.target.value)} />
              <Button variant="outline" className="w-full text-neon-amber border-neon-amber/40 hover:bg-neon-amber/10 hover:text-neon-amber" onClick={pushTelemetry} disabled={busy}>
                Send Sample Telemetry
              </Button>
              <div className="min-h-6 text-xs text-text-muted">{message}</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="heading-display text-xl" style={{ color }}>{value}</div>
    </div>
  );
}
