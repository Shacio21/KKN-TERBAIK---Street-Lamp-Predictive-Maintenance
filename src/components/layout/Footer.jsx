import { Lamp, Globe, MessageCircle, Users, Mail, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-[#0F172A] text-white">
      {/* Top border */}
      <div className="h-1 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#10B981]" />

      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Lamp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Street Lamp PM</span>
                <span className="text-[10px] text-[#94A3B8] block">KKN Community Service</span>
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-md">
              A KKN (Kuliah Kerja Nyata) community service project focused on monitoring
              and predictive maintenance of solar street lamps for village infrastructure.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, MessageCircle, Users, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Project Links */}
          <div>
            <h4 className="text-sm text-white font-semibold mb-4">Project</h4>
            <ul className="space-y-3">
              {['Features', 'Technology', 'Dashboard', 'Monitoring', 'Documentation'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#94A3B8] hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {['About KKN', 'Team', 'Village Info', 'Contact', 'Report Issue'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#94A3B8] hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-xs">
            © 2026 KKN Street Lamp Predictive Maintenance. Community Service Project.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#64748B] hover:text-[#94A3B8] text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-[#64748B] hover:text-[#94A3B8] text-xs transition-colors">Terms of Service</a>
          </div>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/20 transition-all duration-200 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
