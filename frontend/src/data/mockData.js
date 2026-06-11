// ─── Hero Section ───────────────────────────────────────────────
export const heroData = {
  headline: "Street Lamp Predictive Maintenance",
  subheadline: "Monitoring and Predictive Maintenance System for Solar Street Lamps",
  ctaText: "Learn More",
  scrollIndicator: "Scroll to Discover",
};

// ─── About / Stats ──────────────────────────────────────────────
export const statsData = [
  { id: 1, value: 12500, suffix: "+", label: "Lamps Monitored", icon: "Lightbulb" },
  { id: 2, value: 98.7, suffix: "%", label: "System Uptime", icon: "Activity" },
  { id: 3, value: 45, suffix: "%", label: "Energy Saved", icon: "Zap" },
  { id: 4, value: 200, suffix: "+", label: "Villages Served", icon: "Globe" },
];

export const aboutText = {
  title: "About This Project",
  description:
    "This KKN (Kuliah Kerja Nyata) community service project focuses on monitoring and predictive maintenance of solar-powered street lamps in village areas. By combining IoT sensors with data analytics, we help local governments maintain public lighting infrastructure efficiently, reduce maintenance costs, and improve street lighting reliability for the community.",
};

// ─── Exploded View Component Data ───────────────────────────────
export const explodedComponents = [
  {
    id: "lamp",
    name: "LED Lamp Head",
    description: "High-efficiency LED array with 180° beam angle. Supports adaptive dimming from 10% to 100% based on ambient light and motion detection.",
    specs: ["50W LED Array", "6500K Daylight", "180° Beam Angle", "50,000h Lifespan"],
    color: "#2563EB",
  },
  {
    id: "solar",
    name: "Monocrystalline Solar Panel",
    description: "Premium monocrystalline cells with anti-reflective coating. Captures maximum solar energy even in low-light conditions with 22% conversion efficiency.",
    specs: ["100W Peak Output", "22% Efficiency", "Anti-Reflective", "Self-Cleaning Nano Coat"],
    color: "#7C3AED",
  },
  {
    id: "battery",
    name: "LiFePO4 Battery Pack",
    description: "Long-cycle lithium iron phosphate battery with intelligent BMS. Provides 3-5 nights of autonomy on a full charge with smart power management.",
    specs: ["200Wh Capacity", "3000+ Cycles", "Smart BMS", "-20°C to 60°C"],
    color: "#10B981",
  },
  {
    id: "esp",
    name: "ESP32 IoT Controller",
    description: "Dual-core ESP32 microcontroller with WiFi and Bluetooth connectivity. Handles sensor data collection, telemetry transmission, and local control logic.",
    specs: ["Dual-Core 240MHz", "WiFi + BLE 5.0", "Sensor Hub", "OTA Updates"],
    color: "#F59E0B",
  },
];

// ─── Features ───────────────────────────────────────────────────
export const featuresData = [
  {
    id: 1,
    icon: "Wifi",
    title: "Street Lamp Monitoring",
    description: "Real-time monitoring of lamp status, brightness, and connectivity through a cloud-connected dashboard.",
  },
  {
    id: 2,
    icon: "Sun",
    title: "Solar Panel Performance",
    description: "Track solar energy generation, panel efficiency, and charging status to ensure optimal renewable energy usage.",
  },
  {
    id: 3,
    icon: "Eye",
    title: "Battery Health Monitoring",
    description: "Monitor battery charge levels, voltage, and health indicators to predict when replacements are needed.",
  },
  {
    id: 4,
    icon: "Smartphone",
    title: "Predictive Maintenance Alerts",
    description: "Receive early warnings about potential failures so maintenance can be scheduled before problems occur.",
  },
  {
    id: 5,
    icon: "Clock",
    title: "Maintenance Scheduling",
    description: "Plan and track routine inspections and repairs with automated scheduling based on lamp condition data.",
  },
  {
    id: 6,
    icon: "CloudRain",
    title: "Energy Efficiency Tracking",
    description: "Analyze energy consumption patterns and identify opportunities to reduce costs and improve efficiency.",
  },
];

