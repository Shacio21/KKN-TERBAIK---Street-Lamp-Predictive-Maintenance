import { motion } from 'framer-motion';

const variants = {
  blue: {
    bg: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))',
    border: 'rgba(0,212,255,0.4)',
    shadow: '0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
    hoverShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)',
    text: '#00D4FF',
  },
  green: {
    bg: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))',
    border: 'rgba(0,255,136,0.4)',
    shadow: '0 0 20px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)',
    hoverShadow: '0 0 30px rgba(0,255,136,0.5), 0 0 80px rgba(0,255,136,0.2)',
    text: '#00FF88',
  },
  purple: {
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
    border: 'rgba(139,92,246,0.4)',
    shadow: '0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
    hoverShadow: '0 0 30px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.2)',
    text: '#8B5CF6',
  },
};

export default function NeonButton({ children, variant = 'blue', size = 'md', onClick, className = '', ...props }) {
  const v = variants[variant];
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative font-semibold font-[family-name:var(--font-display)] tracking-wider uppercase
        rounded-[var(--radius-button)] cursor-pointer
        transition-all duration-300 ease-out
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        boxShadow: v.shadow,
        color: v.text,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: v.hoverShadow,
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
