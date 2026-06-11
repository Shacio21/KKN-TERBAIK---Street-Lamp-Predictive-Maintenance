import { useState } from 'react';
import { FileText, Download, Calendar, Loader2, BarChart2, Zap, Wrench, Activity } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const REPORT_TYPES = [
  {
    id: 'lamp_status',
    title: 'Laporan Status Lampu',
    desc: 'Ringkasan kondisi semua lampu berdasarkan status, health score, dan baterai.',
    icon: BarChart2,
    color: 'neon-blue',
    format: ['pdf', 'csv'],
  },
  {
    id: 'energy',
    title: 'Laporan Energi & Sustainability',
    desc: 'Performa energi surya, konsumsi listrik, penghematan biaya, dan dampak lingkungan.',
    icon: Zap,
    color: 'neon-green',
    format: ['pdf', 'csv'],
  },
  {
    id: 'maintenance',
    title: 'Laporan Pemeliharaan',
    desc: 'Ringkasan tiket perbaikan, waktu respons, dan riwayat maintenance.',
    icon: Wrench,
    color: 'neon-amber',
    format: ['pdf', 'csv'],
  },
  {
    id: 'predictive',
    title: 'Laporan Prediktif (ML)',
    desc: 'Hasil prediksi risiko kerusakan dari model Machine Learning.',
    icon: Activity,
    color: 'neon-purple',
    format: ['pdf', 'csv'],
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const generateReport = async (type, format) => {
    const key = `${type}-${format}`;
    setGenerating(key);
    try {
      const response = await api.get(`/reports/${type}`, {
        params: { start_date: dateRange.start, end_date: dateRange.end, format },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${type}_${dateRange.start}_${dateRange.end}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Laporan ${type} berhasil diunduh`);
    } catch {
      toast.error('Gagal menghasilkan laporan. Coba lagi.');
    } finally {
      setGenerating('');
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-neon-purple" /> Laporan
        </h1>
        <p className="text-text-muted text-sm mt-0.5">Generate dan unduh laporan sistem PJU</p>
      </div>

      {/* Date Range Picker */}
      <Card className="glass-card p-5 border border-border shadow-none block py-0 gap-0 ring-0">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-neon-blue" />
          <h3 className="text-sm font-semibold text-text-primary">Rentang Waktu</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted font-normal">Tanggal Mulai</Label>
            <Input type="date" value={dateRange.start}
              onChange={(e) => setDateRange((d) => ({ ...d, start: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted font-normal">Tanggal Akhir</Label>
            <Input type="date" value={dateRange.end}
              onChange={(e) => setDateRange((d) => ({ ...d, end: e.target.value }))} />
          </div>
          <div className="flex gap-1.5">
            {[
              { label: '7 Hari', days: 7 },
              { label: '30 Hari', days: 30 },
              { label: '90 Hari', days: 90 },
            ].map((preset) => (
              <Button key={preset.days} variant="outline" size="sm"
                onClick={() => setDateRange({
                  start: new Date(Date.now() - preset.days * 86400000).toISOString().slice(0, 10),
                  end: new Date().toISOString().slice(0, 10),
                })}
                className="h-[38px]">
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className={`glass-card p-5 border border-${report.color}/20 hover:border-${report.color}/40 shadow-none transition-colors block py-0 gap-0 ring-0`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-${report.color}/10 border border-${report.color}/20 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 text-${report.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{report.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{report.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {report.format.map((fmt) => {
                  const key = `${report.id}-${fmt}`;
                  const isLoading = generating === key;
                  return (
                    <Button key={fmt} variant={fmt === 'pdf' ? 'secondary' : 'outline'} size="sm" onClick={() => generateReport(report.id, fmt)} disabled={!!generating}
                      className={`gap-1.5 h-8 ${fmt === 'pdf' ? `text-${report.color} bg-${report.color}/10 hover:bg-${report.color}/20` : ''}`}>
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      {fmt.toUpperCase()}
                    </Button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