// ─── IoT Monitoring Dashboard Data ──────────────────────────────
export const iotGauges = [
  { id: 1, label: "Battery Level", value: 87, unit: "%", color: "#10B981", max: 100 },
  { id: 2, label: "Solar Input", value: 42, unit: "W", color: "#F59E0B", max: 100 },
  { id: 3, label: "Power Output", value: 35, unit: "W", color: "#2563EB", max: 50 },
  { id: 4, label: "Temperature", value: 32, unit: "°C", color: "#EF4444", max: 60 },
];

export const connectionStatus = {
  wifi: { connected: true, signal: 92 },
  mqtt: { connected: true, latency: 45 },
  cloud: { connected: true, lastSync: "2s ago" },
};

// ─── Sensor Analytics ───────────────────────────────────────────
export const sensorTimeSeriesData = {
  labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
  lightSensor: [5, 3, 45, 890, 920, 350, 10],
  temperature: [22, 20, 24, 35, 38, 30, 24],
  motion: [2, 0, 15, 45, 60, 80, 35],
};

export const sensorCards = [
  { id: 1, label: "Light Intensity", value: 892, unit: "lux", change: "+12%", icon: "Sun", color: "#F59E0B" },
  { id: 2, label: "Ambient Temp", value: 32.4, unit: "°C", change: "-2.1°C", icon: "Thermometer", color: "#EF4444" },
  { id: 3, label: "Motion Events", value: 147, unit: "/hr", change: "+23%", icon: "Activity", color: "#7C3AED" },
  { id: 4, label: "Air Quality", value: 42, unit: "AQI", change: "Good", icon: "Wind", color: "#10B981" },
];

// ─── Energy Stats ───────────────────────────────────────────────
export const energyStats = {
  dailyGenerated: 480,
  dailyConsumed: 320,
  efficiency: 94.2,
  co2Saved: 12.5,
  treesEquivalent: 8,
  costSaving: 67,
};

export const energyComparison = {
  before: { label: "Traditional", cost: 450, energy: 800, co2: 35 },
  after: { label: "Smart Solar", cost: 45, energy: 320, co2: 0 },
};

// ─── Dashboard Preview ─────────────────────────────────────────
export const lampStatuses = [
  { id: "SL-001", location: "Jalan Utama Desa", status: "online", battery: 92, brightness: 80 },
  { id: "SL-002", location: "Taman Desa", status: "online", battery: 78, brightness: 60 },
  { id: "SL-003", location: "Jalan Raya B12", status: "online", battery: 95, brightness: 100 },
  { id: "SL-004", location: "Perumahan Blok C", status: "offline", battery: 15, brightness: 0 },
  { id: "SL-005", location: "Zona Industri", status: "online", battery: 88, brightness: 70 },
  { id: "SL-006", location: "Area Sekolah", status: "warning", battery: 34, brightness: 40 },
  { id: "SL-007", location: "Pusat Perdagangan", status: "online", battery: 96, brightness: 90 },
  { id: "SL-008", location: "Jembatan Sektor E", status: "online", battery: 81, brightness: 75 },
];

export const energyChartData = [
  { hour: "00", generated: 0, consumed: 35 },
  { hour: "02", generated: 0, consumed: 35 },
  { hour: "04", generated: 0, consumed: 30 },
  { hour: "06", generated: 15, consumed: 20 },
  { hour: "08", generated: 45, consumed: 5 },
  { hour: "10", generated: 78, consumed: 0 },
  { hour: "12", generated: 95, consumed: 0 },
  { hour: "14", generated: 88, consumed: 0 },
  { hour: "16", generated: 55, consumed: 0 },
  { hour: "18", generated: 20, consumed: 25 },
  { hour: "20", generated: 0, consumed: 40 },
  { hour: "22", generated: 0, consumed: 45 },
];

// ─── CTA Section ────────────────────────────────────────────────
export const ctaData = {
  headline: "Ready to Get Started?",
  subtext: "Access the monitoring dashboard to manage and maintain village street lamps efficiently.",
  primaryCTA: "Open Dashboard",
  secondaryCTA: "View Documentation",
};

// ─── Navigation ─────────────────────────────────────────────────
export const navLinks = [
  { id: "about", label: "About" },
  { id: "technology", label: "Technology" },
  { id: "features", label: "Features" },
  { id: "monitoring", label: "Monitoring" },
  { id: "dashboard", label: "Dashboard" },
];
