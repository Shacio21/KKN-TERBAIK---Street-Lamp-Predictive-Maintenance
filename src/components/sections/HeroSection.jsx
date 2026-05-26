import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Scene from '../three/Scene';
import StreetLampModel from '../three/StreetLampModel';
import ParticleField from '../ui/ParticleField';
import NeonButton from '../ui/NeonButton';
import GradientText from '../ui/GradientText';
import { heroData } from '../../data/mockData';

function TypingText({ text, speed = 40 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <span className={`inline-block w-[2px] h-[1em] bg-neon-blue ml-1 align-middle ${done ? 'animate-[typing-cursor_1s_infinite]' : ''}`} />
    </span>
  );
}

export default function HeroSection() {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden bg-bg-primary">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Particle field */}
      <ParticleField count={40} color="#00D4FF" />

      {/* Additional gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Scene>
          <StreetLampModel rotate={true} floatEffect={true} />
        </Scene>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center section-container pointer-events-none">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border-blue mb-8 pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-green animate-[neon-pulse_2s_ease-in-out_infinite]" />
            <span className="text-xs font-medium text-text-secondary tracking-wider uppercase">
              Next-Gen IoT Platform
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="heading-display text-4xl sm:text-5xl md:text-7xl mb-6">
            <GradientText from="#E2E8F0" to="#94A3B8" className="block mb-2">
              The Future of
            </GradientText>
            <GradientText from="#00D4FF" to="#00FF88" animate className="block">
              Smart Street Lighting
            </GradientText>
          </h1>

          {/* Subheadline with typing effect */}
          <div className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto mb-10 font-light h-8">
            <TypingText text={heroData.subheadline} speed={30} />
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <NeonButton variant="blue" size="lg" onClick={scrollToAbout}>
              {heroData.ctaText}
            </NeonButton>
            <NeonButton variant="green" size="lg" onClick={scrollToAbout}>
              View Dashboard
            </NeonButton>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          className="absolute bottom-10 flex flex-col items-center gap-2 pointer-events-auto cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={scrollToAbout}
        >
          <span className="text-text-muted text-xs tracking-widest uppercase">
            {heroData.scrollIndicator}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-neon-blue" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
