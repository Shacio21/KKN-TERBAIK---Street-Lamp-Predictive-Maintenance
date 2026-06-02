import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePredictiveData from '../../hooks/usePredictiveData';
import KPIGrid from '../../components/dashboard/KPIGrid';
import SectionHeader from '../../components/dashboard/SectionHeader';
import CityMap from '../../components/maps/CityMap';
import PredictionCard from '../../components/predictive/PredictionCard';
import AIInsightsPanel from '../../components/predictive/AIInsightsPanel';
import AlertFeed from '../../components/alerts/AlertFeed';
import LampDetailModal from '../../components/dashboard/LampDetailModal';

export default function PMOverview() {
  const { kpi, predictions, aiInsights, alerts, resolveAlert, lamps, lampDetail } = usePredictiveData();
  const [selectedLamp, setSelectedLamp] = useState(null);

  const topPredictions = predictions
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3);

  const quickLinks = [
    { label: 'All Assets', to: '/dashboard/pm/assets', color: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10' },
    { label: 'Predictions', to: '/dashboard/pm/predictions', color: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 hover:bg-neon-purple/10' },
    { label: 'Monitoring', to: '/dashboard/pm/monitoring', color: 'text-neon-green border-neon-green/20 bg-neon-green/5 hover:bg-neon-green/10' },
    { label: 'Analytics', to: '/dashboard/pm/analytics', color: 'text-neon-amber border-neon-amber/20 bg-neon-amber/5 hover:bg-neon-amber/10' },
    { label: 'Alerts', to: '/dashboard/pm/alerts', color: 'text-neon-red border-neon-red/20 bg-neon-red/5 hover:bg-neon-red/10' },
    { label: 'Settings', to: '/dashboard/pm/settings', color: 'text-text-secondary border-border bg-surface hover:bg-surface-hover' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)] tracking-wide">
          Predictive Maintenance <span className="text-gradient-blue">Dashboard</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Smart City Operations Center — AI-powered lamp monitoring and failure prediction
        </p>
      </motion.div>

      {/* KPI Cards */}
      <KPIGrid kpi={kpi} />

      {/* City Map */}
      <div>
        <SectionHeader
          icon={LayoutDashboard}
          title="Smart City Map"
          subtitle="Real-time lamp status across all sectors"
          color="blue"
          action={
            <Link to="/dashboard/pm/assets" className="flex items-center gap-1 text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">
              View all assets <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />
        <CityMap lamps={lamps} onLampClick={setSelectedLamp} />
      </div>

      {/* Predictions + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader
            icon={LayoutDashboard}
            title="Critical Predictions"
            subtitle="Top failure risks requiring immediate attention"
            color="red"
            action={
              <Link to="/dashboard/pm/predictions" className="flex items-center gap-1 text-xs text-neon-red hover:text-neon-red/80 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPredictions.map((pred, i) => (
              <PredictionCard key={pred.id} prediction={pred} delay={i * 0.08} />
            ))}
          </div>
        </div>

        <div>
          <AIInsightsPanel insights={aiInsights.slice(0, 5)} />
        </div>
      </div>

      {/* Alerts + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader
            icon={LayoutDashboard}
            title="Recent Alerts"
            subtitle="Latest system notifications"
            color="amber"
            action={
              <Link to="/dashboard/pm/alerts" className="flex items-center gap-1 text-xs text-neon-amber hover:text-neon-amber/80 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <AlertFeed alerts={alerts} onResolve={resolveAlert} maxItems={5} showFilter={false} />
        </div>

        <div>
          <SectionHeader icon={LayoutDashboard} title="Quick Navigation" color="purple" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${link.color}`}
              >
                {link.label}
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Lamp Detail Modal */}
      {selectedLamp && (
        <LampDetailModal
          lamp={selectedLamp}
          lampDetail={lampDetail}
          onClose={() => setSelectedLamp(null)}
        />
      )}
    </div>
  );
}
