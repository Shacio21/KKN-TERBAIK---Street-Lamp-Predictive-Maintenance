// The original landing page content, moved here so App.jsx can use RouterProvider
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
import OperationsPanel from './components/sections/OperationsPanel';
import CTASection from './components/sections/CTASection';
import Loader from './components/ui/Loader';
import useDashboardData from './hooks/useDashboardData';

export default function LandingApp() {
  const dashboardData = useDashboardData();

  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      <Loader />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ExplodedViewSection />
        <FeaturesSection />
        <IoTMonitoringSection
          gauges={dashboardData.iotGauges}
          connection={dashboardData.connectionStatus}
          kpi={dashboardData.kpi}
          isLive={dashboardData.isLive}
        />
        <SensorAnalyticsSection
          sensorCards={dashboardData.sensorCards}
          sensorTimeSeriesData={dashboardData.sensorTimeSeriesData}
        />
        <EnergyStatsSection
          energyStats={dashboardData.energyStats}
          energyComparison={dashboardData.energyComparison}
        />
        <DashboardPreview
          lampStatuses={dashboardData.lampStatuses}
          energyChartData={dashboardData.energyChartData}
          kpi={dashboardData.kpi}
          isLive={dashboardData.isLive}
        />
        <OperationsPanel />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
