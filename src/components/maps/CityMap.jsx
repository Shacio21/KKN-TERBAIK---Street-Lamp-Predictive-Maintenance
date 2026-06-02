import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  healthy: '#00FF88',
  warning: '#F59E0B',
  critical: '#EF4444',
};

const sectorBounds = {
  A: { x: 20, y: 20, w: 280, h: 170 },
  B: { x: 320, y: 20, w: 280, h: 170 },
  C: { x: 620, y: 20, w: 280, h: 170 },
  D: { x: 20, y: 210, w: 280, h: 170 },
  E: { x: 320, y: 210, w: 280, h: 170 },
  F: { x: 620, y: 210, w: 280, h: 170 },
};

function clusterLamps(lampsInSector, threshold = 18) {
  const clusters = [];
  const used = new Set();

  lampsInSector.forEach((lamp, i) => {
    if (used.has(i)) return;
    const cluster = [lamp];
    used.add(i);

    lampsInSector.forEach((other, j) => {
      if (i === j || used.has(j)) return;
      const dx = lamp._x - other._x;
      const dy = lamp._y - other._y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        cluster.push(other);
        used.add(j);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

export default function CityMap({ lamps, onLampClick }) {
  const [hoveredLamp, setHoveredLamp] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Position lamps within sector bounds
  const positionedLamps = useMemo(() => {
    return lamps.slice(0, 120).map((lamp, i) => {
      const sector = sectorBounds[lamp.sector] || sectorBounds.A;
      const cols = 8;
      const idx = Math.floor(i / 6) % (cols);
      const row = Math.floor(i / 48);
      return {
        ...lamp,
        _x: sector.x + 25 + (idx * (sector.w - 50) / (cols - 1)) + (Math.random() - 0.5) * 8,
        _y: sector.y + 30 + (row * 30) + (Math.random() - 0.5) * 8 + ((i % 6) * 20),
      };
    });
  }, [lamps]);

  // Cluster lamps per sector
  const clusteredBySector = useMemo(() => {
    const result = [];
    Object.keys(sectorBounds).forEach((sector) => {
      const sectorLamps = positionedLamps.filter((l) => l.sector === sector);
      const clusters = clusterLamps(sectorLamps, 14);
      clusters.forEach((cluster) => {
        if (cluster.length === 1) {
          result.push({ type: 'single', lamp: cluster[0] });
        } else {
          const cx = cluster.reduce((s, l) => s + l._x, 0) / cluster.length;
          const cy = cluster.reduce((s, l) => s + l._y, 0) / cluster.length;
          const hasCritical = cluster.some((l) => l.status === 'critical');
          const hasWarning = cluster.some((l) => l.status === 'warning');
          result.push({
            type: 'cluster',
            x: cx,
            y: cy,
            count: cluster.length,
            status: hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy',
            lamps: cluster,
          });
        }
      });
    });
    return result;
  }, [positionedLamps]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { healthy: 0, warning: 0, critical: 0 };
    lamps.forEach((l) => { if (counts[l.status] !== undefined) counts[l.status]++; });
    return counts;
  }, [lamps]);

  return (
    <div className="glass-card border border-border overflow-hidden">
      {/* Legend */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[status], boxShadow: `0 0 6px ${statusColors[status]}60` }} />
              <span className="text-[11px] text-text-muted capitalize">{status}</span>
              <span className="text-[11px] font-bold text-text-secondary">({count})</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Smart City Grid</span>
      </div>

      {/* Map SVG */}
      <div className="relative bg-bg-primary/50 overflow-hidden">
        <svg
          viewBox="0 0 920 400"
          className="w-full h-auto"
          style={{ minHeight: 300 }}
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="920" height="400" fill="url(#grid)" />

          {/* Sector boundaries */}
          {Object.entries(sectorBounds).map(([sector, { x, y, w, h }]) => (
            <g key={sector}>
              <rect
                x={x} y={y} width={w} height={h}
                fill="rgba(255,255,255,0.01)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                rx="8"
              />
              <text
                x={x + 12} y={y + 18}
                fill="rgba(0,212,255,0.4)"
                fontSize="11"
                fontWeight="700"
                fontFamily="Orbitron, monospace"
              >
                SECTOR {sector}
              </text>
              {/* Sector roads */}
              <line x1={x + w * 0.5} y1={y + 25} x2={x + w * 0.5} y2={y + h - 5} stroke="rgba(255,255,255,0.04)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1={x + 10} y1={y + h * 0.5} x2={x + w - 10} y2={y + h * 0.5} stroke="rgba(255,255,255,0.04)" strokeWidth="2" strokeDasharray="4 4" />
            </g>
          ))}

          {/* Lamp markers */}
          {clusteredBySector.map((item, i) => {
            if (item.type === 'single') {
              const l = item.lamp;
              const color = statusColors[l.status];
              return (
                <g
                  key={`lamp-${l.id}`}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredLamp(l);
                    const rect = e.currentTarget.closest('svg').getBoundingClientRect();
                    const svgX = (l._x / 920) * rect.width;
                    const svgY = (l._y / 400) * rect.height;
                    setTooltipPos({ x: svgX, y: svgY });
                  }}
                  onMouseLeave={() => setHoveredLamp(null)}
                  onClick={() => onLampClick?.(l)}
                >
                  {/* Glow */}
                  <circle cx={l._x} cy={l._y} r="8" fill={color} opacity="0.08" />
                  {/* Dot */}
                  <circle cx={l._x} cy={l._y} r="4" fill={color} opacity="0.9" />
                  {/* Critical pulse */}
                  {l.status === 'critical' && (
                    <circle cx={l._x} cy={l._y} r="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" from="4" to="14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            }

            // Cluster
            const color = statusColors[item.status];
            return (
              <g key={`cluster-${i}`} className="cursor-pointer">
                <circle cx={item.x} cy={item.y} r="14" fill={color} opacity="0.15" />
                <circle cx={item.x} cy={item.y} r="10" fill={color} opacity="0.25" stroke={color} strokeWidth="1" />
                <text x={item.x} y={item.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
                  {item.count}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredLamp && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute pointer-events-none z-10 glass-strong px-3 py-2 rounded-xl text-xs border border-border shadow-lg"
              style={{
                left: Math.min(tooltipPos.x, window.innerWidth - 200),
                top: tooltipPos.y - 80,
              }}
            >
              <p className="font-bold text-text-primary font-[family-name:var(--font-display)] text-[11px]">
                Lamp {hoveredLamp.id}
              </p>
              <p className="text-text-muted mt-0.5">{hoveredLamp.location}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[hoveredLamp.status] }} />
                  <span className="capitalize" style={{ color: statusColors[hoveredLamp.status] }}>{hoveredLamp.status}</span>
                </span>
                <span className="text-text-muted">Battery: <span className="text-text-primary font-semibold">{hoveredLamp.batteryHealth}%</span></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
