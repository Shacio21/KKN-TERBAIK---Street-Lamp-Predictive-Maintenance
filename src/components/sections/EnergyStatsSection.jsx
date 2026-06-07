import { motion } from 'framer-motion';
import { Leaf, TreePine, DollarSign, BatteryCharging } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import { energyStats, energyComparison } from '../../data/mockData';

function CircularProgress({ value, max, color, size = 120, strokeWidth = 8, label, icon: Icon }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth}
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
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="heading-display text-lg" style={{ color }}>
            <AnimatedCounter target={value} duration={1.5} />
          </span>
        </div>
      </div>
      <span className="text-[#475569] text-xs mt-2 text-center">{label}</span>
    </div>
  );
}

function ComparisonBar({ label, before, after, max, unit }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#475569] text-xs">{label}</span>
        <span className="text-[#94A3B8] text-[10px]">{unit}</span>
      </div>
      <div className="space-y-2">
        {/* Before */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#94A3B8] w-16">Traditional</span>
          <div className="flex-1 h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#FCA5A5]"
              initial={{ width: 0 }}
              whileInView={{ width: `${(before / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-[#94A3B8] w-10 text-right">{before}</span>
        </div>
        {/* After */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#10B981] w-16 font-medium">Smart Solar</span>
          <div className="flex-1 h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #10B981, #2563EB)' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(after / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <span className="text-[10px] text-[#10B981] w-10 text-right font-medium">{after}</span>
        </div>
      </div>
    </div>
  );
}

export default function EnergyStatsSection() {
  return (
    <section className="relative section-padding bg-white overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#10B981] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            Energy Efficiency
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6 text-[#0F172A]">
            Energy Efficiency Report
          </h2>
          <p className="text-[#475569] text-base md:text-lg">
            Track energy generation, consumption, and environmental impact.
            Every watt optimized, every emission reduced.
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
              <h3 className="font-semibold text-lg text-[#0F172A] mb-8">
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
                  color="#2563EB"
                  label="Consumed (Wh)"
                  icon={DollarSign}
                />
                <CircularProgress
                  value={energyStats.co2Saved}
                  max={20}
                  color="#10B981"
                  label="CO₂ Saved (kg)"
                  icon={Leaf}
                />
                <CircularProgress
                  value={energyStats.treesEquivalent}
                  max={15}
                  color="#7C3AED"
                  label="Trees Equiv."
                  icon={TreePine}
                />
              </div>

              {/* Big stat */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
                <div className="heading-display text-4xl md:text-5xl text-[#10B981] mb-2">
                  <AnimatedCounter target={energyStats.efficiency} suffix="%" duration={2} />
                </div>
                <span className="text-[#475569] text-sm">System Efficiency Rating</span>
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
              <h3 className="font-semibold text-lg text-[#0F172A] mb-8">
                Impact Comparison
              </h3>

              <ComparisonBar
                label="Monthly Cost"
                before={energyComparison.before.cost}
                after={energyComparison.after.cost}
                max={energyComparison.before.cost}
                unit="USD"
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
              <div className="mt-8 p-4 rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] text-center">
                <span className="text-[#475569] text-xs block mb-1">Total Cost Savings</span>
                <div className="heading-display text-3xl text-[#10B981]">
                  <AnimatedCounter target={energyStats.costSaving} suffix="%" duration={2} />
                </div>
                <span className="text-[#94A3B8] text-[10px]">vs traditional street lamps</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
