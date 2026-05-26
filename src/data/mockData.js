// ─── Hero Section ───────────────────────────────────────────────
export const heroData = {
  headline: "The Future of Smart Street Lighting",
  subheadline: "IoT-Powered Solar Street Lamp — Intelligent, Sustainable, Connected",
  ctaText: "Explore Technology",
  scrollIndicator: "Scroll to Discover",
};

// ─── About / Stats ──────────────────────────────────────────────
export const statsData = [
  { id: 1, value: 12500, suffix: "+", label: "Lamps Deployed", icon: "Lightbulb" },
  { id: 2, value: 98.7, suffix: "%", label: "Uptime Rate", icon: "Activity" },
  { id: 3, value: 45, suffix: "%", label: "Energy Saved", icon: "Zap" },
  { id: 4, value: 200, suffix: "+", label: "Cities Connected", icon: "Globe" },
];

export const aboutText = {
  title: "Redefining Urban Illumination",
  description:
    "Our Smart Solar Street Lamp combines cutting-edge IoT technology with sustainable solar energy to create an intelligent lighting ecosystem. Each lamp is a node in a connected network — sensing, adapting, and optimizing in real-time.",
};

// ─── Exploded View Component Data ───────────────────────────────
export const explodedComponents = [
  {
    id: "lamp",
    name: "LED Lamp Head",
    description: "High-efficiency LED array with 180° beam angle. Supports adaptive dimming from 10% to 100% based on ambient light and motion detection.",
    specs: ["50W LED Array", "6500K Daylight", "180° Beam Angle", "50,000h Lifespan"],
    color: "#00D4FF",
  },
  {
    id: "solar",
    name: "Monocrystalline Solar Panel",
    description: "Premium monocrystalline cells with anti-reflective coating. Captures maximum solar energy even in low-light conditions with 22% conversion efficiency.",
    specs: ["100W Peak Output", "22% Efficiency", "Anti-Reflective", "Self-Cleaning Nano Coat"],
    color: "#8B5CF6",
  },
  {
    id: "battery",
    name: "LiFePO4 Battery Pack",
    description: "Long-cycle lithium iron phosphate battery with intelligent BMS. Provides 3-5 nights of autonomy on a full charge with smart power management.",
    specs: ["200Wh Capacity", "3000+ Cycles", "Smart BMS", "-20°C to 60°C"],
    color: "#00FF88",
  },
  {
    id: "esp",
    name: "ESP32 IoT Controller",
    description: "Dual-core ESP32 microcontroller with WiFi and Bluetooth connectivity. Runs edge AI for predictive maintenance and real-time environmental monitoring.",
    specs: ["Dual-Core 240MHz", "WiFi + BLE 5.0", "Edge AI Ready", "OTA Updates"],
    color: "#F59E0B",
  },
];

// ─── Features ───────────────────────────────────────────────────
export const featuresData = [
  {
    id: 1,
    icon: "Wifi",
    title: "IoT Monitoring",
    description: "Real-time monitoring and control through cloud-connected dashboard with 24/7 uptime.",
  },
  {
    id: 2,
    icon: "Sun",
    title: "Solar Powered",
    description: "100% renewable energy with high-efficiency monocrystalline panels and smart charging.",
  },
  {
    id: 3,
    icon: "Eye",
    title: "Auto Dimming",
    description: "Intelligent brightness control based on ambient light sensors and motion detection.",
  },
  {
    id: 4,
    icon: "Smartphone",
    title: "Remote Control",
    description: "Full control from anywhere via mobile app or web dashboard with secure authentication.",
  },
  {
    id: 5,
    icon: "Clock",
    title: "Smart Scheduling",
    description: "Automated on/off scheduling with sunrise/sunset adaptation and holiday modes.",
  },
  {
    id: 6,
    icon: "CloudRain",
    title: "Weather Adaptive",
    description: "Real-time weather monitoring adjusts lamp behavior for optimal performance.",
  },
];

// ─── IoT Monitoring Dashboard Data ──────────────────────────────
export const iotGauges = [
  { id: 1, label: "Battery Level", value: 87, unit: "%", color: "#00FF88", max: 100 },
  { id: 2, label: "Solar Input", value: 42, unit: "W", color: "#F59E0B", max: 100 },
  { id: 3, label: "Power Output", value: 35, unit: "W", color: "#00D4FF", max: 50 },
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
  { id: 3, label: "Motion Events", value: 147, unit: "/hr", change: "+23%", icon: "Activity", color: "#8B5CF6" },
  { id: 4, label: "Air Quality", value: 42, unit: "AQI", change: "Good", icon: "Wind", color: "#00FF88" },
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
  { id: "SL-001", location: "Main Street A", status: "online", battery: 92, brightness: 80 },
  { id: "SL-002", location: "Park Avenue", status: "online", battery: 78, brightness: 60 },
  { id: "SL-003", location: "Highway B12", status: "online", battery: 95, brightness: 100 },
  { id: "SL-004", location: "Residential Block C", status: "offline", battery: 15, brightness: 0 },
  { id: "SL-005", location: "Industrial Zone", status: "online", battery: 88, brightness: 70 },
  { id: "SL-006", location: "School District", status: "warning", battery: 34, brightness: 40 },
  { id: "SL-007", location: "Commercial Hub", status: "online", battery: 96, brightness: 90 },
  { id: "SL-008", location: "Bridge Sector E", status: "online", battery: 81, brightness: 75 },
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
  headline: "Ready to Illuminate the Future?",
  subtext: "Join 200+ cities already using our Smart Solar Street Lamp ecosystem.",
  primaryCTA: "Request a Demo",
  secondaryCTA: "Download Whitepaper",
};

// ─── Navigation ─────────────────────────────────────────────────
export const navLinks = [
  { id: "about", label: "About" },
  { id: "technology", label: "Technology" },
  { id: "features", label: "Features" },
  { id: "monitoring", label: "Monitoring" },
  { id: "dashboard", label: "Dashboard" },
];
