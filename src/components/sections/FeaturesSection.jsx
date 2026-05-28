import { motion } from 'framer-motion';
import { Wifi, Sun, Eye, Smartphone, Clock, CloudRain } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientText from '../ui/GradientText';
import { featuresData } from '../../data/mockData';

const iconMap = { Wifi, Sun, Eye, Smartphone, Clock, CloudRain };

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
    <section id="features" className="relative section-padding bg-gradient-section overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-neon-green text-xs font-semibold tracking-[0.3em] uppercase mb-4 block font-[family-name:var(--font-display)]">
            Features
          </span>
          <h2 className="heading-section text-3xl md:text-5xl mb-6">
            <GradientText from="#E2E8F0" to="#00FF88">
              Intelligent by Design
            </GradientText>
          </h2>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed">
            Every lamp is engineered with cutting-edge features that make urban lighting smarter, 
            greener, and more efficient than ever before.
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
            return (
              <motion.div key={feature.id} variants={cardVariants}>
                <GlassCard className="group p-6 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.05))',
                      border: '1px solid rgba(0,212,255,0.15)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-neon-blue transition-all duration-500 group-hover:text-neon-green" />
                  </div>

                  {/* Text */}
                  <h3 className="heading-section text-lg text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover accent line */}
                  <div className="mt-4 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00D4FF, #00FF88)',
                    }}
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
