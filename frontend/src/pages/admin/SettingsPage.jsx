import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Bell, Clock, Zap, Shield, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    telemetry_interval_seconds: 120,
    alert_email_enabled: true,
    auto_create_ticket_on_fault: true,
    ml_prediction_enabled: true,
    ml_min_data_points: 48,
    battery_low_threshold: 20,
    solar_efficiency_target: 80,
    maintenance_reminder_days: 7,
    max_offline_minutes: 30,
    system_name: 'PJU Smart Monitoring',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings((s) => ({ ...s, ...data }));
      } catch {} // Use defaults if endpoint not available
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Pengaturan berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    } finally { setSaving(false); }
  };

  const update = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setSettings((s) => ({ ...s, [key]: val }));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" /></div>;

  const sections = [
    {
      icon: Clock, color: 'neon-blue', title: 'Telemetri & Koneksi',
      fields: [
        { key: 'telemetry_interval_seconds', label: 'Interval Telemetri (detik)', type: 'number', min: 30, max: 600 },
        { key: 'max_offline_minutes', label: 'Timeout Offline (menit)', type: 'number', min: 5, max: 120 },
      ],
    },
    {
      icon: Bell, color: 'neon-amber', title: 'Notifikasi & Alert',
      fields: [
        { key: 'alert_email_enabled', label: 'Kirim Alert via Email', type: 'checkbox' },
        { key: 'auto_create_ticket_on_fault', label: 'Otomatis Buat Tiket saat Fault', type: 'checkbox' },
        { key: 'battery_low_threshold', label: 'Batas Baterai Rendah (%)', type: 'number', min: 5, max: 50 },
      ],
    },
    {
      icon: Zap, color: 'neon-green', title: 'Energi',
      fields: [
        { key: 'solar_efficiency_target', label: 'Target Efisiensi Solar (%)', type: 'number', min: 50, max: 100 },
        { key: 'maintenance_reminder_days', label: 'Pengingat Maintenance (hari)', type: 'number', min: 1, max: 30 },
      ],
    },
    {
      icon: Shield, color: 'neon-purple', title: 'Machine Learning',
      fields: [
        { key: 'ml_prediction_enabled', label: 'Aktifkan Prediksi ML', type: 'checkbox' },
        { key: 'ml_min_data_points', label: 'Min. Data Point untuk Prediksi', type: 'number', min: 10, max: 200 },
      ],
    },
    {
      icon: Settings, color: 'text-secondary', title: 'Sistem',
      fields: [
        { key: 'system_name', label: 'Nama Sistem', type: 'text' },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-text-muted" /> Pengaturan Sistem
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Konfigurasi parameter sistem PJU</p>
        </div>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title} className={`glass-card p-5 border border-${section.color}/20 shadow-none block py-0 gap-0 ring-0`}>
            <h3 className={`text-sm font-semibold text-text-primary mb-4 flex items-center gap-2`}>
              <Icon className={`w-4 h-4 text-${section.color}`} /> {section.title}
            </h3>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <Label className="text-text-secondary flex-1 font-normal">{field.label}</Label>
                  {field.type === 'checkbox' ? (
                    <Label className="relative inline-flex items-center cursor-pointer font-normal">
                      <input type="checkbox" checked={settings[field.key]} onChange={update(field.key)}
                        className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-active rounded-full peer peer-checked:bg-neon-blue/30 
                        peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                        after:bg-text-muted peer-checked:after:bg-neon-blue after:rounded-full after:h-4 after:w-4 
                        after:transition-all transition-colors" />
                    </Label>
                  ) : (
                    <Input type={field.type} value={settings[field.key]} onChange={update(field.key)}
                      min={field.min} max={field.max}
                      className="w-32 text-right px-3" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <Button onClick={handleSave} disabled={saving}
        className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary mt-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Simpan Pengaturan
      </Button>
    </div>
  );
}
