import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, RefreshCw, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import { formatNumber } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlaceListPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 });

  const fetchPlaces = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String((page - 1) * 25), limit: '25', ...(search && { search }) });
      const { data } = await api.get(`/places?${params}`);
      const items = data.items || data || [];
      setPlaces(items);
      setPagination((p) => ({ ...p, page, total: data.total || items.length }));
    } catch { setPlaces([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlaces(1); }, [search]);

  const columns = [
    {
      key: 'name', label: 'Nama Tempat', sortable: true,
      render: (v, row) => (
        <Link to={`/dashboard/places/${row.id}`} className="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">{v}</Link>
      ),
    },
    { key: 'type', label: 'Tipe', render: (v) => <Badge variant="info" size="sm">{v || '—'}</Badge> },
    { key: 'description', label: 'Deskripsi', render: (v) => <span className="text-text-muted truncate max-w-[200px] block">{v || '—'}</span> },
    {
      key: 'latitude', label: 'Koordinat',
      render: (v, row) => v && row.longitude ? (
        <span className="text-xs text-text-muted font-mono">{Number(v).toFixed(4)}, {Number(row.longitude).toFixed(4)}</span>
      ) : '—',
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link to={`/dashboard/places/${row.id}`} className="text-xs px-2 py-1 rounded bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors">Detail</Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neon-green" /> Daftar Tempat
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Manajemen area dan lokasi lampu PJU</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchPlaces(pagination.page)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <Button className="bg-gradient-to-r from-neon-green to-neon-blue hover:shadow-[var(--shadow-neon-blue)] border-none text-bg-primary gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Tambah Tempat
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Cari nama tempat..."
            className="pl-9 bg-surface/50" 
          />
        </div>
      </div>

      <DataTable columns={columns} data={places} isLoading={loading} pagination={pagination}
        onPageChange={fetchPlaces} emptyMessage="Tidak ada tempat yang ditemukan" />
    </div>
  );
}
