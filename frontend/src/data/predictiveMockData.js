// ─── Predictive Maintenance Mock Data ──────────────────────────────
// Comprehensive dataset for the PM Admin Dashboard

// ─── Street Lamp Records ───────────────────────────────────────────
const sectors = ['A', 'B', 'C', 'D', 'E', 'F'];
const streets = [
  'Main Street', 'Park Avenue', 'Industrial Boulevard', 'Highway Connector',
  'Residential Lane', 'Commercial Drive', 'School Road', 'Bridge Sector',
  'Downtown Plaza', 'Harbor View', 'Tech Park', 'University Drive',
  'Garden Path', 'Market Square', 'Station Road', 'Lake Avenue',
];

const statuses = ['healthy', 'warning', 'critical'];
const failureTypes = [
  'Battery Degradation',
  'Solar Panel Efficiency Drop',
  'LED Driver Overheating',
  'ESP32 Controller Fault',
  'Wiring Corrosion',
  'Motion Sensor Malfunction',
  'Voltage Regulator Failure',
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split('T')[0];
}

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export const lamps = Array.from({ length: 248 }, (_, i) => {
  const sector = sectors[i % sectors.length];
  const num = String(i + 1).padStart(3, '0');
  const id = `${sector}-${num}`;
  const status = i < 180 ? 'healthy' : i < 220 ? 'warning' : 'critical';
  const batteryHealth = status === 'healthy' ? randomBetween(70, 100) :
                        status === 'warning' ? randomBetween(40, 69) :
                        randomBetween(10, 39);
  const solarEff = status === 'healthy' ? randomBetween(80, 98) :
                   status === 'warning' ? randomBetween(50, 79) :
                   randomBetween(15, 49);

  return {
    id,
    lampId: `LAMP-${id}`,
    sector,
    location: `${streets[i % streets.length]} #${Math.floor(i / 16) + 1}`,
    status,
    lat: -6.2 + (Math.random() * 0.08 - 0.04),
    lng: 106.84 + (Math.random() * 0.08 - 0.04),
    batteryHealth: Math.round(batteryHealth),
    solarEfficiency: Math.round(solarEff),
    ledHealth: Math.round(status === 'critical' ? randomBetween(20, 60) : randomBetween(70, 100)),
    espHealth: Math.round(status === 'critical' ? randomBetween(30, 55) : randomBetween(75, 100)),
    installDate: randomDate(1200),
    lastMaintenance: randomDate(90),
    brightness: status === 'critical' ? randomBetween(0, 40) : randomBetween(60, 100),
    powerOutput: randomBetween(15, 50),
    temperature: randomBetween(25, 55),
    uptime: status === 'healthy' ? randomBetween(95, 99.9) : randomBetween(60, 94),
    gridX: (i % 16) * 6 + 3,
    gridY: Math.floor(i / 16) * 6 + 3,
  };
});

// ─── KPI Summary ───────────────────────────────────────────────────
export const kpiData = {
  totalLamps: 248,
  activeLamps: 231,
  maintenanceRequired: 42,
  criticalAlerts: 12,
  avgBatteryHealth: 78.4,
  energyGeneratedToday: 1842.5,
  trends: {
    totalLamps: 3.2,
    activeLamps: -1.5,
    maintenanceRequired: 8.4,
    criticalAlerts: -12.3,
    avgBatteryHealth: 2.1,
    energyGeneratedToday: 5.7,
  },
};

