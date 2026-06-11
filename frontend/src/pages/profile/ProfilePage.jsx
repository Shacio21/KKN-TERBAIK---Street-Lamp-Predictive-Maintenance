import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Save, Loader2, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/users/me', { name: profile.name });
      setUser(data);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan profil');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password.length < 8) { toast.error('Password baru minimal 8 karakter'); return; }
    if (passwords.new_password !== passwords.confirm) { toast.error('Konfirmasi password tidak cocok'); return; }
    setSavingPw(true);
    try {
      await api.post('/users/me/change-password', {
        old_password: passwords.current,
        new_password: passwords.new_password,
      });
      toast.success('Password berhasil diubah');
      setPasswords({ current: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal mengubah password. Periksa password lama.');
    } finally { setSavingPw(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profil' },
    { id: 'security', label: 'Keamanan' },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <User className="w-5 h-5 text-neon-purple" /> Profil Saya
        </h1>
        <p className="text-text-muted text-sm mt-0.5">Kelola informasi akun dan keamanan</p>
      </div>

      {/* Profile Header */}
      <Card className="glass-card p-5 flex flex-row items-center gap-4 border-none shadow-none py-0 ring-0">
        <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-neon-purple text-2xl font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">{user?.name}</p>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="info" size="sm">{user?.role || 'operator'}</Badge>
            <Badge variant="success" size="sm" dot>{user?.status || 'active'}</Badge>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <Button key={t.id} onClick={() => setTab(t.id)}
            variant="ghost"
            className={`rounded-none border-b-2 px-4 py-2.5 font-medium transition-colors ${
              tab === t.id ? 'border-neon-blue text-neon-blue hover:text-neon-blue bg-transparent hover:bg-transparent' : 'border-transparent text-text-muted hover:text-text-secondary bg-transparent hover:bg-transparent'
            }`}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input type="text" value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input type="email" value={profile.email} disabled
                  className="pl-10 bg-surface/50 cursor-not-allowed text-text-muted" />
              </div>
              <p className="text-xs text-text-muted mt-1">Email tidak dapat diubah.</p>
            </div>
            <Button type="submit" disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-bg-primary bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Profil
            </Button>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-neon-amber" />
              <h3 className="text-sm font-semibold text-text-primary">Ubah Password</h3>
            </div>
            {[
              { label: 'Password Lama', key: 'current', placeholder: 'Masukkan password saat ini' },
              { label: 'Password Baru', key: 'new_password', placeholder: 'Min. 8 karakter' },
              { label: 'Konfirmasi', key: 'confirm', placeholder: 'Ulangi password baru' },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-text-secondary">{field.label}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input type={showPw ? 'text' : 'password'} value={passwords[field.key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="pl-10 pr-10" />
                  {field.key === 'current' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button" 
                      onClick={() => setShowPw((v) => !v)} 
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:bg-transparent hover:text-text-secondary w-8 h-8"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="submit" disabled={savingPw}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-bg-primary bg-gradient-to-r from-neon-amber to-neon-red hover:opacity-90 border-none">
              {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Ubah Password
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
