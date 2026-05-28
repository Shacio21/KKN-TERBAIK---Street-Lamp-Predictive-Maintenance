import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Lamp, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const STATUS_MESSAGES = {
  pending: 'Silakan verifikasi email Anda terlebih dahulu.',
  awaiting_approval: 'Akun Anda sedang menunggu persetujuan admin.',
  rejected: (reason) => `Akun Anda ditolak. Alasan: ${reason || 'Tidak ada alasan.'}`,
  suspended: 'Akun Anda ditangguhkan. Silakan hubungi admin.',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      // Map status-specific errors
      const detail = result.data?.detail;
      const status = typeof detail === 'string' ? detail : '';

      if (status.includes('pending') || result.data?.status === 'pending') {
        setErrorMsg(STATUS_MESSAGES.pending);
      } else if (status.includes('awaiting_approval') || result.data?.status === 'awaiting_approval') {
        setErrorMsg(STATUS_MESSAGES.awaiting_approval);
      } else if (status.includes('rejected') || result.data?.status === 'rejected') {
        setErrorMsg(STATUS_MESSAGES.rejected(result.data?.rejection_reason));
      } else if (status.includes('suspended') || result.data?.status === 'suspended') {
        setErrorMsg(STATUS_MESSAGES.suspended);
      } else {
        setErrorMsg(result.error || 'Email atau password salah.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center mb-3 shadow-[var(--shadow-neon-blue)]">
            <Lamp className="w-7 h-7 text-neon-blue" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary tracking-wide">PJU Monitor</h1>
          <p className="text-text-muted text-sm mt-1">Smart Solar Street Lamp</p>
        </div>

        {/* Card */}
        <Card className="glass-strong rounded-[var(--radius-card)] p-8 border-none shadow-none block py-0 gap-0 ring-0">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Masuk</h2>
          <p className="text-text-muted text-sm mb-6">Masuk untuk mengakses dashboard monitoring</p>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2 items-start bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
              <p className="text-sm text-neon-red">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:bg-transparent hover:text-text-secondary w-8 h-8"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">
                Lupa password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</>
              ) : 'Masuk'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
