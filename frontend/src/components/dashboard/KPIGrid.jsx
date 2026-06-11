import { Lightbulb, Power, Wrench, AlertTriangle, Battery, Zap } from 'lucide-react';
import KPICard from './KPICard';

export default function KPIGrid({ kpi }) {
  const cards = [
    { label: 'Total Street Lamps', value: kpi.totalLamps, icon: Lightbulb, color: 'blue', trend: kpi.trends.totalLamps },
    { label: 'Active Lamps', value: kpi.activeLamps, icon: Power, color: 'green', trend: kpi.trends.activeLamps },
    { label: 'Maintenance Required', value: kpi.maintenanceRequired, icon: Wrench, color: 'amber', trend: kpi.trends.maintenanceRequired },
    { label: 'Critical Alerts', value: kpi.criticalAlerts, icon: AlertTriangle, color: 'red', trend: kpi.trends.criticalAlerts },
    { label: 'Avg Battery Health', value: kpi.avgBatteryHealth, unit: '%', icon: Battery, color: 'purple', trend: kpi.trends.avgBatteryHealth },
    { label: 'Energy Generated Today', value: kpi.energyGeneratedToday, unit: 'kWh', icon: Zap, color: 'green', trend: kpi.trends.energyGeneratedToday },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <KPICard key={card.label} {...card} delay={i * 0.06} />
      ))}
    </div>
  );
}