// ─── Predictive Maintenance Cards ──────────────────────────────────
export const predictions = [
  {
    id: 'pred-001',
    lampId: 'A-102',
    location: 'Main Street #7',
    failureType: 'Battery Degradation',
    risk: 87,
    estimatedDays: 12,
    recommendation: 'Schedule battery replacement within 2 weeks',
    severity: 'critical',
    confidence: 94,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'pred-002',
    lampId: 'B-087',
    location: 'Park Avenue #6',
    failureType: 'Solar Panel Efficiency Drop',
    risk: 72,
    estimatedDays: 18,
    recommendation: 'Inspect solar panel surface for debris or damage',
    severity: 'warning',
    confidence: 88,
    lastUpdated: '3 hours ago',
  },
  {
    id: 'pred-003',
    lampId: 'C-041',
    location: 'Industrial Boulevard #3',
    failureType: 'LED Driver Overheating',
    risk: 95,
    estimatedDays: 4,
    recommendation: 'Immediate maintenance required — thermal protection at risk',
    severity: 'critical',
    confidence: 97,
    lastUpdated: '1 hour ago',
  },
  {
    id: 'pred-004',
    lampId: 'D-156',
    location: 'Highway Connector #10',
    failureType: 'ESP32 Controller Fault',
    risk: 63,
    estimatedDays: 25,
    recommendation: 'Schedule firmware update and diagnostic check',
    severity: 'warning',
    confidence: 82,
    lastUpdated: '5 hours ago',
  },
  {
    id: 'pred-005',
    lampId: 'E-203',
    location: 'Residential Lane #13',
    failureType: 'Wiring Corrosion',
    risk: 81,
    estimatedDays: 9,
    recommendation: 'Inspect wiring harness and replace corroded connectors',
    severity: 'critical',
    confidence: 91,
    lastUpdated: '4 hours ago',
  },
  {
    id: 'pred-006',
    lampId: 'A-045',
    location: 'Commercial Drive #3',
    failureType: 'Battery Degradation',
    risk: 68,
    estimatedDays: 22,
    recommendation: 'Monitor battery charge cycles and schedule replacement',
    severity: 'warning',
    confidence: 85,
    lastUpdated: '6 hours ago',
  },
  {
    id: 'pred-007',
    lampId: 'F-198',
    location: 'School Road #13',
    failureType: 'Motion Sensor Malfunction',
    risk: 55,
    estimatedDays: 30,
    recommendation: 'Recalibrate motion sensor during next routine check',
    severity: 'warning',
    confidence: 79,
    lastUpdated: '8 hours ago',
  },
  {
    id: 'pred-008',
    lampId: 'B-112',
    location: 'Bridge Sector #7',
    failureType: 'Voltage Regulator Failure',
    risk: 91,
    estimatedDays: 6,
    recommendation: 'Replace voltage regulator immediately to prevent cascade failure',
    severity: 'critical',
    confidence: 96,
    lastUpdated: '30 minutes ago',
  },
  {
    id: 'pred-009',
    lampId: 'C-067',
    location: 'Downtown Plaza #5',
    failureType: 'Solar Panel Efficiency Drop',
    risk: 44,
    estimatedDays: 35,
    recommendation: 'Schedule cleaning during next maintenance cycle',
    severity: 'low',
    confidence: 74,
    lastUpdated: '12 hours ago',
  },
  {
    id: 'pred-010',
    lampId: 'D-089',
    location: 'Harbor View #6',
    failureType: 'LED Driver Overheating',
    risk: 76,
    estimatedDays: 14,
    recommendation: 'Check thermal paste and heat sink integrity',
    severity: 'warning',
    confidence: 87,
    lastUpdated: '7 hours ago',
  },
  {
    id: 'pred-011',
    lampId: 'E-134',
    location: 'Tech Park #9',
    failureType: 'Battery Degradation',
    risk: 89,
    estimatedDays: 8,
    recommendation: 'Critical — battery capacity below 30%, replace urgently',
    severity: 'critical',
    confidence: 95,
    lastUpdated: '1 hour ago',
  },
  {
    id: 'pred-012',
    lampId: 'F-221',
    location: 'University Drive #14',
    failureType: 'ESP32 Controller Fault',
    risk: 52,
    estimatedDays: 28,
    recommendation: 'Update firmware and run full diagnostic suite',
    severity: 'warning',
    confidence: 77,
    lastUpdated: '10 hours ago',
  },
];

// ─── Asset Health Scores ───────────────────────────────────────────
export const assetHealth = {
  battery: { score: 78, trend: -2.3, status: 'good', total: 248, healthy: 189, warning: 38, critical: 21 },
  solarPanel: { score: 84, trend: 1.5, status: 'good', total: 248, healthy: 201, warning: 32, critical: 15 },
  led: { score: 91, trend: 0.8, status: 'excellent', total: 248, healthy: 228, warning: 14, critical: 6 },
  esp32: { score: 86, trend: -0.5, status: 'good', total: 248, healthy: 210, warning: 28, critical: 10 },
};

