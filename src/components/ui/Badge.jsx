/**
 * @fileoverview Badge component for the PJU IoT Monitoring System.
 * Displays status indicators for lamps, tickets, users, and priority levels.
 * Uses semi-transparent neon backgrounds consistent with the dark cyberpunk theme.
 */

/**
 * Variant configuration mapping — each variant defines background, text, and dot colors.
 * Uses Tailwind's opacity modifier syntax for semi-transparent neon backgrounds.
 */
import { Badge as ShadcnBadge } from "@/components/ui/badge";

const VARIANT_MAP = {
  online:      'default',
  success:     'default',
  offline:     'outline',
  warning:     'secondary',
  fault:       'destructive',
  error:       'destructive',
  critical:    'destructive',
  maintenance: 'default',
  info:        'default',
  pending:     'secondary',
  high:        'destructive',
  medium:      'secondary',
  low:         'default',
};

const DOT_COLORS = {
  online:      'bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.6)]',
  success:     'bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.6)]',
  offline:     'bg-text-muted shadow-none',
  warning:     'bg-neon-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  fault:       'bg-neon-red shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  error:       'bg-neon-red shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  critical:    'bg-neon-red shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  maintenance: 'bg-neon-blue shadow-[0_0_6px_rgba(0,212,255,0.6)]',
  info:        'bg-neon-purple shadow-[0_0_6px_rgba(139,92,246,0.6)]',
  pending:     'bg-neon-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  high:        'bg-neon-red shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  medium:      'bg-neon-amber shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  low:         'bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.6)]',
};

const DOT_SIZES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export default function Badge({
  variant = 'info',
  children,
  dot = false,
  size = 'sm',
  className = '',
}) {
  const shadcnVariant = VARIANT_MAP[variant] || 'default';
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.info;
  const dotSize = DOT_SIZES[size] || DOT_SIZES.sm;
  const shouldPulse = !['offline'].includes(variant);

  return (
    <ShadcnBadge
      variant={shadcnVariant}
      className={`font-medium ${className}`}
    >
      {dot && (
        <span className="relative flex shrink-0 mr-1.5">
          {shouldPulse && (
            <span
              className={`absolute inset-0 rounded-full ${dotColor} animate-ping opacity-40`}
            />
          )}
          <span
            className={`relative rounded-full ${dotSize} ${dotColor}`}
          />
        </span>
      )}
      {children}
    </ShadcnBadge>
  );
}
