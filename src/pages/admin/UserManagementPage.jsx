import { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import api from '../../lib/axios';
import { formatDateTime, timeAgo } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";

const ROLE_VARIANT = { admin: 'info', operator: 'success', viewer: 'default' };
const STATUS_VARIANT = { active: 'online', pending: 'warning', awaiting_approval: 'warning', rejected: 'fault', suspended: 'offline' };

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 });
  const [processing, setProcessing] = useState('');

  // Rejection modal
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, reason: '' });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * 25), limit: '25',
        ...(filterStatus && { status: filterStatus }),
      });
      const { data } = await api.get(`/admin/users?${params}`);
      const items = data.items || data || [];
      setUsers(items);
      setPagination((p) => ({ ...p, page, total: data.total || items.length }));
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1); }, [filterStatus]);

  const approveUser = async (userId) => {
    setProcessing(userId);
    try {
      await api.patch(`/admin/users/${userId}/approval`, { approved: true });
      toast.success('User disetujui');
      fetchUsers(pagination.page);
    } catch { toast.error('Gagal menyetujui user'); }
    finally { setProcessing(''); }
  };

  const rejectUser = async () => {
    if (!rejectModal.userId) return;
    setProcessing(rejectModal.userId);
    try {
      await api.patch(`/admin/users/${rejectModal.userId}/approval`, { approved: false, reason: rejectModal.reason });
      toast.success('User ditolak');
      setRejectModal({ open: false, userId: null, reason: '' });
      fetchUsers(pagination.page);
    } catch { toast.error('Gagal menolak user'); }
    finally { setProcessing(''); }
  };

  const toggleSuspend = async (userId, currentStatus) => {
    setProcessing(userId);
    const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
    try {
      await api.patch(`/admin/users/${userId}/${action}`);
      toast.success(action === 'suspend' ? 'User ditangguhkan' : 'User diaktifkan kembali');
      fetchUsers(pagination.page);
    } catch { toast.error('Gagal mengubah status user'); }
    finally { setProcessing(''); }
  };

  const columns = [
    { key: 'name', label: 'Nama', render: (v) => <span className="font-medium text-text-primary">{v}</span> },
    { key: 'email', label: 'Email', render: (v) => <span className="text-text-muted text-xs">{v}</span> },
    { key: 'role', label: 'Role', render: (v) => <Badge variant={ROLE_VARIANT[v] || 'default'} size="sm">{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={STATUS_VARIANT[v] || 'default'} size="sm" dot>{v?.replace('_', ' ')}</Badge> },
    { key: 'created_at', label: 'Terdaftar', render: (v) => <span className="text-text-muted text-xs">{timeAgo(v)}</span> },
    {
      key: 'actions', label: 'Aksi',
      render: (_, row) => {
        const isProc = processing === row.id;
        return (
          <div className="flex gap-1.5">
            {row.status === 'awaiting_approval' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => approveUser(row.id)} disabled={isProc}
                  className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 h-8 px-2">
                  {isProc ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />} Setujui
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setRejectModal({ open: true, userId: row.id, reason: '' })} disabled={isProc}
                  className="text-neon-red hover:text-neon-red hover:bg-neon-red/10 h-8 px-2">
                  <XCircle className="w-4 h-4 mr-1" /> Tolak
                </Button>
              </>
            )}
            {row.status === 'active' && (
              <Button variant="ghost" size="sm" onClick={() => toggleSuspend(row.id, row.status)} disabled={isProc}
                className="text-text-muted hover:text-neon-red hover:bg-neon-red/10 h-8 px-2">
                Tangguhkan
              </Button>
            )}
            {row.status === 'suspended' && (
              <Button variant="ghost" size="sm" onClick={() => toggleSuspend(row.id, row.status)} disabled={isProc}
                className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 h-8 px-2">
                Aktifkan
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Count by status
  const awaitingCount = users.filter(u => u.status === 'awaiting_approval').length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-blue" /> Manajemen User
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Kelola akun pengguna sistem</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchUsers(pagination.page)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Pending alert */}
      {awaitingCount > 0 && (
        <div className="flex items-center gap-3 bg-neon-amber/5 border border-neon-amber/20 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-neon-amber/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-neon-amber" />
          </div>
          <div>
            <p className="text-sm font-medium text-neon-amber">{awaitingCount} pendaftaran menunggu persetujuan</p>
            <p className="text-xs text-text-muted">Filter status "Awaiting Approval" untuk melihat</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-neon-blue/50 transition-colors">
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="awaiting_approval">Awaiting Approval</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <DataTable columns={columns} data={users} isLoading={loading} pagination={pagination}
        onPageChange={fetchUsers} emptyMessage="Tidak ada user ditemukan" />

      {/* Rejection Modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, userId: null, reason: '' })}
        title="Tolak Pendaftaran" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Berikan alasan penolakan agar user mengetahui kenapa pendaftaran ditolak.</p>
          <textarea value={rejectModal.reason} onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
            rows={3} placeholder="Alasan penolakan (opsional)..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-blue/50 resize-none transition-colors" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRejectModal({ open: false, userId: null, reason: '' })}>
              Batal
            </Button>
            <Button onClick={rejectUser} disabled={!!processing}
              className="bg-neon-red hover:bg-neon-red/90 text-white border-none gap-2">
              {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Tolak
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
