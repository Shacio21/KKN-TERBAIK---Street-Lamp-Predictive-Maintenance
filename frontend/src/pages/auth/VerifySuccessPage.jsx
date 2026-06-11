import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-full max-w-md text-center"
      >
        <div className="glass-strong rounded-[var(--radius-card)] p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-neon-green)]"
          >
            <CheckCircle className="w-10 h-10 text-neon-green" />
          </motion.div>

          <h2 className="text-2xl font-bold text-text-primary mb-3">Email Terverifikasi!</h2>
          <p className="text-text-muted text-sm mb-2">
            Email Anda berhasil diverifikasi.
          </p>
          <p className="text-text-muted text-sm mb-8">
            Akun Anda sedang dalam antrian persetujuan admin. Anda akan mendapat notifikasi email setelah disetujui.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-bg-primary bg-gradient-to-r from-neon-green to-neon-blue hover:opacity-90 transition-all duration-200"
          >
            Ke Halaman Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
