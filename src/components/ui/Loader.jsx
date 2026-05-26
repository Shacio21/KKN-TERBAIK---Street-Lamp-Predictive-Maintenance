import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import GradientText from './GradientText';

export default function Loader() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);

  // Keep loader visible for a minimum duration to show the cool animation,
  // or hide it when loading is complete.
  useEffect(() => {
    if (!active && progress === 100) {
      const timeout = setTimeout(() => setShow(false), 500); // 500ms delay before fade out
      return () => clearTimeout(timeout);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          {/* Background FX */}
          <div className="absolute inset-0 bg-gradient-radial opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-[100px]"
            style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }}
          />

          {/* Loader UI */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Spinning Energy Ring */}
            <div className="relative w-32 h-32 mb-8">
              <svg className="w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
                {/* Outer Ring */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#00D4FF" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.8))' }} />
                
                {/* Inner Ring (Spins opposite direction) */}
                <g className="animate-[spin_2s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(0,255,136,0.1)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#00FF88" strokeWidth="2" strokeDasharray="40 160" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.6))' }} />
                </g>
              </svg>
              
              {/* Center Percentage */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="heading-display text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {Math.round(progress)}
                </span>
                <span className="text-[10px] text-neon-blue uppercase tracking-widest mt-0.5">%</span>
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="heading-display text-sm tracking-[0.3em] uppercase mb-2">
              <GradientText from="#E2E8F0" to="#94A3B8" animate>
                Initializing System
              </GradientText>
            </h2>
            
            {/* Progress Bar */}
            <div className="w-48 h-1 rounded-full bg-surface mt-4 overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00D4FF, #00FF88)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
              {/* Glow element that follows the progress bar head */}
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white opacity-80 blur-[4px]"
                initial={{ left: 0 }}
                animate={{ left: `calc(${progress}% - 8px)` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
