import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = false, hover = true, ...props }) {
  const glowClass = glow ? 'neon-border-blue' : '';
  
  return (
    <motion.div
      className={`glass-card p-6 ${glowClass} ${className}`}
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}
