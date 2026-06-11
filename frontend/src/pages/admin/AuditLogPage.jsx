import { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, Filter } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import { formatDateTime } from '../../lib/utils';
import { Button } from "@/components/ui/button";

const ACTION_COLORS = {
  login: 'info', logout: 'default', create: 'success', update: 'warning',
  delete: 'fault', approve: 'success', reject: 'fault', suspend: 'warning',
  export: 'info', import: 'info', command: 'info',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * 50), limit: '50',
        ...(filterAction && { action: filterAction }),
      });
      const { data } = await api.get(`/audit-logs?${params}`);
      const items = data.items || data || [];
      setLogs(items);
      setPagination((p) => ({ ...p, page, total: data.total || items.length }));
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(1); }, [filterAction]);

  const columns = [
    { key: 'created_at', label: 'Waktu', render: (v) => <span className="text-text-muted text-xs font-mono">{formatDateTime(v)}</span> },
    {
      key: 'user', label: 'User',
      render: (_, row) => (
        <div>
          <p className="text-sm text-text-primary">{row.user?.name || '—'}</p>
          <p className="text-xs text-text-muted">{row.user?.email || ''}</p>
        </div>
      ),
    },
    { key: 'action', label: 'Aksi', render: (v) => <Badge variant={ACTION_COLORS[v] || 'default'} size="sm">{v}</Badge> },
    { key: 'resource_type', label: 'Resource', render: (v) => <span className="text-text-secondary text-xs">{v || '—'}</span> },
    { key: 'resource_id', label: 'ID', render: (v) => v ? <span className="text-text-muted text-xs font-mono">{String(v).slice(0, 8)}...</span> : '—' },
    { key: 'details', label: 'Detail', render: (v) => <span className="text-text-muted text-xs truncate max-w-[200px] block">{v || '—'}</span> },
    { key: 'ip_address', label: 'IP', render: (v) => <span className="text-text-muted text-xs font-mono">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-neon-purple" /> Audit Log
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Riwayat aktivitas sistem dan pengguna</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchLogs(pagination.page)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-neon-blue/50 transition-colors">
          <option value="">Semua Aksi</option>
          {['login', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'suspend', 'export', 'command'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={logs} isLoading={loading} pagination={pagination}
        onPageChange={fetchLogs} emptyMessage="Tidak ada log aktivitas" />
    </div>
  );
}