// ─── Sensor Readings (Real-time base values) ──────────────────────
export const sensorBaselines = {
  batteryVoltage: { value: 12.6, unit: 'V', min: 10, max: 14.4, icon: 'Battery', color: '#00FF88' },
  batteryTemperature: { value: 34.2, unit: '°C', min: 15, max: 60, icon: 'Thermometer', color: '#EF4444' },
  currentOutput: { value: 2.8, unit: 'A', min: 0, max: 5, icon: 'Zap', color: '#00D4FF' },
  solarIrradiance: { value: 680, unit: 'W/m²', min: 0, max: 1200, icon: 'Sun', color: '#F59E0B' },
  lampBrightness: { value: 85, unit: '%', min: 0, max: 100, icon: 'Lightbulb', color: '#8B5CF6' },
  motionDetection: { value: 12, unit: 'events/hr', min: 0, max: 60, icon: 'Move', color: '#00D4FF' },
  energyConsumption: { value: 38.5, unit: 'W', min: 0, max: 55, icon: 'Activity', color: '#00FF88' },
};

// Generate sparkline history (last 20 readings)
export const sensorHistory = Object.fromEntries(
  Object.entries(sensorBaselines).map(([key, { value }]) => [
    key,
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: +(value + (Math.random() - 0.5) * value * 0.15).toFixed(2),
    })),
  ])
);

// ─── Maintenance Priority Table ────────────────────────────────────
export const maintenanceQueue = [
  { id: 1, lampId: 'C-041', location: 'Industrial Blvd #3', issue: 'LED Driver Overheating', priority: 'critical', riskScore: 95, predictedDate: futureDate(4), status: 'pending' },
  { id: 2, lampId: 'B-112', location: 'Bridge Sector #7', issue: 'Voltage Regulator Failure', priority: 'critical', riskScore: 91, predictedDate: futureDate(6), status: 'pending' },
  { id: 3, lampId: 'E-134', location: 'Tech Park #9', issue: 'Battery Degradation', priority: 'critical', riskScore: 89, predictedDate: futureDate(8), status: 'scheduled' },
  { id: 4, lampId: 'A-102', location: 'Main Street #7', issue: 'Battery Degradation', priority: 'critical', riskScore: 87, predictedDate: futureDate(12), status: 'pending' },
  { id: 5, lampId: 'E-203', location: 'Residential Lane #13', issue: 'Wiring Corrosion', priority: 'critical', riskScore: 81, predictedDate: futureDate(9), status: 'pending' },
  { id: 6, lampId: 'D-089', location: 'Harbor View #6', issue: 'LED Driver Overheating', priority: 'high', riskScore: 76, predictedDate: futureDate(14), status: 'scheduled' },
  { id: 7, lampId: 'B-087', location: 'Park Avenue #6', issue: 'Solar Panel Efficiency Drop', priority: 'high', riskScore: 72, predictedDate: futureDate(18), status: 'pending' },
  { id: 8, lampId: 'A-045', location: 'Commercial Drive #3', issue: 'Battery Degradation', priority: 'high', riskScore: 68, predictedDate: futureDate(22), status: 'pending' },
  { id: 9, lampId: 'D-156', location: 'Highway Connector #10', issue: 'ESP32 Controller Fault', priority: 'medium', riskScore: 63, predictedDate: futureDate(25), status: 'pending' },
  { id: 10, lampId: 'F-198', location: 'School Road #13', issue: 'Motion Sensor Malfunction', priority: 'medium', riskScore: 55, predictedDate: futureDate(30), status: 'pending' },
  { id: 11, lampId: 'F-221', location: 'University Drive #14', issue: 'ESP32 Controller Fault', priority: 'medium', riskScore: 52, predictedDate: futureDate(28), status: 'pending' },
  { id: 12, lampId: 'C-067', location: 'Downtown Plaza #5', issue: 'Solar Panel Efficiency Drop', priority: 'low', riskScore: 44, predictedDate: futureDate(35), status: 'pending' },
  { id: 13, lampId: 'A-178', location: 'Garden Path #12', issue: 'Battery Degradation', priority: 'medium', riskScore: 58, predictedDate: futureDate(20), status: 'scheduled' },
  { id: 14, lampId: 'B-056', location: 'Market Square #4', issue: 'Solar Panel Efficiency Drop', priority: 'low', riskScore: 41, predictedDate: futureDate(40), status: 'pending' },
  { id: 15, lampId: 'C-145', location: 'Station Road #10', issue: 'Motion Sensor Malfunction', priority: 'low', riskScore: 38, predictedDate: futureDate(45), status: 'pending' },
  { id: 16, lampId: 'D-210', location: 'Lake Avenue #14', issue: 'Wiring Corrosion', priority: 'high', riskScore: 70, predictedDate: futureDate(16), status: 'pending' },
  { id: 17, lampId: 'E-078', location: 'Tech Park #5', issue: 'LED Driver Overheating', priority: 'medium', riskScore: 60, predictedDate: futureDate(21), status: 'pending' },
  { id: 18, lampId: 'F-034', location: 'Commercial Drive #3', issue: 'Voltage Regulator Failure', priority: 'high', riskScore: 74, predictedDate: futureDate(13), status: 'scheduled' },
  { id: 19, lampId: 'A-199', location: 'Downtown Plaza #13', issue: 'ESP32 Controller Fault', priority: 'low', riskScore: 35, predictedDate: futureDate(50), status: 'pending' },
  { id: 20, lampId: 'B-234', location: 'Harbor View #15', issue: 'Battery Degradation', priority: 'critical', riskScore: 83, predictedDate: futureDate(10), status: 'pending' },
];

