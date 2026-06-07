import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

const colorMap = {
  blue:   { bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]', text: 'text-[#2563EB]', accent: '#2563EB' },
  green:  { bg: 'bg-[#F0FDF4]', border: 'border-[#A7F3D0]', text: 'text-[#10B981]', accent: '#10B981' },
  red:    { bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', text: 'text-[#EF4444]', accent: '#EF4444' },
  amber:  { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#F59E0B]', accent: '#F59E0B' },
  purple: { bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]', text: 'text-[#7C3AED]', accent: '#7C3AED' },
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
      className={`bg-white rounded-xl p-5 border ${c.border} shadow-sm group hover:shadow-md hover:scale-[1.02] transition-all duration-300`}
      style={{ borderLeftWidth: '3px', borderLeftColor: c.accent }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">
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
        {unit && <span className="text-sm text-[#64748B] mb-1 font-medium">{unit}</span>}
      </div>

      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${trend >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
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
