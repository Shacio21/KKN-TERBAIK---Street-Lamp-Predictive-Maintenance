import { motion } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-neon-red/5',
    border: 'border-l-neon-red',
    borderAll: 'border-neon-red/15',
    text: 'text-neon-red',
    badge: 'bg-neon-red/10 text-neon-red border-neon-red/30',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-neon-amber/5',
    border: 'border-l-neon-amber',
    borderAll: 'border-neon-amber/15',
    text: 'text-neon-amber',
    badge: 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
  },
  info: {
    icon: Info,
    bg: 'bg-neon-blue/5',
    border: 'border-l-neon-blue',
    borderAll: 'border-neon-blue/15',
    text: 'text-neon-blue',
    badge: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  },
};

export default function AlertCard({ alert, onResolve, delay = 0 }) {
  const config = severityConfig[alert.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.95 }}
      transition={{ delay, duration: 0.3 }}
      className={`relative glass-card p-4 border ${config.borderAll} border-l-[3px] ${config.border} ${config.bg} group ${
        alert.severity === 'critical' && !alert.isResolved ? 'animate-pulse-slow' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.badge}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.text}`}>
              {alert.severity}
            </span>
            {alert.isResolved && (
              <span className="flex items-center gap-1 text-[10px] text-neon-green font-semibold">
                <CheckCircle className="w-3 h-3" /> Resolved
              </span>
            )}
          </div>

          <p className="text-sm text-text-primary leading-relaxed">{alert.message}</p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
            {alert.lampId && (
              <span className="font-semibold text-neon-blue font-[family-name:var(--font-display)]">
                {alert.lampId}
              </span>
            )}
            <span>{alert.timestamp}</span>
          </div>
        </div>

        {!alert.isResolved && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-surface hover:bg-surface-hover flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