// ─── AI Insights ───────────────────────────────────────────────────
export const aiInsights = [
  { id: 1, message: 'Battery failures are increasing in Sector B — 4 lamps show degradation patterns consistent with thermal stress.', severity: 'critical', timestamp: '15 min ago', category: 'battery' },
  { id: 2, message: 'High temperature trend detected across 12 lamps in Industrial Zone. Average operating temp up 8°C this week.', severity: 'warning', timestamp: '1 hour ago', category: 'temperature' },
  { id: 3, message: 'Solar output decreased 12% this week across all sectors due to cloud cover. Battery reserves adequate.', severity: 'info', timestamp: '2 hours ago', category: 'solar' },
  { id: 4, message: 'Recommend immediate inspection for 8 lamps with risk scores above 80%. Prioritize Sector C and E.', severity: 'critical', timestamp: '3 hours ago', category: 'maintenance' },
  { id: 5, message: 'LED efficiency in Sector A improved by 3.2% after last maintenance cycle. Pattern suggests proactive cleaning helps.', severity: 'success', timestamp: '5 hours ago', category: 'led' },
  { id: 6, message: 'Predictive model accuracy improved to 94.2% this month. 23 out of 24 predicted failures were confirmed.', severity: 'info', timestamp: '6 hours ago', category: 'model' },
  { id: 7, message: 'Firmware v3.2.1 update available for 45 ESP32 controllers. Update recommended to fix memory leak issue.', severity: 'warning', timestamp: '8 hours ago', category: 'firmware' },
  { id: 8, message: 'Energy cost savings reached $12,450 this month — 18% above target. Solar generation exceeding consumption.', severity: 'success', timestamp: '12 hours ago', category: 'energy' },
];

// ─── Analytics Chart Data (30 days) ────────────────────────────────
const last30Days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

export const energyProductionData = last30Days.map((day, i) => ({
  day,
  generated: Math.round(1600 + Math.sin(i * 0.3) * 300 + Math.random() * 200),
  consumed: Math.round(900 + Math.sin(i * 0.2) * 150 + Math.random() * 100),
}));

export const batteryHealthData = last30Days.map((day, i) => ({
  day,
  average: +(80 - i * 0.1 + Math.random() * 3).toFixed(1),
  minimum: +(45 - i * 0.2 + Math.random() * 5).toFixed(1),
  maximum: +(96 + Math.random() * 2).toFixed(1),
}));

export const failurePredictionData = [
  { category: 'Battery', count: 18, critical: 6, warning: 8, low: 4 },
  { category: 'Solar Panel', count: 12, critical: 3, warning: 5, low: 4 },
  { category: 'LED Driver', count: 8, critical: 4, warning: 3, low: 1 },
  { category: 'Controller', count: 6, critical: 1, warning: 3, low: 2 },
  { category: 'Wiring', count: 5, critical: 2, warning: 2, low: 1 },
  { category: 'Sensors', count: 4, critical: 0, warning: 2, low: 2 },
];

export const maintenanceCostData = last30Days.filter((_, i) => i % 3 === 0).map((day, i) => ({
  day,
  cost: Math.round(800 + Math.random() * 1200),
  cumulative: Math.round((i + 1) * 950 + Math.random() * 500),
}));

