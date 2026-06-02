import { motion } from 'framer-motion';
import { BarChart3, Zap, Battery, AlertTriangle, DollarSign } from 'lucide-react';
import usePredictiveData from '../../hooks/usePredictiveData';
import SectionHeader from '../../components/dashboard/SectionHeader';
import EnergyProductionChart from '../../components/charts/EnergyProductionChart';
import BatteryHealthChart from '../../components/charts/BatteryHealthChart';
import FailurePredictionChart from '../../components/charts/FailurePredictionChart';
import MaintenanceCostChart from '../../components/charts/MaintenanceCostChart';

export default function PMAnalytics() {
  const { chartData, kpi } = usePredictiveData();

  const summaryCards = [
    { label: 'Total Energy Generated', value: '48,250', unit: 'kWh', change: '+5.7%', color: 'text-neon-green', icon: Zap },
    { label: 'Avg Battery Health', value: '78.4', unit: '%', change: '+2.1%', color: 'text-neon-blue', icon: Battery },
    { label: 'Predicted Failures', value: '53', unit: 'this month', change: '-12%', color: 'text-neon-amber', icon: AlertTriangle },
    { label: 'Maintenance Savings', value: '$12,450', unit: 'this month', change: '+18%', color: 'text-neon-purple', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          System <span className="text-gradient-blue">Analytics</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Energy performance, battery trends, and maintenance cost analysis</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-muted">{card.unit}</span>
              <span className={`text-xs font-semibold ${card.change.startsWith('+') ? 'text-neon-green' : 'text-neon-red'}`}>
                {card.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader icon={Zap} title="Energy Production Trend" subtitle="Generated vs consumed — last 30 days" color="green" />
          <div className="glass-card p-5 border border-border">
            <EnergyProductionChart data={chartData.energyProduction} />
          </div>
        </div>

        <div>
          <SectionHeader icon={Battery} title="Battery Health Trend" subtitle="Average, min, and max across all lamps" color="blue" />
          <div className="glass-card p-5 border border-border">
            <BatteryHealthChart data={chartData.batteryHealth} />
          </div>
        </div>

        <div>
          <SectionHeader icon={AlertTriangle} title="Failure Predictions" subtitle="Predicted failures by component category" color="amber" />
          <div className="glass-card p-5 border border-border">
            <FailurePredictionChart data={chartData.failurePrediction} />
          </div>
        </div>

        <div>
          <SectionHeader icon={DollarSign} title="Maintenance Cost Trend" subtitle="Period cost and cumulative spending" color="purple" />
          <div className="glass-card p-5 border border-border">
            <MaintenanceCostChart data={chartData.maintenanceCost} />
          </div>
        </div>
      </div>
    </div>
  );
}
