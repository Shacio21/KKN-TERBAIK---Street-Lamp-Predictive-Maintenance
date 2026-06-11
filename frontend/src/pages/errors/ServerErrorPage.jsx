import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ServerErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="font-display text-[120px] font-black leading-none text-neon-amber/60 mb-4 select-none">
          500
        </div>
        <div className="w-16 h-16 rounded-2xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="w-8 h-8 text-neon-amber" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Server Error</h2>
        <p className="text-text-muted text-sm mb-8">Terjadi kesalahan pada server. Tim kami sedang menangani masalah ini. Silakan coba lagi nanti.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(0)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Muat Ulang
          </Button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-bg-primary bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
