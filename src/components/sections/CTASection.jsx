import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import NeonButton from '../ui/NeonButton';
import { ctaData } from '../../data/mockData';

export default function CTASection() {
  return (
    <section className="relative section-padding overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 30%, #E0E7FF 60%, #EFF6FF 100%)',
        }}
      />

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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
            style={{ background: '#F0FDF4', borderColor: '#A7F3D0', color: '#10B981' }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              KKN Community Service
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl mb-6 text-[#0F172A]">
            {ctaData.headline}
          </h2>

          <p className="text-[#475569] text-base md:text-lg mb-10 max-w-xl mx-auto">
            {ctaData.subtext}
          </p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
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
            <NeonButton variant="outline" size="lg">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {ctaData.secondaryCTA}
              </span>
            </NeonButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            {[
              'Proyek KKN',
              'Desa Digital',
              'Energi Terbarukan',
              'Smart Village',
            ].map((cert) => (
              <span key={cert} className="text-[#475569] text-xs font-medium tracking-wide border border-[#CBD5E1] rounded-full px-4 py-1.5 bg-white/80">
                {cert}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
