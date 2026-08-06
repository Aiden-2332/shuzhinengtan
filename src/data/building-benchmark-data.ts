import {
  getCampusBuildingLayer,
  getCampusMapBuildings,
  type CampusMapBuilding,
} from "@/data/campus-map-buildings";

const PEER_LABELS = {
  teaching: "教学楼宇",
  dormitory: "学生宿舍",
  laboratory: "科研实验楼",
  services: "公共服务楼宇",
} as const;

export interface BuildingPeerBenchmark {
  peerLabel: string;
  peerCount: number;
  energyMedian: number;
  carbonMedian: number;
  energyDelta: number;
  carbonDelta: number;
  energyRank: number;
  carbonRank: number;
}

function median(values: number[]): number {
  const ordered = values.toSorted((left, right) => left - right);
  if (!ordered.length) return 0;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

export function getBuildingPeerBenchmark(
  building: CampusMapBuilding,
  allBuildings = getCampusMapBuildings("2_5d"),
): BuildingPeerBenchmark {
  const layer = getCampusBuildingLayer(building);
  const matchingPeers = allBuildings.filter((candidate) => getCampusBuildingLayer(candidate) === layer);
  const peerSet = matchingPeers.length > 1 ? matchingPeers : allBuildings;
  const carbonIntensity = (candidate: CampusMapBuilding) => candidate.carbon.area > 0
    ? (candidate.carbon.annualEmission * 1_000) / candidate.carbon.area
    : 0;
  const energyMedian = median(peerSet.map((candidate) => candidate.carbon.energyIntensity));
  const carbonMedian = median(peerSet.map(carbonIntensity));
  const buildingCarbonIntensity = carbonIntensity(building);
  const energyRank = peerSet
    .toSorted((left, right) => right.carbon.energyIntensity - left.carbon.energyIntensity)
    .findIndex((candidate) => candidate.id === building.id) + 1;
  const carbonRank = peerSet
    .toSorted((left, right) => carbonIntensity(right) - carbonIntensity(left))
    .findIndex((candidate) => candidate.id === building.id) + 1;

  return {
    peerLabel: PEER_LABELS[layer],
    peerCount: peerSet.length,
    energyMedian,
    carbonMedian,
    energyDelta: energyMedian ? ((building.carbon.energyIntensity - energyMedian) / energyMedian) * 100 : 0,
    carbonDelta: carbonMedian ? ((buildingCarbonIntensity - carbonMedian) / carbonMedian) * 100 : 0,
    energyRank: energyRank || peerSet.length,
    carbonRank: carbonRank || peerSet.length,
  };
}