// ─── Alert Feed ────────────────────────────────────────────────────
export const alertFeed = [
  { id: 'alert-001', severity: 'critical', message: 'Lamp C-041 LED driver temperature exceeded 85°C — shutdown initiated', lampId: 'C-041', timestamp: '5 min ago', isResolved: false },
  { id: 'alert-002', severity: 'critical', message: 'Lamp B-112 voltage regulator output unstable — intermittent power loss', lampId: 'B-112', timestamp: '12 min ago', isResolved: false },
  { id: 'alert-003', severity: 'warning', message: 'Lamp A-102 battery health dropped below 30% — replacement recommended', lampId: 'A-102', timestamp: '25 min ago', isResolved: false },
  { id: 'alert-004', severity: 'critical', message: 'Lamp E-134 battery capacity critically low at 18% — offline risk imminent', lampId: 'E-134', timestamp: '40 min ago', isResolved: false },
  { id: 'alert-005', severity: 'warning', message: 'Solar panel efficiency drop detected on 5 lamps in Sector B', lampId: 'B-087', timestamp: '1 hour ago', isResolved: false },
  { id: 'alert-006', severity: 'info', message: 'Scheduled maintenance completed for Lamp D-034 — all systems nominal', lampId: 'D-034', timestamp: '2 hours ago', isResolved: true },
  { id: 'alert-007', severity: 'warning', message: 'Lamp D-089 heat sink temperature rising — monitor closely', lampId: 'D-089', timestamp: '2.5 hours ago', isResolved: false },
  { id: 'alert-008', severity: 'info', message: 'Firmware update v3.2.1 deployed to 12 controllers successfully', lampId: null, timestamp: '3 hours ago', isResolved: true },
  { id: 'alert-009', severity: 'warning', message: 'Lamp E-203 showing signs of wiring degradation — corrosion detected', lampId: 'E-203', timestamp: '4 hours ago', isResolved: false },
  { id: 'alert-010', severity: 'critical', message: 'Power surge detected in Sector C grid — 3 lamps affected', lampId: 'C-145', timestamp: '5 hours ago', isResolved: true },
  { id: 'alert-011', severity: 'info', message: 'Daily energy report: 1,842 kWh generated, 1,056 kWh consumed', lampId: null, timestamp: '6 hours ago', isResolved: true },
  { id: 'alert-012', severity: 'warning', message: 'Motion sensor calibration drift on Lamp F-198 — accuracy reduced', lampId: 'F-198', timestamp: '8 hours ago', isResolved: false },
  { id: 'alert-013', severity: 'info', message: 'Predictive model retrained with latest data — accuracy: 94.2%', lampId: null, timestamp: '10 hours ago', isResolved: true },
  { id: 'alert-014', severity: 'warning', message: 'Battery temperature elevated on 8 lamps in Sector A during peak hours', lampId: 'A-045', timestamp: '12 hours ago', isResolved: false },
  { id: 'alert-015', severity: 'info', message: 'New lamp F-248 commissioned and added to monitoring network', lampId: 'F-248', timestamp: '1 day ago', isResolved: true },
];

// ─── Lamp Detail (for modal) ───────────────────────────────────────
export const lampDetailData = {
  maintenanceHistory: [
    { id: 1, date: '2026-05-15', type: 'Preventive', description: 'Battery health check and cleaning', technician: 'Ahmad R.', cost: 45 },
    { id: 2, date: '2026-04-28', type: 'Corrective', description: 'Replaced LED driver module', technician: 'Budi S.', cost: 180 },
    { id: 3, date: '2026-04-10', type: 'Preventive', description: 'Solar panel cleaning and inspection', technician: 'Ahmad R.', cost: 30 },
    { id: 4, date: '2026-03-22', type: 'Emergency', description: 'Power surge repair — replaced fuse and regulator', technician: 'Citra W.', cost: 250 },
    { id: 5, date: '2026-02-15', type: 'Preventive', description: 'Full system diagnostic and firmware update', technician: 'Budi S.', cost: 60 },
  ],
  sensorTimeSeries: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    batteryVoltage: +(12.2 + Math.sin(i * 0.3) * 0.8 + Math.random() * 0.3).toFixed(2),
    temperature: +(28 + Math.sin(i * 0.25) * 8 + Math.random() * 3).toFixed(1),
    solarPower: i >= 6 && i <= 18 ? +(Math.sin((i - 6) * 0.26) * 85 + Math.random() * 10).toFixed(1) : 0,
    brightness: i >= 18 || i <= 5 ? +(70 + Math.random() * 25).toFixed(0) : 0,
  })),
};
