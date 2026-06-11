import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lamp, MapPin, Ticket, X, Command, CornerDownLeft } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_ICONS = {
  lamps: Lamp,
  places: MapPin,
  tickets: Ticket,
};

const CATEGORY_LABELS = {
  lamps: 'Lampu',
  places: 'Tempat',
  tickets: 'Tiket',
};

const CATEGORY_ROUTES = {
  lamps: (item) => `/dashboard/lamps/${item.id}`,
  places: (item) => `/dashboard/places/${item.id}`,
  tickets: (item) => `/dashboard/tickets/${item.id}`,
};

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({});
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose?.(true); // toggle
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search
  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults({});
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(data);
      setSelectedIdx(0);
    } catch {
      setResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Flatten results for keyboard navigation
  const flatItems = Object.entries(results).flatMap(([category, items]) =>
    (items || []).map((item) => ({ ...item, _category: category }))
  );

  const handleSelect = (item) => {
    const routeFn = CATEGORY_ROUTES[item._category];
    if (routeFn) {
      navigate(routeFn(item));
      onClose?.(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose?.(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
        e.preventDefault();
        handleSelect(flatItems[selectedIdx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatItems, selectedIdx]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="search-modal-overlay" onClick={() => onClose?.(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="search-modal-input-wrap">
          <Search size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Cari lampu, tempat, atau tiket..."
            value={query}
            onChange={handleChange}
            className="search-modal-input border-none bg-transparent shadow-none focus-visible:ring-0 px-2 h-full text-lg w-full text-text-primary placeholder:text-text-muted"
          />
          <kbd className="search-kbd" onClick={() => onClose?.(false)}>
            <X size={12} /> ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="search-modal-results">
          {loading && (
            <div className="search-modal-empty">
              <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          )}

          {!loading && query.length >= 2 && flatItems.length === 0 && (
            <div className="search-modal-empty">
              <p style={{ color: 'var(--text-secondary)' }}>Tidak ada hasil untuk "{query}"</p>
            </div>
          )}

          {!loading && Object.entries(results).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            const Icon = CATEGORY_ICONS[category] || Search;
            const label = CATEGORY_LABELS[category] || category;

            return (
              <div key={category} className="search-result-group">
                <div className="search-result-category">
                  <Icon size={14} /> {label}
                </div>
                {items.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <Button
                      variant="ghost"
                      key={item.id || idx}
                      className={`search-result-item w-full justify-start h-auto py-3 px-4 flex items-center gap-3 rounded-xl transition-all ${idx === selectedIdx ? 'active bg-neon-blue/10 text-neon-blue' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
                      onClick={() => handleSelect({ ...item, _category: category })}
                      onMouseEnter={() => setSelectedIdx(idx)}
                    >
                      <span className="search-result-name flex-1 text-left font-medium">
                        {item.lamp_code || item.name || item.title || item.id}
                      </span>
                      <span className="search-result-meta flex items-center gap-2">
                        {item.status && (
                          <span className={`badge badge-${item.status}`}>{item.status}</span>
                        )}
                        {item.priority && (
                          <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                        )}
                      </span>
                      {idx === selectedIdx && <CornerDownLeft size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                    </Button>
                  );
                })}
              </div>
            );
          })}

          {!loading && query.length < 2 && (
            <div className="search-modal-empty">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Ketik minimal 2 karakter untuk mencari...
              </p>
              <div className="search-shortcuts">
                <div><kbd><Command size={10} /></kbd> + <kbd>K</kbd> — Buka pencarian</div>
                <div><kbd>↑</kbd> <kbd>↓</kbd> — Navigasi</div>
                <div><kbd><CornerDownLeft size={10} /></kbd> — Pilih</div>
                <div><kbd>ESC</kbd> — Tutup</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
