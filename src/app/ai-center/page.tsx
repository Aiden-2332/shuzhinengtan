import AICenterDashboard, { type AICenterBuildingContext } from '@/components/ai-center/AICenterDashboard';
import type { AICenterSource } from '@/components/ai-center/BuildingAnalysisContext';
import { getCampusMapBuildings } from '@/data/campus-map-buildings';
import { getBuildingPeerBenchmark } from '@/data/building-benchmark-data';
import type { AIModule } from '@/stores/ai-center-store';

interface AICenterPageProps {
  searchParams: Promise<{
    building?: string | string[];
    module?: string | string[];
    focus?: string | string[];
    source?: string | string[];
  }>;
}

const AI_CENTER_BUILDINGS_BY_ID = new Map(
  getCampusMapBuildings('2_5d').map((building) => [building.id, building] as const),
);
const AI_MODULES = new Set<AIModule>(['prediction', 'monitoring', 'policy', 'suggestion']);
const AI_SOURCES = new Set<AICenterSource>(['leader', 'operations', 'alarms']);

export default async function AICenterPage({ searchParams }: AICenterPageProps) {
  const { building, module, focus, source } = await searchParams;
  const rawBuildingId = Array.isArray(building) ? building[0] : building;
  const buildingId = rawBuildingId?.trim().slice(0, 128) || null;

  let buildingContext: AICenterBuildingContext | null = null;
  if (buildingId) {
    const matchedBuilding = AI_CENTER_BUILDINGS_BY_ID.get(buildingId);
    buildingContext = {
      id: buildingId,
      name: matchedBuilding?.name ?? null,
      carbon: matchedBuilding ? {
        annualEmission: matchedBuilding.carbon.annualEmission,
        targetEmission: matchedBuilding.carbon.targetEmission,
        energyIntensity: matchedBuilding.carbon.energyIntensity,
        area: matchedBuilding.carbon.area,
      } : null,
      benchmark: matchedBuilding ? getBuildingPeerBenchmark(matchedBuilding) : null,
    };
  }

  const rawModule = Array.isArray(module) ? module[0] : module;
  const initialModule = rawModule && AI_MODULES.has(rawModule as AIModule)
    ? rawModule as AIModule
    : null;
  const rawFocus = Array.isArray(focus) ? focus[0] : focus;
  const analysisFocus = rawFocus?.trim().slice(0, 80) || null;
  const rawSource = Array.isArray(source) ? source[0] : source;
  const initialSource = rawSource && AI_SOURCES.has(rawSource as AICenterSource)
    ? rawSource as AICenterSource
    : null;

  return (
    <AICenterDashboard
      buildingContext={buildingContext}
      initialModule={initialModule}
      analysisFocus={analysisFocus}
      source={initialSource}
    />
  );
}
