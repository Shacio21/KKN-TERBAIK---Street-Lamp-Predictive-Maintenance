import { motion } from 'framer-motion';

export default function SectionHeader({ icon: Icon, title, subtitle, action, color = 'blue' }) {
  const colorMap = {
    blue:   { bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]', text: 'text-[#2563EB]' },
    green:  { bg: 'bg-[#F0FDF4]', border: 'border-[#A7F3D0]', text: 'text-[#10B981]' },
    red:    { bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', text: 'text-[#EF4444]' },
    amber:  { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#F59E0B]' },
    purple: { bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]', text: 'text-[#7C3AED]' },
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
          <h2 className="text-base font-bold text-[#0F172A] tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
