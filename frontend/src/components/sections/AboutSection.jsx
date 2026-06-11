import { motion } from 'framer-motion';
import { Lightbulb, Activity, Zap, Globe } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import { statsData, aboutText } from '../../data/mockData';

const iconMap = { Lightbulb, Activity, Zap, Globe };

const iconColors = {
  Lightbulb: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  Activity:  { bg: '#F0FDF4', color: '#10B981', border: '#A7F3D0' },
  Zap:       { bg: '#FFFBEB', color: '#F59E0B', border: '#FDE68A' },
  Globe:     { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AboutSection() {
  return (
    <section id="about" className="relative section-padding bg-[#F8FAFC] overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#2563EB] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            About the Project
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6 text-[#0F172A]">
            {aboutText.title}
          </h2>
          <p className="text-[#475569] text-base md:text-lg leading-relaxed">
            {aboutText.description}
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {statsData.map((stat) => {
            const Icon = iconMap[stat.icon];
            const colors = iconColors[stat.icon] || iconColors.Lightbulb;
            return (
              <motion.div key={stat.id} variants={itemVariants}>
                <GlassCard className="text-center py-8">
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: colors.color }} />
                  </div>
                  <div className="heading-display text-3xl md:text-4xl text-[#0F172A] mb-2">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  </div>
                  <p className="text-[#64748B] text-sm tracking-wide">
                    {stat.label}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
