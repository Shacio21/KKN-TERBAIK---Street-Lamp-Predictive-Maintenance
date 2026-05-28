import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, RefreshCw, Lightbulb, Search } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import { formatNumber, timeAgo } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_VARIANT = {
  online: 'online', warning: 'warning', fault: 'fault',
  maintenance: 'maintenance', offline: 'offline',
};
const RISK_VARIANT = { high: 'high', medium: 'medium', low: 'low', unknown: 'default' };

const LAMP_STATUS_LABELS = {
  online: 'Online', warning: 'Warning', fault: 'Fault',
  maintenance: 'Maintenance', offline: 'Offline',
};

export default function LampListPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [lamps, setLamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 });
  const [summary, setSummary] = useState(null);

  const fetchLamps = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * pagination.pageSize),
        limit: String(pagination.pageSize),
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
      });
      const { data } = await api.get(`/lamps?${params}`);
      const items = data.items || data || [];
      const total = data.total || items.length;
      setLamps(items);
      setPagination((p) => ({ ...p, page, total }));
    } catch { setLamps([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLamps(1); }, [search, filterStatus]);

  // Compute summary
  const summaryData = summary || {
    total: pagination.total,
    online: lamps.filter(l => l.status === 'online').length,
    fault: lamps.filter(l => l.status === 'fault').length,
    avg_battery: lamps.length ? (lamps.reduce((s, l) => s + (l.last_battery_level || 0), 0) / lamps.length).toFixed(0) : 0,
  };

  const columns = [
    {
      key: 'lamp_code', label: 'Kode Lampu', sortable: true,
      render: (v, row) => (
        <Link to={`/dashboard/lamps/${row.id}`} className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
          {v}
        </Link>
      ),
    },
    {
      key: 'place_id', label: 'Lokasi',
      render: (_, row) => <span className="text-text-secondary">{row.place?.name || '—'}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={STATUS_VARIANT[v] || 'default'} dot>{LAMP_STATUS_LABELS[v] || v}</Badge>,
    },
    {
      key: 'last_battery_level', label: 'Baterai', sortable: true,
      render: (v) => v != null ? (
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-surface-active rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${v > 50 ? 'bg-neon-green' : v > 20 ? 'bg-neon-amber' : 'bg-neon-red'}`}
              style={{ width: `${v}%` }}
            />
          </div>
          <span className="text-xs">{v.toFixed(0)}%</span>
        </div>
      ) : '—',
    },
    {
      key: 'last_brightness', label: 'Kecerahan',
      render: (v) => v != null ? `${v.toFixed(0)}%` : '—',
    },
    {
      key: 'health_score', label: 'Health', sortable: true,
      render: (v) => v != null ? (
        <span className={v > 70 ? 'text-neon-green' : v > 40 ? 'text-neon-amber' : 'text-neon-red'}>
          {v.toFixed(0)}%
        </span>
      ) : '—',
    },
    {
      key: 'risk_level', label: 'Risiko',
      render: (v) => v ? <Badge variant={RISK_VARIANT[v] || 'default'} size="sm">{v}</Badge> : '—',
    },
    {
      key: 'last_seen', label: 'Terakhir Update',
      render: (v) => <span className="text-text-muted text-xs">{timeAgo(v)}</span>,
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/lamps/${row.id}`}
            className="text-xs px-2 py-1 rounded bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors"
          >
            Detail
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-neon-blue" /> Daftar Lampu
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Manajemen semua unit lampu PJU</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchLamps(pagination.page)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <Button className="bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Tambah Lampu
            </Button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: formatNumber(summaryData.total), color: 'text-text-primary' },
          { label: 'Online',  value: formatNumber(summaryData.online), color: 'text-neon-green' },
          { label: 'Fault',   value: formatNumber(summaryData.fault),  color: 'text-neon-red' },
          { label: 'Avg Baterai', value: `${summaryData.avg_battery}%`, color: 'text-neon-amber' },
        ].map((s) => (
          <div key={s.label} className="glass-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode lampu..."
            className="pl-9 bg-surface/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-neon-blue/50 transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="warning">Warning</option>
          <option value="fault">Fault</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={lamps}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchLamps(p)}
        onRowClick={(row) => {}}
        emptyMessage="Tidak ada lampu yang sesuai filter"
      />
    </div>
  );
}
