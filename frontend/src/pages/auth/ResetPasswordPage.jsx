import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Lamp, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (form.password !== form.confirm) { setError('Konfirmasi password tidak cocok.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, new_password: form.password });
      toast.success('Password berhasil direset. Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Link reset tidak valid atau sudah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
        <div className="glass-strong rounded-[var(--radius-card)] p-8 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-neon-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Link Tidak Valid</h2>
          <p className="text-text-muted text-sm mb-4">Token reset password tidak ditemukan.</p>
          <Link to="/forgot-password" className="text-neon-blue hover:text-neon-blue/80 text-sm transition-colors">
            Minta link baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center mb-3">
            <Lamp className="w-7 h-7 text-neon-blue" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">PJU Monitor</h1>
        </div>

        <Card className="glass-strong rounded-[var(--radius-card)] p-8 border-none shadow-none block py-0 gap-0 ring-0">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Reset Password</h2>
          <p className="text-text-muted text-sm mb-6">Buat password baru untuk akun Anda.</p>

          {error && (
            <div className="flex gap-2 items-start bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
              <p className="text-sm text-neon-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="Min. 8 karakter"
                  className="pl-10 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button" 
                  onClick={() => setShowPw((v) => !v)} 
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:bg-transparent hover:text-text-secondary w-8 h-8"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-text-secondary">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  required
                  placeholder="Ulangi password baru"
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Password Baru'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            <Link to="/login" className="text-neon-blue hover:text-neon-blue/80 transition-colors">← Kembali ke Login</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
