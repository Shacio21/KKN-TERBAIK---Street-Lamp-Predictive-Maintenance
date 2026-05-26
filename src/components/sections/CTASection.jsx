import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import NeonButton from '../ui/NeonButton';
import GradientText from '../ui/GradientText';
import ParticleField from '../ui/ParticleField';
import { ctaData } from '../../data/mockData';

export default function CTASection() {
  return (
    <section className="relative section-padding overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-primary) 0%, #0a1628 50%, var(--color-bg-secondary) 100%)',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)' }}
      />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
      />

      {/* Particles */}
      <ParticleField count={30} color="#00FF88" />

      <div className="section-container relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border-green mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-green animate-[neon-pulse_2s_ease-in-out_infinite]" />
            <span className="text-xs font-medium text-text-secondary tracking-wider uppercase">
              Limited Pilot Program
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="heading-display text-3xl sm:text-4xl md:text-6xl mb-6">
            <GradientText from="#E2E8F0" to="#ffffff" className="block mb-2">
              {ctaData.headline.split('?')[0]}?
            </GradientText>
          </h2>

          <p className="text-text-secondary text-base md:text-xl mb-10 max-w-xl mx-auto">
            {ctaData.subtext}
          </p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <NeonButton variant="blue" size="lg">
              <span className="flex items-center gap-2">
                {ctaData.primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </span>
            </NeonButton>
            <NeonButton variant="green" size="lg">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {ctaData.secondaryCTA}
              </span>
            </NeonButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            {[
              'ISO 14001 Certified',
              'IEC 62717 Compliant',
              'CE Marked',
              'UL Listed',
            ].map((cert) => (
              <span key={cert} className="text-text-muted text-xs tracking-wider border border-border rounded-full px-4 py-1.5">
                {cert}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
