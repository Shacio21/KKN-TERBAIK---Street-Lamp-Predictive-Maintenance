import { motion } from 'framer-motion';

function getColor(value) {
  if (value >= 80) return '#10B981';  // success green
  if (value >= 50) return '#F59E0B';  // warning amber
  return '#EF4444';                   // danger red
}

export default function CircularProgress({ value, size = 100, strokeWidth = 8, label, showValue = true, color }) {
  const resolvedColor = color || getColor(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </svg>

        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-lg font-bold tabular-nums"
              style={{ color: resolvedColor }}
            >
              {Math.round(value)}%
            </motion.span>
          </div>
        )}
      </div>

      {label && (
        <p className="text-xs text-text-muted font-medium text-center">{label}</p>
      )}
    </div>
  );
}
