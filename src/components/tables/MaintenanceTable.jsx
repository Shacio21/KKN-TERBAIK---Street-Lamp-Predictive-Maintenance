import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../dashboard/StatusBadge';
import toast from 'react-hot-toast';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function MaintenanceTable({ data }) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortKey, setSortKey] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = [...data];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.lampId.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.issue.toLowerCase().includes(q)
      );
    }

    // Filter
    if (priorityFilter !== 'all') {
      result = result.filter((r) => r.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let va, vb;
      if (sortKey === 'riskScore') {
        va = a.riskScore; vb = b.riskScore;
      } else if (sortKey === 'priority') {
        va = priorityOrder[a.priority]; vb = priorityOrder[b.priority];
      } else if (sortKey === 'predictedDate') {
        va = new Date(a.predictedDate); vb = new Date(b.predictedDate);
      } else {
        va = a[sortKey]; vb = b[sortKey];
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, priorityFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleSchedule = (lampId) => {
    toast.success(`Maintenance scheduled for Lamp ${lampId}`, {
      icon: '🔧',
    });
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return <ChevronDown className={`w-3 h-3 text-neon-blue transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <div className="glass-card overflow-hidden border border-border">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface rounded-xl px-3 py-2 border border-border focus-within:border-neon-blue/30 transition-colors">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search lamps, locations, issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-text-primary outline-none w-full placeholder:text-text-muted"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-secondary hover:border-neon-blue/30 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="capitalize">{priorityFilter === 'all' ? 'All Priority' : priorityFilter}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          {showFilter && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 right-0 z-20 glass-strong border border-border rounded-xl overflow-hidden py-1 min-w-[140px]"
            >
              {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => { setPriorityFilter(p); setShowFilter(false); }}
                  className={`block w-full text-left px-3 py-2 text-xs capitalize transition-colors ${
                    priorityFilter === p ? 'text-neon-blue bg-neon-blue/10' : 'text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {p === 'all' ? 'All Priority' : p}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <span className="text-[11px] text-text-muted">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                { key: 'lampId', label: 'Lamp ID', sortable: false },
                { key: 'location', label: 'Location', sortable: false },
                { key: 'issue', label: 'Issue', sortable: false },
                { key: 'priority', label: 'Priority', sortable: true },
                { key: 'riskScore', label: 'Risk Score', sortable: true },
                { key: 'predictedDate', label: 'Predicted Failure', sortable: true },
                { key: 'action', label: 'Action', sortable: false },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                >
                  {col.sortable ? (
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                      {col.label}
                      <SortIcon column={col.key} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-text-muted">
                  No matching records found
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/40 hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-neon-blue font-[family-name:var(--font-display)]">
                      {row.lampId}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{row.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${row.priority === 'critical' ? 'text-neon-red' : 'text-neon-amber'}`} />
                      <span className="text-sm text-text-primary">{row.issue}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${row.riskScore}%`,
                            background: row.riskScore >= 80 ? '#EF4444' : row.riskScore >= 60 ? '#F59E0B' : '#00FF88',
                            boxShadow: `0 0 6px ${row.riskScore >= 80 ? '#EF444440' : row.riskScore >= 60 ? '#F59E0B40' : '#00FF8840'}`,
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${row.riskScore >= 80 ? 'text-neon-red' : row.riskScore >= 60 ? 'text-neon-amber' : 'text-neon-green'}`}>
                        {row.riskScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3 text-text-muted" />
                      {row.predictedDate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSchedule(row.lampId)}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors"
                    >
                      Schedule
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
