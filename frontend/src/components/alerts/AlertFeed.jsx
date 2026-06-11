import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import AlertCard from './AlertCard';

export default function AlertFeed({ alerts, onResolve, maxItems, showFilter = true }) {
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'critical', 'warning', 'info'];

  const filtered = useMemo(() => {
    let result = alerts;
    if (filter !== 'all') {
      result = result.filter((a) => a.severity === filter);
    }
    if (maxItems) {
      result = result.slice(0, maxItems);
    }
    return result;
  }, [alerts, filter, maxItems]);

  const counts = useMemo(() => {
    const c = { all: alerts.length, critical: 0, warning: 0, info: 0 };
    alerts.forEach((a) => { if (c[a.severity] !== undefined) c[a.severity]++; });
    return c;
  }, [alerts]);

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      {showFilter && (
        <div className="flex items-center gap-1 p-1 bg-surface rounded-xl w-fit">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                filter === f
                  ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/20'
                  : 'text-text-muted hover:text-text-secondary border border-transparent'
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((alert, i) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={onResolve}
                delay={i * 0.04}
              />
            ))
          ) : (
            <div className="text-center py-8 text-sm text-text-muted">
              No alerts to display
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
