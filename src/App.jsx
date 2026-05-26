import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import AboutSection from './components/sections/AboutSection';
import ExplodedViewSection from './components/sections/ExplodedViewSection';
import FeaturesSection from './components/sections/FeaturesSection';
import IoTMonitoringSection from './components/sections/IoTMonitoringSection';
import SensorAnalyticsSection from './components/sections/SensorAnalyticsSection';
import EnergyStatsSection from './components/sections/EnergyStatsSection';
import DashboardPreview from './components/sections/DashboardPreview';
import CTASection from './components/sections/CTASection';
import Loader from './components/ui/Loader';

export default function App() {
  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      <Loader />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ExplodedViewSection />
        <FeaturesSection />
        <IoTMonitoringSection />
        <SensorAnalyticsSection />
        <EnergyStatsSection />
        <DashboardPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
