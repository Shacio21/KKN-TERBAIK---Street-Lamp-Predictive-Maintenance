import { motion } from 'framer-motion';
import { Brain, AlertTriangle, AlertCircle, Info, CheckCircle, Sparkles } from 'lucide-react';

const severityIcons = {
  critical: { icon: AlertTriangle, color: 'text-neon-red', bg: 'bg-neon-red/10 border-neon-red/20' },
  warning: { icon: AlertCircle, color: 'text-neon-amber', bg: 'bg-neon-amber/10 border-neon-amber/20' },
  info: { icon: Info, color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20' },
  success: { icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
};

export default function AIInsightsPanel({ insights }) {
  return (
    <div className="glass-card p-5 border border-neon-purple/20 neon-glow-purple">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
          <Brain className="w-[18px] h-[18px] text-neon-purple" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
            AI Insights
          </h3>
          <p className="text-[10px] text-text-muted">Powered by predictive analytics engine</p>
        </div>
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] text-neon-purple font-semibold">
          <Sparkles className="w-3 h-3" />
          AI
        </span>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const sev = severityIcons[insight.severity] || severityIcons.info;
          const SevIcon = sev.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 hover:bg-surface-hover/50 transition-colors border border-transparent hover:border-border/50"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${sev.bg}`}>
                <SevIcon className={`w-3.5 h-3.5 ${sev.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-relaxed">
                  {insight.message}
                </p>
                <p className="text-[10px] text-text-muted mt-1.5">{insight.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
