import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lamp, Loader2, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengirim email. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">Email Terkirim!</h2>
              <p className="text-text-muted text-sm mb-6">
                Link reset password telah dikirim ke <span className="text-neon-blue">{email}</span>. Link berlaku 1 jam.
              </p>
              <Link to="/login" className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors">
                ← Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Lupa Password</h2>
              <p className="text-text-muted text-sm mb-6">Masukkan email Anda dan kami akan mengirimkan link reset.</p>

              {error && (
                <p className="text-xs text-neon-red bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary mt-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : 'Kirim Link Reset'}
                </Button>
              </form>

              <p className="text-center text-sm text-text-muted mt-6">
                <Link to="/login" className="text-neon-blue hover:text-neon-blue/80 transition-colors">← Kembali ke Login</Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
