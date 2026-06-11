import { motion } from 'framer-motion';
import { Wifi, Sun, Eye, Smartphone, Clock, CloudRain } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { featuresData } from '../../data/mockData';

const iconMap = { Wifi, Sun, Eye, Smartphone, Clock, CloudRain };

const iconColors = {
  Wifi:       { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  Sun:        { bg: '#FFFBEB', color: '#F59E0B', border: '#FDE68A' },
  Eye:        { bg: '#F0FDF4', color: '#10B981', border: '#A7F3D0' },
  Smartphone: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  Clock:      { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
  CloudRain:  { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative section-padding bg-white overflow-hidden">
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
            Features
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6 text-[#0F172A]">
            Key Features
          </h2>
          <p className="text-[#475569] text-base md:text-lg leading-relaxed">
            Practical tools for monitoring, maintaining, and optimizing
            village street lighting infrastructure.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {featuresData.map((feature) => {
            const Icon = iconMap[feature.icon];
            const colors = iconColors[feature.icon] || iconColors.Wifi;
            return (
              <motion.div key={feature.id} variants={cardVariants}>
                <GlassCard className="group p-6 h-full">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: colors.color }} />
                  </div>

                  {/* Text */}
                  <h3 className="font-semibold text-lg text-[#0F172A] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover accent line */}
                  <div
                    className="mt-4 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full bg-[#2563EB]"
                  />
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
