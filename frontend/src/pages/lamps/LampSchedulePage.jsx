import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sun, Moon, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LampSchedulePage() {
  const { id } = useParams();
  const [lamp, setLamp] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: 'Jadwal Default',
    auto_sunrise: true,
    auto_sunset: true,
    on_time: '18:00',
    off_time: '06:00',
    dimming_schedule: [
      { hour: 18, minute: 0, brightness: 100 },
      { hour: 22, minute: 0, brightness: 50 },
      { hour: 4, minute: 0, brightness: 100 },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lampRes, schedRes] = await Promise.allSettled([
          api.get(`/lamps/${id}`),
          api.get(`/lamps/${id}/schedule`),
        ]);
        if (lampRes.status === 'fulfilled') setLamp(lampRes.value.data);
        if (schedRes.status === 'fulfilled') {
          const items = schedRes.value.data?.items || schedRes.value.data || [];
          setSchedules(items);
          if (items.length > 0) {
            const s = items[0];
            setForm({
              name: s.name || 'Jadwal Default',
              auto_sunrise: s.auto_sunrise ?? true,
              auto_sunset: s.auto_sunset ?? true,
              on_time: s.on_time || '18:00',
              off_time: s.off_time || '06:00',
              dimming_schedule: s.dimming_schedule?.length ? s.dimming_schedule : form.dimming_schedule,
            });
          }
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const addDimmingEntry = () => {
    setForm((f) => ({
      ...f,
      dimming_schedule: [...f.dimming_schedule, { hour: 0, minute: 0, brightness: 100 }],
    }));
  };

  const removeDimmingEntry = (idx) => {
    setForm((f) => ({
      ...f,
      dimming_schedule: f.dimming_schedule.filter((_, i) => i !== idx),
    }));
  };

  const updateDimming = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      dimming_schedule: f.dimming_schedule.map((d, i) =>
        i === idx ? { ...d, [field]: Number(value) } : d
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/lamps/${id}/schedule`, form);
      toast.success('Jadwal berhasil disimpan & dikirim ke perangkat');
    } catch {
      toast.error('Gagal menyimpan jadwal');
    } finally { setSaving(false); }
  };

  // Timeline visualization
  const timelineBlocks = () => {
    const sorted = [...form.dimming_schedule].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    return sorted.map((entry, i) => {
      const next = sorted[(i + 1) % sorted.length];
      const startMin = entry.hour * 60 + entry.minute;
      const endMin = next ? next.hour * 60 + next.minute : 1440;
      const width = ((endMin > startMin ? endMin - startMin : 1440 - startMin + endMin) / 1440) * 100;
      const left = (startMin / 1440) * 100;
      const opacity = entry.brightness / 100;
      return { left, width, brightness: entry.brightness, opacity, hour: entry.hour, minute: entry.minute };
    });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/dashboard/lamps/${id}`} className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-purple" /> Konfigurasi Jadwal
          </h1>
          <p className="text-text-muted text-sm">{lamp?.lamp_code || 'Lampu'}</p>
        </div>
      </div>

      {/* Schedule form */}
      <Card className="glass-card p-6 space-y-5 border-none shadow-none block py-0 gap-0 ring-0">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-text-secondary">Nama Jadwal</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>

        {/* Mode */}
        <div>
          <Label className="block text-text-secondary mb-3">Mode On/Off</Label>
          <div className="flex gap-4">
            <Label className="flex items-center gap-2 cursor-pointer font-normal">
              <input type="checkbox" checked={form.auto_sunrise} onChange={(e) => setForm((f) => ({ ...f, auto_sunrise: e.target.checked }))}
                className="accent-neon-blue" />
              <Sun className="w-4 h-4 text-neon-amber" />
              <span className="text-sm text-text-secondary">Auto Sunrise/Sunset</span>
            </Label>
          </div>
          {!form.auto_sunrise && (
            <div className="flex gap-4 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted font-normal">Nyala</Label>
                <Input type="time" value={form.on_time} onChange={(e) => setForm((f) => ({ ...f, on_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted font-normal">Mati</Label>
                <Input type="time" value={form.off_time} onChange={(e) => setForm((f) => ({ ...f, off_time: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {/* Dimming schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-text-secondary">Dimming Schedule</Label>
            <Button variant="ghost" size="sm" onClick={addDimmingEntry} className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10 h-8 px-2">
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
          <div className="space-y-2">
            {form.dimming_schedule.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <Input type="number" min="0" max="23" value={entry.hour}
                    onChange={(e) => updateDimming(i, 'hour', e.target.value)}
                    className="w-14 text-center px-1" />
                  <span className="text-text-muted">:</span>
                  <Input type="number" min="0" max="59" value={entry.minute}
                    onChange={(e) => updateDimming(i, 'minute', e.target.value)}
                    className="w-14 text-center px-1" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input type="range" min="0" max="100" value={entry.brightness}
                    onChange={(e) => updateDimming(i, 'brightness', e.target.value)}
                    className="flex-1 accent-neon-blue" />
                  <span className="text-sm text-neon-blue font-medium w-10 text-right">{entry.brightness}%</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDimmingEntry(i)} className="text-text-muted hover:text-neon-red hover:bg-neon-red/10 h-8 w-8 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Preview */}
        <div>
          <Label className="text-text-secondary mb-2 block">Preview 24 Jam</Label>
          <div className="relative h-10 bg-surface rounded-lg overflow-hidden border border-border">
            {timelineBlocks().map((block, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center justify-center text-[10px] font-medium"
                style={{
                  left: `${block.left}%`,
                  width: `${Math.max(block.width, 2)}%`,
                  backgroundColor: `rgba(0, 212, 255, ${block.opacity * 0.5})`,
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {block.brightness}%
              </div>
            ))}
            {/* Hour markers */}
            {[0, 6, 12, 18].map((h) => (
              <div key={h} className="absolute bottom-0 text-[8px] text-text-muted" style={{ left: `${(h / 24) * 100}%` }}>
                {h}:00
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary mt-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan & Kirim ke Perangkat
        </Button>
      </Card>
    </div>
  );
}
