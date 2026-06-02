import { motion } from 'framer-motion';

export default function SectionHeader({ icon: Icon, title, subtitle, action, color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', text: 'text-neon-blue' },
    green: { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green' },
    red: { bg: 'bg-neon-red/10', border: 'border-neon-red/30', text: 'text-neon-red' },
    amber: { bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', text: 'text-neon-amber' },
    purple: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', text: 'text-neon-purple' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-5"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${c.text}`} />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
