import {
  CAMPUS_CARBON_FORECAST,
  CAMPUS_CARBON_QUOTA,
  CAMPUS_CARBON_TARGET,
  getCampusOperationalSnapshot,
  getSystemAnomalySnapshots,
  getSystemDeviceSnapshots,
  getSystemMonthlyCarbon,
} from "../src/data/campus-system-data";

const now = new Date();
const snapshot = getCampusOperationalSnapshot(now);
const devices = getSystemDeviceSnapshots(now);
const anomalies = getSystemAnomalySnapshots(now);
const monthlyCarbon = getSystemMonthlyCarbon(now);

const activeAnomalies = anomalies.filter((item) => item.status !== "resolved");
const activeBuildings = new Set(activeAnomalies.map((item) => item.buildingId));
const deviceStatus = devices.reduce(
  (summary, device) => {
    summary[device.status] += 1;
    summary.total += 1;
    return summary;
  },
  { total: 0, online: 0, offline: 0, fault: 0, maintenance: 0 },
);

const reportSnapshot = {
  generatedAt: now.toISOString(),
  reportingTime: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }),
  summary: {
    annualTarget: CAMPUS_CARBON_TARGET,
    annualQuota: CAMPUS_CARBON_QUOTA,
    annualForecast: CAMPUS_CARBON_FORECAST,
    forecastQuotaGap: CAMPUS_CARBON_FORECAST - CAMPUS_CARBON_QUOTA,
    forecastTargetGap: CAMPUS_CARBON_FORECAST - CAMPUS_CARBON_TARGET,
    yearToDateCarbon: snapshot.annualCarbon,
    yearToDateTarget: snapshot.yearToDateTarget,
    dataCompleteness: snapshot.dataCompletenessRate,
    deviceTotal: deviceStatus.total,
    onlineDevices: deviceStatus.online,
    nonNormalDevices: deviceStatus.offline + deviceStatus.fault + deviceStatus.maintenance,
    activeAnomalies: activeAnomalies.length,
    activeAnomalyBuildings: activeBuildings.size,
  },
  monthlyCarbon,
  deviceStatus,
  activeAnomalies,
};

console.log(JSON.stringify(reportSnapshot, null, 2));
