import { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import Scene from '../three/Scene';
import StreetLampModel from '../three/StreetLampModel';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { explodedComponents } from '../../data/mockData';

function useLerp(target, speed = 0.08) {
  const ref = useRef(target);
  const [value, setValue] = useState(target);

  useEffect(() => {
    let raf;
    const animate = () => {
      ref.current += (target - ref.current) * speed;
      setValue(ref.current);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, speed]);

  return value;
}

export default function ExplodedViewSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => setProgress(v));
  }, [scrollYProgress]);

  // Smooth lerped progress
  const smoothProgress = useLerp(progress, 0.06);

  // Determine active component index (4 phases)
  const activeIndex = Math.min(Math.floor(smoothProgress * 4), 3);

  // Calculate explode offsets based on scroll
  const explodeAmount = Math.min(smoothProgress * 3, 1);

  const lampOffset = [0, explodeAmount * 2.5, explodeAmount * 1.5];
  const solarOffset = [explodeAmount * 2.5, explodeAmount * 2, explodeAmount * 0.5];
  const batteryOffset = [-explodeAmount * 2.5, explodeAmount * 0.5, explodeAmount * 1];
  const espOffset = [explodeAmount * 2, -explodeAmount * 1.5, explodeAmount * 1.5];

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative bg-bg-primary"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex">
        {/* Left: Info panel */}
        <div className="w-full md:w-2/5 h-full flex flex-col justify-center z-20 section-container">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-neon-blue text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
              Interactive Exploded View
            </span>
            <h2 className="heading-section text-2xl md:text-4xl mb-8">
              <GradientText from="#E2E8F0" to="#00D4FF">
                Inside the Technology
              </GradientText>
            </h2>
          </motion.div>

          {/* Progress indicators */}
          <div className="flex flex-col gap-3 mb-8">
            {explodedComponents.map((comp, i) => (
              <motion.div
                key={comp.id}
                className={`cursor-pointer transition-all duration-500 ${
                  i === activeIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-40'
                }`}
                layout
              >
                <GlassCard
                  hover={false}
                  glow={i === activeIndex}
                  className={`p-4 ${i === activeIndex ? 'neon-border-blue' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        background: comp.color,
                        boxShadow: i === activeIndex ? `0 0 10px ${comp.color}` : 'none',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{comp.name}</h3>
                      {i === activeIndex && (
                        <motion.p
                          className="text-text-secondary text-xs mt-1 leading-relaxed"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          {comp.description}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Specs */}
                  {i === activeIndex && (
                    <motion.div
                      className="flex flex-wrap gap-1.5 mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {comp.specs.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            background: `${comp.color}15`,
                            border: `1px solid ${comp.color}30`,
                            color: comp.color,
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Scroll progress bar */}
          <div className="w-full h-1 rounded-full bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${smoothProgress * 100}%`,
                background: 'linear-gradient(90deg, #00D4FF, #00FF88)',
              }}
            />
          </div>
        </div>

        {/* Right: 3D Model */}
        <div className="hidden md:block w-3/5 h-full">
          <Scene>
            <StreetLampModel
              lampOffset={lampOffset}
              solarOffset={solarOffset}
              batteryOffset={batteryOffset}
              espOffset={espOffset}
              rotate={false}
              floatEffect={false}
            />
          </Scene>
        </div>
      </div>
    </section>
  );
}
