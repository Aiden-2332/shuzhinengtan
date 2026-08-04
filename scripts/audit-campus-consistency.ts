import overlay from "../src/data/ustb-building-overlays.json";
import {
  CAMPUS_CARBON_FORECAST,
  CAMPUS_CARBON_QUOTA,
  CAMPUS_CARBON_TARGET,
  SYSTEM_ANOMALY_DEFINITIONS,
  SYSTEM_BUILDINGS,
  SYSTEM_BUILDINGS_BY_ID,
  SYSTEM_DEVICE_DEFINITIONS,
  getCampusOperationalSnapshot,
  getSystemMonthlyCarbon,
} from "../src/data/campus-system-data";
import {
  getBenchmarkComparison,
  getDeviceStatusPanel,
  getLoadCurveSeries,
} from "../src/data/energy-three-pages-data";
import { getQuotaLedger } from "../src/data/carbon-asset-mock";
import { getInitialRecords } from "../src/data/calculation-data";
import { getLeaderKPIs } from "../src/data/leader-dashboard-data";
import { getCarbonOverview } from "../src/data/operations-data";
import { campusBuildings } from "../src/data/campus-geojson";

const auditTime = new Date("2026-08-03T07:30:00Z");
const map25Names = new Set(overlay.maps["2_5d"].buildings.map((building) => building.name));
const map2Names = new Set(overlay.maps["2d"].buildings.map((building) => building.name));
const map25Ids = new Map(overlay.maps["2_5d"].buildings.map((building) => [building.name, building.id]));
const statusCounts = SYSTEM_DEVICE_DEFINITIONS.reduce<Record<string, number>>((counts, device) => {
  counts[device.status] = (counts[device.status] ?? 0) + 1;
  return counts;
}, {});
const panel = getDeviceStatusPanel(auditTime);
const snapshot = getCampusOperationalSnapshot(auditTime);
const latestMonthlyCarbon = getSystemMonthlyCarbon(auditTime).at(-1);
const leader = getLeaderKPIs(auditTime);
const operations = getCarbonOverview(auditTime);
const ledger = getQuotaLedger(auditTime);
const functionBuildingPairs = [
  ...getLoadCurveSeries(auditTime).map((item) => ({ id: item.buildingId, name: item.buildingName })),
  ...getBenchmarkComparison().flatMap((group) => group.buildings.map((building) => ({
    id: building.buildingId,
    name: building.buildingName,
  }))).filter((building) => building.id !== "all"),
  ...getInitialRecords()
    .filter((record) => record.buildingId && record.buildingName)
    .map((record) => ({ id: record.buildingId!, name: record.buildingName! })),
].filter((building) => building.id !== "all");

const checks = {
  monitoredBuildings: SYSTEM_BUILDINGS.length,
  buildingNamesInBothCockpits: SYSTEM_BUILDINGS.every(
    (building) => map25Names.has(building.name) && map2Names.has(building.name),
  ),
  buildingIdsMatchCockpitPolygons: SYSTEM_BUILDINGS.every(
    (building) => map25Ids.get(building.name) === building.id,
  ),
  deviceCount: SYSTEM_DEVICE_DEFINITIONS.length,
  deviceStatusCounts: statusCounts,
  devicePanelCounts: {
    online: panel.onlineCount,
    offline: panel.offlineCount,
    fault: panel.faultCount,
    maintenance: panel.maintenanceCount,
    total: panel.totalDevices,
  },
  deviceBuildingsValid: SYSTEM_DEVICE_DEFINITIONS.every(
    (device) => SYSTEM_BUILDINGS_BY_ID.has(device.buildingId),
  ),
  anomalyBuildingsValid: SYSTEM_ANOMALY_DEFINITIONS.every(
    (anomaly) => SYSTEM_BUILDINGS_BY_ID.has(anomaly.buildingId),
  ),
  anomalyDevicesValid: SYSTEM_ANOMALY_DEFINITIONS.every(
    (anomaly) => !anomaly.deviceId || SYSTEM_DEVICE_DEFINITIONS.some(
      (device) => device.id === anomaly.deviceId && device.buildingId === anomaly.buildingId,
    ),
  ),
  anomalyCount: SYSTEM_ANOMALY_DEFINITIONS.length,
  quotaConsistent: {
    constant: CAMPUS_CARBON_QUOTA,
    monthlyAllocation: ledger.monthlyConsumption.reduce((sum, month) => sum + month.quota, 0),
    snapshot: snapshot.annualQuota,
  },
  forecastConsistent: {
    constant: CAMPUS_CARBON_FORECAST,
    snapshot: snapshot.annualForecast,
    leader: leader.find((item) => item.label === "年末排放预测")?.value,
  },
  targetConsistent: {
    constant: CAMPUS_CARBON_TARGET,
    snapshot: snapshot.annualTarget,
  },
  operationsAnnualMatchesSnapshot: operations.annual === snapshot.annualCarbon,
  monthlyCarbonMatchesSnapshot: {
    actual: latestMonthlyCarbon?.actual === snapshot.annualCarbon,
    target: latestMonthlyCarbon?.target === snapshot.yearToDateTarget,
  },
  campusMapNamesValid: campusBuildings.features.every((feature) => map25Names.has(feature.properties.name)),
  functionBuildingNamesValid: functionBuildingPairs.every((building) => map25Names.has(building.name)),
  functionBuildingIdsValid: functionBuildingPairs.every((building) => map25Ids.get(building.name) === building.id),
  functionBuildingMismatches: functionBuildingPairs.filter(
    (building) => !map25Names.has(building.name) || map25Ids.get(building.name) !== building.id,
  ),
};

const expectedDeviceCounts = { online: 30, offline: 2, fault: 1, maintenance: 2 };
const failures = [
  !checks.buildingNamesInBothCockpits && "building names are missing from one cockpit",
  !checks.buildingIdsMatchCockpitPolygons && "building IDs do not match cockpit polygons",
  checks.deviceCount !== 35 && "device total is not 35",
  checks.devicePanelCounts.total !== 35 && "device panel total is not 35",
  Object.entries(expectedDeviceCounts).some(([status, count]) => statusCounts[status] !== count)
    && "device status counts are inconsistent",
  !checks.deviceBuildingsValid && "a device references an unknown building",
  !checks.anomalyBuildingsValid && "an anomaly references an unknown building",
  !checks.anomalyDevicesValid && "an anomaly device belongs to a different building",
  checks.quotaConsistent.monthlyAllocation !== CAMPUS_CARBON_QUOTA && "monthly quotas do not sum to annual quota",
  checks.quotaConsistent.snapshot !== CAMPUS_CARBON_QUOTA && "snapshot quota differs from annual quota",
  checks.targetConsistent.snapshot !== CAMPUS_CARBON_TARGET && "snapshot target differs from annual target",
  !checks.operationsAnnualMatchesSnapshot && "operations annual emissions differ from the shared snapshot",
  !checks.monthlyCarbonMatchesSnapshot.actual && "monthly actual differs from the shared snapshot",
  !checks.monthlyCarbonMatchesSnapshot.target && "monthly target differs from the shared snapshot",
  !checks.campusMapNamesValid && "the function-page map contains a non-cockpit building",
  !checks.functionBuildingNamesValid && "a function page contains a non-cockpit building",
  !checks.functionBuildingIdsValid && "a function-page building ID differs from its cockpit polygon",
].filter(Boolean);

console.log(JSON.stringify(checks, null, 2));
if (failures.length > 0) {
  console.error("\nConsistency audit failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
