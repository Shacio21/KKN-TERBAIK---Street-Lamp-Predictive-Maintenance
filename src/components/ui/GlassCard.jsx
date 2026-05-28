import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";

export default function GlassCard({ children, className = '', glow = false, hover = true, ...props }) {
  const glowClass = glow ? 'neon-border-blue' : '';
  
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : {}}
      {...props}
    >
      <Card className={`glass-card border-border/50 bg-background/40 backdrop-blur-xl block py-0 gap-0 ring-0 ${glowClass} ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
}
