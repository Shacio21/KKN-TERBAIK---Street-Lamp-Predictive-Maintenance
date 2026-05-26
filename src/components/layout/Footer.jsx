import { Zap, Globe, MessageCircle, Users, Mail, ArrowUp } from 'lucide-react';
import GradientText from '../ui/GradientText';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-bg-secondary border-t border-border">
      {/* Gradient top border */}
      <div className="gradient-divider" />

      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-neon-blue" />
              <span className="heading-display text-lg tracking-widest">
                <GradientText from="#00D4FF" to="#00FF88">STREETLAMP</GradientText>
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              Pioneering the future of smart urban lighting with IoT-powered solar street lamps.
              Sustainable, intelligent, and beautifully engineered for tomorrow's cities.
            </p>
            <div className="flex gap-4 mt-6">
              {[Globe, MessageCircle, Users, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-neon-blue transition-all duration-300 border border-border hover:border-neon-blue/30 hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="heading-section text-sm text-text-primary mb-4 tracking-wider uppercase">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Technology', 'Dashboard', 'Pricing', 'Documentation'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-text-secondary hover:text-neon-blue transition-colors duration-300 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-section text-sm text-text-primary mb-4 tracking-wider uppercase">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Blog', 'Contact', 'Partners'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-text-secondary hover:text-neon-blue transition-colors duration-300 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © 2026 StreetLamp Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-muted hover:text-text-secondary text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-text-muted hover:text-text-secondary text-xs transition-colors">Terms of Service</a>
          </div>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all duration-300 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
