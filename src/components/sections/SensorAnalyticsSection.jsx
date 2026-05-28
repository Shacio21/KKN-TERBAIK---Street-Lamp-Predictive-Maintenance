import { motion } from 'framer-motion';
import { Sun, Thermometer, Activity, Wind } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { sensorCards as fallbackSensorCards, sensorTimeSeriesData as fallbackSensorTimeSeriesData } from '../../data/mockData';

const iconMap = { Sun, Thermometer, Activity, Wind };

function MiniLineChart({ data, color, height = 60 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = height;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-line"
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
      {/* Data dots */}
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={color}
            opacity="0.8"
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        );
      })}
    </svg>
  );
}

function SensorCard({ label, value, unit, change, icon, color }) {
  const Icon = iconMap[icon];
  const isPositive = change.startsWith('+') || change === 'Good' || change === 'Live';

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `${color}15`,
              border: `1px solid ${color}25`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-text-secondary text-xs font-medium">{label}</span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: isPositive ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)',
            color: isPositive ? '#00FF88' : '#EF4444',
          }}
        >
          {change}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="heading-display text-2xl" style={{ color }}>{value}</span>
        <span className="text-text-muted text-xs">{unit}</span>
      </div>
    </GlassCard>
  );
}

export default function SensorAnalyticsSection({ sensorCards = fallbackSensorCards, sensorTimeSeriesData = fallbackSensorTimeSeriesData }) {
  return (
    <section className="relative section-padding bg-gradient-section overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-purple text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]"
            style={{ color: '#8B5CF6' }}>
            Sensor Analytics
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#8B5CF6" to="#00D4FF">
              Environmental Intelligence
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg">
            Multi-sensor fusion provides comprehensive environmental data,
            enabling predictive maintenance and adaptive lighting control.
          </p>
        </motion.div>

        {/* Sensor cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {sensorCards.map((card) => (
            <SensorCard key={card.id} {...card} />
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { title: 'Light Intensity (24h)', data: sensorTimeSeriesData.lightSensor, color: '#F59E0B', unit: 'lux' },
            { title: 'Temperature (24h)', data: sensorTimeSeriesData.temperature, color: '#EF4444', unit: '°C' },
            { title: 'Motion Events (24h)', data: sensorTimeSeriesData.motion, color: '#8B5CF6', unit: 'events' },
          ].map((chart, i) => (
            <motion.div
              key={chart.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-text-primary text-sm font-medium">{chart.title}</h4>
                  <span className="text-text-muted text-[10px]">{chart.unit}</span>
                </div>
                <MiniLineChart data={chart.data} color={chart.color} height={80} />
                <div className="flex justify-between mt-2">
                  {sensorTimeSeriesData.labels.map((label, idx) => (
                    <span key={idx} className="text-text-muted text-[9px]">{label}</span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
