import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = false, hover = true, ...props }) {
  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}
