import { motion } from 'framer-motion';
import CircularProgress from '../dashboard/CircularProgress';

export default function PredictionCard({ prediction, onClick, delay = 0 }) {
  const { lampId, location, failureType, risk, estimatedDays, recommendation, confidence, lastUpdated } = prediction;

  const borderColor = risk >= 80 ? 'border-neon-red/25' : risk >= 60 ? 'border-neon-amber/25' : 'border-neon-green/25';
  const glowClass = risk >= 80 ? 'neon-glow-red' : risk >= 60 ? 'neon-glow-amber' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      onClick={onClick}
      className={`glass-card p-5 border ${borderColor} ${glowClass} cursor-pointer group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-base font-bold text-neon-blue font-[family-name:var(--font-display)]">
            Lamp #{lampId}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{location}</p>
        </div>
        <CircularProgress value={risk} size={56} strokeWidth={5} />
      </div>

      {/* Failure info */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Predicted Failure</p>
          <p className="text-sm font-semibold text-text-primary">{failureType}</p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Estimated</p>
            <p className={`text-lg font-bold tabular-nums ${estimatedDays <= 7 ? 'text-neon-red' : estimatedDays <= 14 ? 'text-neon-amber' : 'text-neon-green'}`}>
              {estimatedDays} <span className="text-xs font-normal text-text-muted">days</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Confidence</p>
            <p className="text-lg font-bold tabular-nums text-neon-purple">
              {confidence}<span className="text-xs font-normal text-text-muted">%</span>
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Recommendation</p>
          <p className="text-xs text-text-secondary leading-relaxed">{recommendation}</p>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-text-muted">Updated {lastUpdated}</p>
      </div>
    </motion.div>
  );
}
