import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Battery, Thermometer, Zap, Sun, Lightbulb, Move, Activity,
} from 'lucide-react';

const iconMap = {
  Battery, Thermometer, Zap, Sun, Lightbulb, Move, Activity,
};

function MiniSparkline({ data, color, width = 120, height = 32 }) {
  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SensorWidget({ sensorKey, meta, liveValue, sparkline, delay = 0 }) {
  const Icon = iconMap[meta.icon] || Activity;
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(liveValue);

  useEffect(() => {
    if (prevValue.current !== liveValue) {
      setFlash(true);
      prevValue.current = liveValue;
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [liveValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-4 border border-border group hover:border-[color:var(--accent-color)] transition-all duration-300"
      style={{ '--accent-color': meta.color + '40' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: meta.color + '15', border: `1px solid ${meta.color}30` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
        </div>
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider truncate">
          {sensorKey.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span
            className={`text-2xl font-bold tabular-nums transition-all duration-200 ${flash ? 'animate-value-flash' : ''}`}
            style={{ color: meta.color }}
          >
            {typeof liveValue === 'number' ? liveValue.toFixed(meta.unit === 'V' || meta.unit === 'A' ? 2 : meta.unit === '°C' ? 1 : 0) : liveValue}
          </span>
          <span className="text-xs text-text-muted ml-1">{meta.unit}</span>
        </div>
        <MiniSparkline data={sparkline} color={meta.color} />
      </div>
    </motion.div>
  );
}

export default memo(SensorWidget);
