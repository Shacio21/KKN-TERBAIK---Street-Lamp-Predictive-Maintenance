import { motion } from 'framer-motion';

const variants = {
  blue: {
    bg: '#2563EB',
    hoverBg: '#1D4ED8',
    text: '#FFFFFF',
    shadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
    hoverShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
  },
  green: {
    bg: '#10B981',
    hoverBg: '#059669',
    text: '#FFFFFF',
    shadow: '0 1px 3px rgba(16, 185, 129, 0.3)',
    hoverShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
  outline: {
    bg: 'transparent',
    hoverBg: '#EFF6FF',
    text: '#2563EB',
    shadow: 'none',
    hoverShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
    border: '1px solid #2563EB',
  },
  purple: {
    bg: '#7C3AED',
    hoverBg: '#6D28D9',
    text: '#FFFFFF',
    shadow: '0 1px 3px rgba(124, 58, 237, 0.3)',
    hoverShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
  },
};

const sizePadding = {
  sm: { paddingLeft: '1rem',    paddingRight: '1rem',    paddingTop: '0.5rem',   paddingBottom: '0.5rem'  },
  md: { paddingLeft: '1.5rem',  paddingRight: '1.5rem',  paddingTop: '0.625rem', paddingBottom: '0.625rem'},
  lg: { paddingLeft: '2rem',    paddingRight: '2rem',    paddingTop: '0.75rem',  paddingBottom: '0.75rem' },
};

const sizeFontSize = {
  sm: '0.875rem',
  md: '1rem',
  lg: '1rem',
};

export default function NeonButton({
  children,
  variant = 'blue',
  size = 'md',
  onClick,
  className = '',
  ...props
}) {
  const v = variants[variant] || variants.blue;

  return (
    <motion.button
      onClick={onClick}
      className={`relative font-semibold tracking-wide rounded-[var(--radius-button)] cursor-pointer transition-all duration-200 ease-out ${className}`}
      style={{
        background: v.bg,
        border: v.border || 'none',
        boxShadow: v.shadow,
        color: v.text,
        fontSize: sizeFontSize[size],
        ...sizePadding[size],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: v.hoverShadow,
        background: v.hoverBg,
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}