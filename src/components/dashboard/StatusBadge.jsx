const configs = {
  healthy:  { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30', dot: 'bg-neon-green', label: 'Healthy' },
  warning:  { bg: 'bg-neon-amber/10', text: 'text-neon-amber', border: 'border-neon-amber/30', dot: 'bg-neon-amber', label: 'Warning' },
  critical: { bg: 'bg-neon-red/10', text: 'text-neon-red', border: 'border-neon-red/30', dot: 'bg-neon-red', label: 'Critical' },
  offline:  { bg: 'bg-text-muted/10', text: 'text-text-muted', border: 'border-text-muted/30', dot: 'bg-text-muted', label: 'Offline' },
  low:      { bg: 'bg-neon-blue/10', text: 'text-neon-blue', border: 'border-neon-blue/30', dot: 'bg-neon-blue', label: 'Low' },
  medium:   { bg: 'bg-neon-amber/10', text: 'text-neon-amber', border: 'border-neon-amber/30', dot: 'bg-neon-amber', label: 'Medium' },
  high:     { bg: 'bg-neon-red/10', text: 'text-neon-red', border: 'border-neon-red/30', dot: 'bg-neon-red', label: 'High' },
  pending:  { bg: 'bg-neon-amber/10', text: 'text-neon-amber', border: 'border-neon-amber/30', dot: 'bg-neon-amber', label: 'Pending' },
  scheduled:{ bg: 'bg-neon-blue/10', text: 'text-neon-blue', border: 'border-neon-blue/30', dot: 'bg-neon-blue', label: 'Scheduled' },
  resolved: { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30', dot: 'bg-neon-green', label: 'Resolved' },
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
