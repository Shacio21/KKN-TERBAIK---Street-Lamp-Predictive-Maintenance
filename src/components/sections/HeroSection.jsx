import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Leaf, Building2, Sun } from 'lucide-react';
import NeonButton from '../ui/NeonButton';
import { heroData } from '../../data/mockData';

function TypingText({ text, typingSpeed = 50, deletingSpeed = 30, delayBeforeDelete = 2000 }) {
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    
    if (isDeleting) {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(text.substring(0, displayed.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setIndex(0);
      }
    } else {
      if (index < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.substring(0, index + 1));
          setIndex(index + 1);
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDelete);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, text, typingSpeed, deletingSpeed, delayBeforeDelete]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-[#2563EB] ml-1 align-middle animate-[typing-cursor_1s_infinite]" />
    </span>
  );
}

const badges = [
  { icon: Building2, label: 'KKN Project', color: '#2563EB', bg: '#EFF6FF' },
  { icon: Leaf, label: 'Village Infrastructure', color: '#10B981', bg: '#F0FDF4' },
  { icon: Sun, label: 'Renewable Energy', color: '#F59E0B', bg: '#FFFBEB' },
];

export default function HeroSection() {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4] flex flex-col items-center justify-center">
      {/* Subtle decorative circles */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
      />

      {/* Content Wrapper */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center section-container py-32">
        <motion.div
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                style={{ background: badge.bg, color: badge.color, borderColor: `${badge.color}30` }}
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            ))}
          </motion.div>

          {/* Main heading */}
          <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-center text-[#0F172A]">
            Street Lamp
            <span className="block text-[#2563EB]">Predictive Maintenance</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#475569] text-base md:text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            Helping villages monitor, maintain, and improve public street lighting
            through data-driven maintenance planning.
          </p>

          {/* Typing effect */}
          <div className="text-[#64748B] text-sm md:text-base max-w-2xl mx-auto mb-10 h-8 text-center flex justify-center w-full">
            <TypingText 
              text={heroData.subheadline} 
              typingSpeed={50} 
              deletingSpeed={30} 
              delayBeforeDelete={3000} 
            />
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <NeonButton variant="blue" size="lg" onClick={scrollToAbout}>
              {heroData.ctaText}
            </NeonButton>
            <NeonButton variant="outline" size="lg" onClick={scrollToAbout}>
              View Dashboard
            </NeonButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - DIPINDAH KE SINI AGAR TIDAK TERTUMPUK */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={scrollToAbout}
      >
        <span className="text-[#64748B] text-xs tracking-widest uppercase whitespace-nowrap">
          {heroData.scrollIndicator}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-[#2563EB]" />
        </motion.div>
      </motion.button>
    </section>
  );
}