import { motion } from 'framer-motion';
import { Battery, Sun, Lightbulb, Cpu, TrendingUp, TrendingDown } from 'lucide-react';
import CircularProgress from '../dashboard/CircularProgress';

const assetIcons = {
  battery: { icon: Battery, label: 'Battery Health', color: '#00FF88' },
  solarPanel: { icon: Sun, label: 'Solar Panel', color: '#F59E0B' },
  led: { icon: Lightbulb, label: 'LED Health', color: '#8B5CF6' },
  esp32: { icon: Cpu, label: 'ESP32 Controller', color: '#00D4FF' },
};

export default function AssetHealthPanel({ assetHealth }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(assetHealth).map(([key, data], i) => {
        const asset = assetIcons[key];
        if (!asset) return null;
        const Icon = asset.icon;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass-card p-5 border border-border text-center group hover:border-border-hover transition-colors"
          >
            <CircularProgress
              value={data.score}
              size={90}
              strokeWidth={7}
              color={asset.color}
            />

            <div className="mt-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: asset.color }} />
                <h4 className="text-xs font-semibold text-text-primary">{asset.label}</h4>
              </div>

              <div className="flex items-center justify-center gap-1 text-[11px]">
                {data.trend >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-neon-green" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-neon-red" />
                )}
                <span className={data.trend >= 0 ? 'text-neon-green' : 'text-neon-red'}>
                  {data.trend > 0 ? '+' : ''}{data.trend}%
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/50">
              <div className="text-center">
                <p className="text-[10px] font-bold text-neon-green">{data.healthy}</p>
                <p className="text-[9px] text-text-muted">OK</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-neon-amber">{data.warning}</p>
                <p className="text-[9px] text-text-muted">Warn</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-neon-red">{data.critical}</p>
                <p className="text-[9px] text-text-muted">Crit</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
