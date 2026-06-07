import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lamp } from 'lucide-react';
import { navLinks } from '../../data/mockData';

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
          ? 'bg-white/95 backdrop-blur-sm shadow-md border-b border-[#E2E8F0]'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Lamp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#0F172A] text-sm leading-tight block">
              Street Lamp PM
            </span>
            <span className="text-[10px] text-[#64748B] leading-tight block">
              KKN Project
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-[#475569] hover:text-[#2563EB] transition-colors duration-300 text-sm font-medium tracking-wide cursor-pointer relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#2563EB] transition-all duration-300 group-hover:w-full rounded-full" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            className="px-5 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all duration-200 bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:shadow-md"
          >
            Open Dashboard
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#0F172A] cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#E2E8F0] overflow-hidden"
          >
            <div className="section-container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-[#475569] hover:text-[#2563EB] transition-colors duration-300 text-sm font-medium tracking-wide cursor-pointer text-left py-2"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
