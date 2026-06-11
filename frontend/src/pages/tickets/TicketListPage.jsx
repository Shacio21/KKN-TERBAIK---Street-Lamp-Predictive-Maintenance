import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, RefreshCw, Search } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import { timeAgo, formatDateTime } from '../../lib/utils';
import { Button } from "@/components/ui/button";

const STATUS_VARIANT = { open: 'warning', in_progress: 'info', resolved: 'success', cancelled: 'offline' };
const PRIORITY_VARIANT = { low: 'info', medium: 'warning', high: 'fault', critical: 'critical' };

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 });
  const [summary, setSummary] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * 25), limit: '25',
        ...(filterStatus && { status: filterStatus }),
      });
      const { data } = await api.get(`/tickets?${params}`);
      const items = data.items || data || [];
      setTickets(items);
      setPagination((p) => ({ ...p, page, total: data.total || items.length }));
      setSummary({
        total: data.total || items.length,
        open: items.filter(t => t.status === 'open').length,
        in_progress: items.filter(t => t.status === 'in_progress').length,
        resolved: items.filter(t => t.status === 'resolved').length,
      });
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(1); }, [filterStatus]);

  const columns = [
    {
      key: 'title', label: 'Judul',
      render: (v, row) => (
        <Link to={`/dashboard/tickets/${row.id}`} className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">{v}</Link>
      ),
    },
    {
      key: 'lamp_id', label: 'Lampu',
      render: (_, row) => row.lamp?.lamp_code ? (
        <Link to={`/dashboard/lamps/${row.lamp_id}`} className="text-text-secondary hover:text-neon-blue text-xs transition-colors">{row.lamp.lamp_code}</Link>
      ) : '—',
    },
    { key: 'priority', label: 'Prioritas', render: (v) => <Badge variant={PRIORITY_VARIANT[v] || 'default'} size="sm">{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={STATUS_VARIANT[v] || 'default'} size="sm">{v?.replace('_', ' ')}</Badge> },
    {
      key: 'assigned_to', label: 'Di-assign',
      render: (_, row) => <span className="text-text-muted text-xs">{row.assignee?.name || 'Belum assign'}</span>,
    },
    { key: 'created_at', label: 'Dibuat', render: (v) => <span className="text-text-muted text-xs">{timeAgo(v)}</span> },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <Link to={`/dashboard/tickets/${row.id}`} className="text-xs px-2 py-1 rounded bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors">Detail</Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Wrench className="w-5 h-5 text-neon-amber" /> Tiket Perbaikan
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Manajemen permintaan perbaikan lampu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchTickets(pagination.page)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="bg-gradient-to-r from-neon-amber to-neon-red hover:shadow-[var(--shadow-neon-amber)] border-none text-bg-primary gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Buat Tiket
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: summary.total, color: 'text-text-primary' },
          { label: 'Open', value: summary.open, color: 'text-neon-amber' },
          { label: 'In Progress', value: summary.in_progress, color: 'text-neon-blue' },
          { label: 'Resolved', value: summary.resolved, color: 'text-neon-green' },
        ].map((s) => (
          <div key={s.label} className="glass-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-neon-blue/50 transition-colors">
          <option value="">Semua Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={tickets} isLoading={loading} pagination={pagination}
        onPageChange={fetchTickets} emptyMessage="Tidak ada tiket perbaikan" />
    </div>
  );
}
