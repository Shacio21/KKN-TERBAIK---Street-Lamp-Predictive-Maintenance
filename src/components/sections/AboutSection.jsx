import { motion } from 'framer-motion';
import { Lightbulb, Activity, Zap, Globe } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import GradientText from '../ui/GradientText';
import { statsData, aboutText } from '../../data/mockData';

const iconMap = { Lightbulb, Activity, Zap, Globe };

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
    <section id="about" className="relative section-padding bg-gradient-section overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-blue text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            About the Platform
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#E2E8F0" to="#00D4FF">
              {aboutText.title}
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed">
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
            return (
              <motion.div key={stat.id} variants={itemVariants}>
                <GlassCard glow className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.02))',
                      border: '1px solid rgba(0,212,255,0.15)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div className="heading-display text-3xl md:text-4xl text-text-primary mb-2">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  </div>
                  <p className="text-text-secondary text-sm tracking-wide">
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
