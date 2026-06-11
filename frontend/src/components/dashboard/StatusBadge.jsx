const configs = {
  healthy:  { bg: 'bg-[#F0FDF4]', text: 'text-[#10B981]', border: 'border-[#A7F3D0]', dot: 'bg-[#10B981]', label: 'Healthy' },
  warning:  { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-[#FDE68A]', dot: 'bg-[#F59E0B]', label: 'Warning' },
  critical: { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', border: 'border-[#FECACA]', dot: 'bg-[#EF4444]', label: 'Critical' },
  offline:  { bg: 'bg-[#F8FAFC]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]', dot: 'bg-[#94A3B8]', label: 'Offline' },
  low:      { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]', dot: 'bg-[#2563EB]', label: 'Low' },
  medium:   { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-[#FDE68A]', dot: 'bg-[#F59E0B]', label: 'Medium' },
  high:     { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', border: 'border-[#FECACA]', dot: 'bg-[#EF4444]', label: 'High' },
  pending:  { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-[#FDE68A]', dot: 'bg-[#F59E0B]', label: 'Pending' },
  scheduled:{ bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]', dot: 'bg-[#2563EB]', label: 'Scheduled' },
  resolved: { bg: 'bg-[#F0FDF4]', text: 'text-[#10B981]', border: 'border-[#A7F3D0]', dot: 'bg-[#10B981]', label: 'Resolved' },
};

export default function StatusBadge({ status, size = 'sm', showDot = true, className = '' }) {
  const c = configs[status] || configs.offline;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border} ${sizeClass} ${className}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'critical' ? 'animate-pulse' : ''}`} />
      )}
      {c.label}
    </span>
  );
}
