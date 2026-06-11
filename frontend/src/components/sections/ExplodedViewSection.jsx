import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Scene from '../three/Scene';
import StreetLampModel from '../three/StreetLampModel';

export default function ExplodedViewSection() {
  const [isExploded, setIsExploded] = useState(false);
  const sectionRef = useRef(null);

  // Melacak scroll khusus di dalam section ini
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Jika user men-scroll lebih dari 20% area section, picu efek pecah
    if (latest > 0.2 && !isExploded) setIsExploded(true);
    if (latest <= 0.2 && isExploded) setIsExploded(false);
  });

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative bg-white"
      style={{ height: '200vh' }} // Cukup panjang agar efeknya terasa, tapi tidak melelahkan
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* Judul yang hanya muncul saat model pecah */}
        <div className={`absolute top-12 text-center transition-opacity duration-700 z-20 pointer-events-none ${isExploded ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="heading-section text-2xl md:text-4xl text-[#0F172A]">
            Component <span className="text-[#2563EB]">Breakdown</span>
          </h2>
        </div>

        {/* Full-width 3D Scene */}
        <div className="absolute inset-0 w-full h-full z-10">
          <Scene>
            <StreetLampModel
              isExploded={isExploded}
              rotate={!isExploded}
              floatEffect={!isExploded}
            />
          </Scene>
        </div>
      </div>
    </section>
  );
}