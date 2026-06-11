import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Clock, CheckCircle, XCircle, Upload, Loader2, User, MessageSquare } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import { formatDateTime, timeAgo } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const STATUS_VARIANT = { open: 'warning', in_progress: 'info', resolved: 'success', cancelled: 'offline' };

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const [ticketRes, attRes] = await Promise.allSettled([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/attachments`),
      ]);
      if (ticketRes.status === 'fulfilled') {
        setTicket(ticketRes.value.data);
        setLogs(ticketRes.value.data.logs || []);
      }
      if (attRes.status === 'fulfilled') {
        const d = attRes.value.data;
        setAttachments(d.items || d || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const addLog = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tickets/${id}/logs`, { action: 'note', note });
      setNote('');
      toast.success('Catatan ditambahkan');
      fetchTicket();
    } catch { toast.error('Gagal menambahkan catatan'); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      toast.success(`Status diubah ke ${status}`);
      fetchTicket();
    } catch { toast.error('Gagal mengubah status'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File maksimal 10MB'); return; }
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/tickets/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File berhasil diupload');
      fetchTicket();
    } catch { toast.error('Gagal mengupload file'); }
    finally { setUploadingFile(false); }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!ticket) return <div className="text-center py-16 text-text-muted"><Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Tiket tidak ditemukan.</p></div>;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/dashboard/tickets" className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Badge variant={STATUS_VARIANT[ticket.status] || 'default'} dot>{ticket.status?.replace('_', ' ')}</Badge>
            <Badge variant={ticket.priority === 'critical' ? 'fault' : ticket.priority === 'high' ? 'fault' : 'warning'} size="sm">Prioritas: {ticket.priority}</Badge>
          </div>
          <h1 className="text-xl font-bold text-text-primary">{ticket.title}</h1>
          <p className="text-text-muted text-xs mt-1">Dibuat {timeAgo(ticket.created_at)} · Lampu: {ticket.lamp?.lamp_code || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Deskripsi</h3>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{ticket.description || 'Tidak ada deskripsi.'}</p>
          </Card>

          {/* Add Note */}
          <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neon-blue" /> Tambah Catatan
            </h3>
            <form onSubmit={addLog} className="space-y-3">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Tambahkan catatan..."
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-blue/50 resize-none transition-colors" />
              <Button type="submit" disabled={submitting || !note.trim()}
                className="font-semibold bg-neon-blue hover:shadow-[var(--shadow-neon-blue)] hover:bg-neon-blue/90 border-none text-bg-primary gap-2 mt-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Kirim Catatan
              </Button>
            </form>
          </Card>

          {/* Activity Timeline */}
          <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Riwayat Aktivitas</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-neon-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">{timeAgo(log.created_at)} · <span className="text-text-secondary">{log.user?.name || 'User'}</span></p>
                      <p className="text-sm text-text-primary mt-0.5">{log.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Attachments */}
          <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Foto Lampiran ({attachments.length}/5)</h3>
              <Label className={`flex items-center gap-1.5 text-xs cursor-pointer px-2.5 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors font-normal ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={attachments.length >= 5} />
              </Label>
            </div>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((att) => (
                  <a key={att.id} href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/${att.file_path}`}
                    target="_blank" rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border border-border bg-surface hover:border-neon-blue/30 transition-colors block">
                    <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/${att.file_path}`}
                      alt={att.file_name} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">Belum ada foto lampiran</p>
            )}
          </Card>
        </div>

        {/* Sidebar info & actions */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="glass-card p-5 border-none shadow-none block py-0 gap-0 ring-0">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Aksi</h3>
            <div className="space-y-2">
              {ticket.status === 'open' && (
                <Button onClick={() => updateStatus('in_progress')}
                  className="w-full font-semibold bg-neon-blue hover:bg-neon-blue/90 border-none text-bg-primary gap-2">
                  <Clock className="w-4 h-4" /> Mulai Kerjakan
                </Button>
              )}
              {ticket.status === 'in_progress' && (
                <Button onClick={() => updateStatus('resolved')}
                  className="w-full font-semibold bg-neon-green hover:bg-neon-green/90 border-none text-bg-primary gap-2">
                  <CheckCircle className="w-4 h-4" /> Selesaikan
                </Button>
              )}
              {ticket.status !== 'cancelled' && ticket.status !== 'resolved' && (
                <Button variant="outline" onClick={() => updateStatus('cancelled')}
                  className="w-full gap-2">
                  <XCircle className="w-4 h-4" /> Batalkan
                </Button>
              )}
            </div>
          </Card>

          {/* Details */}
          <Card className="glass-card p-5 space-y-3 text-sm border-none shadow-none block py-0 gap-0 ring-0">
            {[
              ['Lampu', ticket.lamp ? <Link to={`/dashboard/lamps/${ticket.lamp_id}`} className="text-neon-blue hover:text-neon-blue/80">{ticket.lamp.lamp_code}</Link> : '—'],
              ['Dibuat oleh', ticket.creator?.name || '—'],
              ['Di-assign ke', ticket.assignee?.name || 'Belum assign'],
              ['Tanggal Dibuat', formatDateTime(ticket.created_at)],
              ['Terakhir Update', formatDateTime(ticket.updated_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-text-muted text-xs">{label}</span>
                <span className="text-text-secondary">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
