import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lamp, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/axios';
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const { state } = useLocation();
  const email = state?.email || '';
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0 || !email) return;
    setSending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Email verifikasi telah dikirim ulang!');
      setCooldown(60);
    } catch {
      toast.error('Gagal mengirim ulang email. Coba beberapa saat lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="glass-strong rounded-[var(--radius-card)] p-10">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-neon-blue)]">
            <Mail className="w-10 h-10 text-neon-blue" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">Cek Email Anda</h2>
          <p className="text-text-muted text-sm mb-1">Kami telah mengirimkan link verifikasi ke:</p>
          {email && (
            <p className="text-neon-blue font-medium text-sm mb-6">{email}</p>
          )}
          <p className="text-text-muted text-sm mb-8">
            Klik link di email untuk memverifikasi akun Anda. Link berlaku selama <span className="text-text-secondary">24 jam</span>.
          </p>

          <Button
            variant="outline"
            onClick={resend}
            disabled={cooldown > 0 || sending || !email}
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
              : cooldown > 0
                ? <><RefreshCw className="w-4 h-4" /> Kirim ulang ({cooldown}s)</>
                : <><RefreshCw className="w-4 h-4" /> Kirim ulang email</>
            }
          </Button>

          <Link to="/login" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            ← Kembali ke Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
