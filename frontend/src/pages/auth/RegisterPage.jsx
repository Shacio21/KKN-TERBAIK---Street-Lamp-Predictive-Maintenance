import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Lamp, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function PasswordStrength({ password }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['', 'bg-neon-red', 'bg-neon-amber', 'bg-neon-blue', 'bg-neon-green'];
  const textColors = ['', 'text-neon-red', 'text-neon-amber', 'text-neon-blue', 'text-neon-green'];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? colors[score] : 'bg-surface-active'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama lengkap wajib diisi';
    if (!form.email) e.email = 'Email wajib diisi';
    if (form.password.length < 8) e.password = 'Password minimal 8 karakter';
    if (form.password !== form.confirm) e.confirm = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate('/verify-email', { state: { email: form.email } });
    } else {
      setErrors({ submit: result.error || 'Registrasi gagal. Email mungkin sudah terdaftar.' });
    }
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center mb-3 shadow-[var(--shadow-neon-blue)]">
            <Lamp className="w-7 h-7 text-neon-blue" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">PJU Monitor</h1>
          <p className="text-text-muted text-sm mt-1">Smart Solar Street Lamp</p>
        </div>

        <Card className="glass-strong rounded-[var(--radius-card)] p-8 border-none shadow-none block py-0 gap-0 ring-0">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Buat Akun</h2>
          <p className="text-text-muted text-sm mb-6">Daftar sebagai operator sistem</p>

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-start bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
              <p className="text-sm text-neon-red">{errors.submit}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Nama lengkap"
                  className={`pl-10 ${errors.name ? 'border-neon-red focus-visible:ring-neon-red' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-neon-red mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="nama@email.com"
                  className={`pl-10 ${errors.email ? 'border-neon-red focus-visible:ring-neon-red' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-neon-red mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 8 karakter"
                  className={`pl-10 pr-10 ${errors.password ? 'border-neon-red focus-visible:ring-neon-red' : ''}`}
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
              <PasswordStrength password={form.password} />
              {errors.password && <p className="text-xs text-neon-red mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="password"
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="Ulangi password"
                  className={`pl-10 pr-10 ${errors.confirm ? 'border-neon-red focus-visible:ring-neon-red' : ''}`}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                )}
              </div>
              {errors.confirm && <p className="text-xs text-neon-red mt-1">{errors.confirm}</p>}
            </div>

            <p className="text-xs text-text-muted">
              Akun baru akan didaftarkan sebagai <span className="text-neon-blue font-medium">Operator</span> dan memerlukan persetujuan admin.
            </p>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary mt-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...</> : 'Buat Akun'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">Login</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
