import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function AwaitingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="glass-strong rounded-[var(--radius-card)] p-10">
          <div className="w-20 h-20 rounded-3xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-neon-amber" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-3">Menunggu Persetujuan</h2>
          <p className="text-text-muted text-sm mb-8">
            Akun Anda sedang dalam proses tinjauan oleh admin. Anda akan menerima notifikasi email setelah akun disetujui atau ditolak.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-hover hover:text-text-primary transition-all duration-200"
          >
            ← Kembali ke Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
