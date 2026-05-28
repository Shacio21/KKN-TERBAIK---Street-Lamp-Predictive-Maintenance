import { motion } from 'framer-motion';
import { Leaf, TreePine, DollarSign, BatteryCharging } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import AnimatedCounter from '../ui/AnimatedCounter';
import { energyComparison as fallbackEnergyComparison, energyStats as fallbackEnergyStats } from '../../data/mockData';

function CircularProgress({ value, max, color, size = 120, strokeWidth = 8, label, icon: Icon }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - (circumference * value) / max }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="heading-display text-lg" style={{ color }}>
            <AnimatedCounter target={value} duration={1.5} />
          </span>
        </div>
      </div>
      <span className="text-text-secondary text-xs mt-2 text-center">{label}</span>
    </div>
  );
}

function ComparisonBar({ label, before, after, max, unit }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-xs">{label}</span>
        <span className="text-text-muted text-[10px]">{unit}</span>
      </div>
      <div className="space-y-2">
        {/* Before */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted w-16">Traditional</span>
          <div className="flex-1 h-3 rounded-full bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'rgba(239,68,68,0.5)' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(before / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-text-muted w-10 text-right">{before}</span>
        </div>
        {/* After */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neon-green w-16">Smart Solar</span>
          <div className="flex-1 h-3 rounded-full bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00FF88, #00D4FF)' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(after / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <span className="text-[10px] text-neon-green w-10 text-right">{after}</span>
        </div>
      </div>
    </div>
  );
}

export default function EnergyStatsSection({ energyStats = fallbackEnergyStats, energyComparison = fallbackEnergyComparison }) {
  return (
    <section className="relative section-padding bg-bg-primary overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.4) 0%, transparent 70%)' }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-green text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            Energy Efficiency
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#00FF88" to="#00D4FF">
              Sustainable Performance
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            Track energy generation, consumption, and environmental impact in real-time.
            Every watt optimized, every emission eliminated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circular progress stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-6 md:p-8">
              <h3 className="heading-section text-lg text-text-primary mb-8">
                Daily Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CircularProgress
                  value={energyStats.dailyGenerated}
                  max={600}
                  color="#F59E0B"
                  label="Generated (Wh)"
                  icon={BatteryCharging}
                />
                <CircularProgress
                  value={energyStats.dailyConsumed}
                  max={600}
                  color="#00D4FF"
                  label="Consumed (Wh)"
                  icon={DollarSign}
                />
                <CircularProgress
                  value={energyStats.co2Saved}
                  max={20}
                  color="#00FF88"
                  label="CO₂ Saved (kg)"
                  icon={Leaf}
                />
                <CircularProgress
                  value={energyStats.treesEquivalent}
                  max={15}
                  color="#8B5CF6"
                  label="Trees Equiv."
                  icon={TreePine}
                />
              </div>

              {/* Big stat */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <div className="heading-display text-4xl md:text-5xl text-neon-green mb-2">
                  <AnimatedCounter target={energyStats.efficiency} suffix="%" duration={2} />
                </div>
                <span className="text-text-secondary text-sm">System Efficiency Rating</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Comparison bars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-6 md:p-8 h-full">
              <h3 className="heading-section text-lg text-text-primary mb-8">
                Impact Comparison
              </h3>

              <ComparisonBar
                label="Monthly Cost"
                before={energyComparison.before.cost}
                after={energyComparison.after.cost}
                max={energyComparison.before.cost}
                unit={energyComparison.currency || 'USD'}
              />
              <ComparisonBar
                label="Energy Consumption"
                before={energyComparison.before.energy}
                after={energyComparison.after.energy}
                max={energyComparison.before.energy}
                unit="kWh"
              />
              <ComparisonBar
                label="CO₂ Emissions"
                before={energyComparison.before.co2}
                after={energyComparison.after.co2}
                max={energyComparison.before.co2}
                unit="kg/mo"
              />

              {/* Savings highlight */}
              <div className="mt-8 p-4 rounded-xl neon-border-green text-center">
                <span className="text-text-secondary text-xs block mb-1">Total Cost Savings</span>
                <div className="heading-display text-3xl text-neon-green">
                  <AnimatedCounter target={energyStats.costSaving} suffix="%" duration={2} />
                </div>
                <span className="text-text-muted text-[10px]">vs traditional street lamps</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
