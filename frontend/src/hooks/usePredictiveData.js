import { useState, useEffect, useCallback, useRef } from 'react';
import {
  kpiData, predictions, assetHealth, sensorBaselines, sensorHistory,
  maintenanceQueue, aiInsights, energyProductionData, batteryHealthData,
  failurePredictionData, maintenanceCostData, alertFeed, lamps, lampDetailData,
} from '../data/predictiveMockData';

/**
 * Central data hook for the Predictive Maintenance dashboard.
 * Simulates real-time sensor updates and provides all PM data.
 */
export default function usePredictiveData() {
  // Live sensor data — updates every 2 seconds
  const [liveSensors, setLiveSensors] = useState(() => {
    const initial = {};
    for (const [key, { value }] of Object.entries(sensorBaselines)) {
      initial[key] = value;
    }
    return initial;
  });

  // Live sensor sparkline history
  const [sparklines, setSparklines] = useState(sensorHistory);

  // Alerts with resolved state
  const [alerts, setAlerts] = useState(alertFeed);

  const intervalRef = useRef(null);

  // Simulate real-time sensor fluctuations
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLiveSensors((prev) => {
        const next = {};
        for (const [key, { value, min, max }] of Object.entries(sensorBaselines)) {
          const delta = (Math.random() - 0.5) * value * 0.1;
          next[key] = +Math.min(max, Math.max(min, prev[key] + delta)).toFixed(2);
        }
        return next;
      });

      setSparklines((prev) => {
        const next = {};
        for (const [key, history] of Object.entries(prev)) {
          const lastVal = history[history.length - 1]?.value || sensorBaselines[key].value;
          const delta = (Math.random() - 0.5) * lastVal * 0.1;
          const newVal = +(lastVal + delta).toFixed(2);
          next[key] = [...history.slice(1), { time: history.length, value: newVal }];
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Get lamp by ID
  const getLampById = useCallback((id) => {
    return lamps.find((l) => l.id === id || l.lampId === id);
  }, []);

  // Resolve an alert
  const resolveAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isResolved: true } : a))
    );
  }, []);

  return {
    // KPI
    kpi: kpiData,

    // Predictions
    predictions,

    // Asset Health
    assetHealth,

    // Sensors
    sensorMeta: sensorBaselines,
    liveSensors,
    sparklines,

    // Maintenance
    maintenanceQueue,

    // AI Insights
    aiInsights,

    // Charts / Analytics
    chartData: {
      energyProduction: energyProductionData,
      batteryHealth: batteryHealthData,
      failurePrediction: failurePredictionData,
      maintenanceCost: maintenanceCostData,
    },

    // Alerts
    alerts,
    resolveAlert,

    // Lamps
    lamps,
    getLampById,

    // Lamp detail (for modal)
    lampDetail: lampDetailData,
  };
}
