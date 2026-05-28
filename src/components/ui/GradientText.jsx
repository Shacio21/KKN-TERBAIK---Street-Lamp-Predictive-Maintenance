import { motion } from 'framer-motion';

export default function GradientText({
  children,
  from = '#00D4FF',
  to = '#00FF88',
  animate = false,
  className = '',
}) {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    backgroundSize: animate ? '200% 200%' : '100% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  if (animate) {
    return (
      <motion.span
        className={className}
        style={gradientStyle}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={className} style={gradientStyle}>
      {children}
    </span>
  );
}
