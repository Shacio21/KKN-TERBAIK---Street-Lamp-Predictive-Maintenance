import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { navLinks } from '../../data/mockData';
import GradientText from '../ui/GradientText';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="relative">
            <Zap className="w-7 h-7 text-neon-blue transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
          </div>
          <span className="heading-display text-lg tracking-widest">
            <GradientText from="#00D4FF" to="#00FF88">STREETLAMP</GradientText>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Button
              key={link.id}
              variant="link"
              onClick={() => scrollTo(link.id)}
              className="text-text-secondary hover:text-neon-blue transition-colors duration-300 text-sm font-medium tracking-wide uppercase cursor-pointer relative group px-0 decoration-transparent hover:decoration-neon-blue"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-neon-blue transition-all duration-300 group-hover:w-full" />
            </Button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Button
            className="px-5 py-2 text-sm font-semibold tracking-wider uppercase rounded-[var(--radius-button)] cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] bg-[linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,212,255,0.05))] border border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-text-primary cursor-pointer hover:bg-transparent hover:text-neon-blue"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong overflow-hidden"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  onClick={() => scrollTo(link.id)}
                  className="w-full justify-start text-text-secondary hover:text-neon-blue hover:bg-transparent transition-colors duration-300 text-sm font-medium tracking-wide uppercase cursor-pointer py-2 rounded-none"
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
