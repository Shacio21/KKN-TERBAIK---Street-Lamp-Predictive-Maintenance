import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import usePredictiveData from '../../hooks/usePredictiveData';
import SectionHeader from '../../components/dashboard/SectionHeader';
import AlertFeed from '../../components/alerts/AlertFeed';

export default function PMAlerts() {
  const { alerts, resolveAlert } = usePredictiveData();

  const stats = useMemo(() => {
    const s = { total: alerts.length, critical: 0, warning: 0, info: 0, unresolved: 0, resolved: 0 };
    alerts.forEach((a) => {
      if (s[a.severity] !== undefined) s[a.severity]++;
      if (a.isResolved) s.resolved++;
      else s.unresolved++;
    });
    return s;
  }, [alerts]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          Alert <span className="text-gradient-blue">Center</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">System notifications, warnings, and critical alerts</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ShieldAlert, color: 'text-text-primary', bg: 'bg-surface border-border' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-neon-red', bg: 'bg-neon-red/10 border-neon-red/20' },
          { label: 'Warning', value: stats.warning, icon: AlertCircle, color: 'text-neon-amber', bg: 'bg-neon-amber/10 border-neon-amber/20' },
          { label: 'Info', value: stats.info, icon: Info, color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20' },
          { label: 'Unresolved', value: stats.unresolved, icon: AlertTriangle, color: 'text-neon-red', bg: 'bg-neon-red/5 border-neon-red/15' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`glass-card p-3 border ${s.bg} text-center`}
          >
            <s.icon className={`w-4 h-4 mx-auto mb-1.5 ${s.color}`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Full Alert Feed */}
      <div>
        <SectionHeader icon={ShieldAlert} title="All Alerts" subtitle="Filter and manage system alerts" color="red" />
        <AlertFeed alerts={alerts} onResolve={resolveAlert} showFilter={true} />
      </div>
    </div>
  );
}
