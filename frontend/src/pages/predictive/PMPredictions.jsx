import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Filter, ChevronDown, AlertTriangle, Clock, Shield } from 'lucide-react';
import usePredictiveData from '../../hooks/usePredictiveData';
import SectionHeader from '../../components/dashboard/SectionHeader';
import PredictionCard from '../../components/predictive/PredictionCard';
import FailurePredictionChart from '../../components/charts/FailurePredictionChart';
import MaintenanceTable from '../../components/tables/MaintenanceTable';

export default function PMPredictions() {
  const { predictions, chartData, maintenanceQueue } = usePredictiveData();
  const [riskFilter, setRiskFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const failureTypes = useMemo(() => {
    const types = new Set(predictions.map((p) => p.failureType));
    return ['all', ...types];
  }, [predictions]);

  const filtered = useMemo(() => {
    let result = [...predictions];
    if (riskFilter === 'critical') result = result.filter((p) => p.risk >= 80);
    else if (riskFilter === 'warning') result = result.filter((p) => p.risk >= 50 && p.risk < 80);
    else if (riskFilter === 'low') result = result.filter((p) => p.risk < 50);
    if (typeFilter !== 'all') result = result.filter((p) => p.failureType === typeFilter);
    return result.sort((a, b) => b.risk - a.risk);
  }, [predictions, riskFilter, typeFilter]);

  const stats = useMemo(() => ({
    critical: predictions.filter((p) => p.risk >= 80).length,
    warning: predictions.filter((p) => p.risk >= 50 && p.risk < 80).length,
    low: predictions.filter((p) => p.risk < 50).length,
    avgRisk: Math.round(predictions.reduce((s, p) => s + p.risk, 0) / predictions.length),
  }), [predictions]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          AI <span className="text-gradient-blue">Predictions</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Machine learning-powered failure prediction and maintenance scheduling</p>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Risk', value: stats.critical, color: 'text-neon-red', bg: 'bg-neon-red/10 border-neon-red/20', icon: AlertTriangle },
          { label: 'Warning Risk', value: stats.warning, color: 'text-neon-amber', bg: 'bg-neon-amber/10 border-neon-amber/20', icon: Shield },
          { label: 'Low Risk', value: stats.low, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20', icon: Clock },
          { label: 'Average Risk', value: `${stats.avgRisk}%`, color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20', icon: Brain },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card p-4 border ${s.bg} text-center`}
          >
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-surface rounded-xl">
          {['all', 'critical', 'warning', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all ${
                riskFilter === f ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/20' : 'text-text-muted hover:text-text-secondary border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-secondary hover:border-neon-blue/30 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
          </button>
          {showTypeFilter && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-1 left-0 z-20 glass-strong border border-border rounded-xl overflow-hidden py-1 min-w-[220px]">
              {failureTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setShowTypeFilter(false); }}
                  className={`block w-full text-left px-3 py-2 text-xs transition-colors ${typeFilter === t ? 'text-neon-blue bg-neon-blue/10' : 'text-text-secondary hover:bg-surface-hover'}`}
                >
                  {t === 'all' ? 'All Failure Types' : t}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <span className="text-[11px] text-text-muted">{filtered.length} predictions</span>
      </div>

      {/* Prediction Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((pred, i) => (
          <PredictionCard key={pred.id} prediction={pred} delay={i * 0.05} />
        ))}
      </div>

      {/* Failure Chart */}
      <div>
        <SectionHeader icon={Brain} title="Failure Distribution" subtitle="Predicted failures by component category" color="purple" />
        <div className="glass-card p-5 border border-border">
          <FailurePredictionChart data={chartData.failurePrediction} />
        </div>
      </div>

      {/* Maintenance Queue */}
      <div>
        <SectionHeader icon={Brain} title="Maintenance Priority Queue" subtitle="Prioritized maintenance schedule based on AI predictions" color="amber" />
        <MaintenanceTable data={maintenanceQueue} />
      </div>
    </div>
  );
}
