import { useEffect, useMemo, useState } from 'react';
import {
  connectionStatus,
  energyChartData,
  energyComparison,
  energyStats,
  iotGauges,
  lampStatuses,
  sensorCards,
  sensorTimeSeriesData,
} from '../data/mockData';
import { fetchPublicDashboard } from '../services/api';

function pickNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function buildGauges(data) {
  const telemetry = data?.latestTelemetry || {};
  return [
    { id: 1, label: 'Battery Level', value: Math.round(pickNumber(telemetry.battery_level, 87)), unit: '%', color: '#00FF88', max: 100 },
    { id: 2, label: 'Solar Input', value: Math.round(pickNumber(telemetry.solar_power, 42)), unit: 'W', color: '#F59E0B', max: 100 },
    { id: 3, label: 'Power Output', value: Math.round(pickNumber(telemetry.power, 35)), unit: 'W', color: '#00D4FF', max: 100 },
    { id: 4, label: 'Temperature', value: Math.round(pickNumber(telemetry.temperature_ambient, 32)), unit: '°C', color: '#EF4444', max: 80 },
  ];
}

function buildSensorCards(data) {
  const telemetry = data?.latestTelemetry || {};
  return [
    { id: 1, label: 'Light Intensity', value: Math.round(pickNumber(telemetry.lux, 892)), unit: 'lux', change: 'Live', icon: 'Sun', color: '#F59E0B' },
    { id: 2, label: 'Ambient Temp', value: pickNumber(telemetry.temperature_ambient, 32.4).toFixed(1), unit: '°C', change: 'Live', icon: 'Thermometer', color: '#EF4444' },
    { id: 3, label: 'Motion Events', value: Math.round(pickNumber(telemetry.motion_count, 147)), unit: '/hr', change: 'Live', icon: 'Activity', color: '#8B5CF6' },
    { id: 4, label: 'Signal', value: Math.round(pickNumber(telemetry.signal_strength, 92)), unit: '%', change: 'Live', icon: 'Wind', color: '#00FF88' },
  ];
}

function buildEnergyStats(data) {
  const energy = data?.energy || {};
  return {
    dailyGenerated: Math.round(pickNumber(energy.dailyGenerated, energyStats.dailyGenerated)),
    dailyConsumed: Math.round(pickNumber(energy.dailyConsumed, energyStats.dailyConsumed)),
    efficiency: Math.round(pickNumber(energy.efficiency, energyStats.efficiency) * 10) / 10,
    co2Saved: Math.round(pickNumber(energy.co2Saved, energyStats.co2Saved) * 10) / 10,
    treesEquivalent: Math.round(pickNumber(energy.treesEquivalent, energyStats.treesEquivalent)),
    costSaving: Math.round(pickNumber(energy.costSaving, energyStats.costSaving)),
  };
}

function buildEnergyComparison(data) {
  const energy = data?.energy || {};
  const before = Math.round(pickNumber(energy.traditionalMonthlyCost, energyComparison.before.cost));
  const after = Math.round(pickNumber(energy.smartMonthlyCost, energyComparison.after.cost));
  return {
    before: { ...energyComparison.before, cost: before },
    after: { ...energyComparison.after, cost: after },
    currency: energy.currency || 'USD',
  };
}

function buildConnectionStatus(data) {
  const telemetry = data?.latestTelemetry || {};
  const kpi = data?.kpi || {};
  const onlineRate = kpi.total_lamps ? Math.round((kpi.online_lamps / kpi.total_lamps) * 100) : 100;
  return {
    wifi: { connected: onlineRate > 0, signal: Math.round(pickNumber(telemetry.signal_strength, connectionStatus.wifi.signal)) },
    mqtt: { connected: true, latency: Math.round(pickNumber(telemetry.mqtt_latency_ms, connectionStatus.mqtt.latency)) },
    cloud: { connected: true, lastSync: data ? 'Live API' : connectionStatus.cloud.lastSync },
  };
}

export default function useDashboardData() {
  const [remoteData, setRemoteData] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPublicDashboard();
        if (!cancelled) {
          setRemoteData(data);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setRemoteData(null);
          setIsLive(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return useMemo(() => ({
    isLive,
    iotGauges: remoteData ? buildGauges(remoteData) : iotGauges,
    connectionStatus: remoteData ? buildConnectionStatus(remoteData) : connectionStatus,
    sensorCards: remoteData ? buildSensorCards(remoteData) : sensorCards,
    sensorTimeSeriesData: remoteData?.sensorSeries?.labels?.length ? remoteData.sensorSeries : sensorTimeSeriesData,
    energyStats: remoteData ? buildEnergyStats(remoteData) : energyStats,
    energyComparison: remoteData ? buildEnergyComparison(remoteData) : energyComparison,
    lampStatuses: remoteData?.lamps?.length ? remoteData.lamps : lampStatuses,
    energyChartData: remoteData?.energyFlow?.length ? remoteData.energyFlow : energyChartData,
    kpi: remoteData?.kpi || null,
  }), [remoteData, isLive]);
}
