import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

const colorMap = {
  blue:   { bg: 'bg-neon-blue/10', border: 'border-neon-blue/20', text: 'text-neon-blue', glow: 'neon-glow-blue' },
  green:  { bg: 'bg-neon-green/10', border: 'border-neon-green/20', text: 'text-neon-green', glow: 'neon-glow-green' },
  red:    { bg: 'bg-neon-red/10', border: 'border-neon-red/20', text: 'text-neon-red', glow: 'neon-glow-red' },
  amber:  { bg: 'bg-neon-amber/10', border: 'border-neon-amber/20', text: 'text-neon-amber', glow: 'neon-glow-amber' },
  purple: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', text: 'text-neon-purple', glow: 'neon-glow-purple' },
};

export default function KPICard({ label, value, unit, icon: Icon, color = 'blue', trend, delay = 0 }) {
  const c = colorMap[color] || colorMap.blue;
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`glass-card p-5 border ${c.border} ${c.glow} group hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">
          {label}
        </p>
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`w-[18px] h-[18px] ${c.text}`} />
        </div>
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        {isNumeric ? (
          <AnimatedCounter
            target={numericValue}
            duration={1.8}
            className={`text-3xl font-bold ${c.text} tabular-nums`}
            suffix={unit ? '' : ''}
          />
        ) : (
          <span className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</span>
        )}
        {unit && <span className="text-sm text-text-muted mb-1 font-medium">{unit}</span>}
      </div>

      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${trend >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
          {trend >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{Math.abs(trend)}% from yesterday</span>
        </div>
      )}
    </motion.div>
  );
}
