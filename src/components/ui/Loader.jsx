import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timeout = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          {/* Loader UI */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Spinning Ring */}
            <div className="relative w-24 h-24 mb-6">
              <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#2563EB" strokeWidth="4"
                  strokeDasharray="80 200"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Percentage */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="heading-display text-2xl text-[#0F172A]">
                  {Math.round(progress)}
                </span>
                <span className="text-[10px] text-[#2563EB] uppercase tracking-widest mt-0.5">%</span>
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-sm font-semibold tracking-wide text-[#475569] mb-2">
              Loading...
            </h2>

            {/* Progress Bar */}
            <div className="w-48 h-1.5 rounded-full bg-[#E2E8F0] mt-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#2563EB]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
