/**
 * 绿色/低碳校园评价数据
 * 参考标准：GB/T 29117-2025《绿色学校评价导则》+ GB/T 51356-2019《绿色校园评价标准》
 */

// 评价维度类型
export type EvaluationDimension = 'energy' | 'management' | 'technology' | 'education';

// 评价等级
export type EvaluationLevel = 'excellent' | 'good' | 'qualified' | 'unqualified';

// 达标状态
export type ComplianceStatus = 'compliant' | 'near' | 'non-compliant';

// 子指标数据
export interface SubIndicator {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: ComplianceStatus;
  trend: 'up' | 'down' | 'stable';
  evidenceStatus: 'uploaded' | 'pending' | 'missing';
}

// 评价维度数据
export interface DimensionData {
  id: EvaluationDimension;
  name: string;
  maxScore: number;
  currentScore: number;
  subIndicators: SubIndicator[];
}

// 评价结果
export interface EvaluationResult {
  year: number;
  totalScore: number;
  level: EvaluationLevel;
  dimensions: DimensionData[];
  topGaps: {
    indicatorId: string;
    indicatorName: string;
    dimension: string;
    gap: number;
    suggestion: string;
  }[];
  evidenceCompleteness: {
    uploaded: number;
    pending: number;
    missing: number;
  };
}

// 近三年趋势数据
export interface YearlyTrend {
  year: number;
  totalScore: number;
  energyScore: number;
  managementScore: number;
  technologyScore: number;
  educationScore: number;
}

// 获取评价等级
export function getEvaluationLevel(score: number): EvaluationLevel {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 60) return 'qualified';
  return 'unqualified';
}

// 获取等级显示文字
export function getLevelText(level: EvaluationLevel): string {
  const map: Record<EvaluationLevel, string> = {
    excellent: '优秀',
    good: '良好',
    qualified: '合格',
    unqualified: '不合格',
  };
  return map[level];
}

// 获取等级颜色
export function getLevelColor(level: EvaluationLevel): string {
  const map: Record<EvaluationLevel, string> = {
    excellent: '#FFD700', // 金色
    good: '#36D968', // 绿色
    qualified: '#3488FF', // 蓝色
    unqualified: '#FF4D4F', // 红色
  };
  return map[level];
}

// 获取达标状态
export function getComplianceStatus(current: number, target: number): ComplianceStatus {
  const ratio = current / target;
  if (ratio >= 1) return 'compliant';
  if (ratio >= 0.9) return 'near';
  return 'non-compliant';
}

// 获取评价数据
export function getEvaluationData(year: number = 2026): EvaluationResult {
  const dimensions: DimensionData[] = [
    {
      id: 'energy',
      name: '能源资源利用',
      maxScore: 35,
      currentScore: 31,
      subIndicators: [
        {
          id: 'energy-01',
          name: '单位建筑面积能耗',
          targetValue: 25,
          currentValue: 23.5,
          unit: 'kgce/m²',
          status: 'compliant',
          trend: 'down',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'energy-02',
          name: '单位面积碳排放',
          targetValue: 15,
          currentValue: 14.2,
          unit: 'kgCO₂/m²',
          status: 'compliant',
          trend: 'down',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'energy-03',
          name: '人均用水量',
          targetValue: 45,
          currentValue: 48,
          unit: '吨/人·年',
          status: 'near',
          trend: 'stable',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'energy-04',
          name: '节水器具普及率',
          targetValue: 100,
          currentValue: 96,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'energy-05',
          name: '中水回用率',
          targetValue: 30,
          currentValue: 24,
          unit: '%',
          status: 'non-compliant',
          trend: 'up',
          evidenceStatus: 'pending',
        },
        {
          id: 'energy-06',
          name: '可再生能源利用率',
          targetValue: 20,
          currentValue: 18.5,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'energy-07',
          name: '清洁能源占比',
          targetValue: 80,
          currentValue: 82,
          unit: '%',
          status: 'compliant',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
      ],
    },
    {
      id: 'management',
      name: '校园运行管理',
      maxScore: 25,
      currentScore: 22,
      subIndicators: [
        {
          id: 'mgmt-01',
          name: '能耗监测覆盖率',
          targetValue: 100,
          currentValue: 95,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'mgmt-02',
          name: '碳排放管理制度完备性',
          targetValue: 100,
          currentValue: 100,
          unit: '%',
          status: 'compliant',
          trend: 'stable',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'mgmt-03',
          name: '能源审计执行率',
          targetValue: 100,
          currentValue: 100,
          unit: '%',
          status: 'compliant',
          trend: 'stable',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'mgmt-04',
          name: '碳管理信息化建设',
          targetValue: 100,
          currentValue: 90,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'mgmt-05',
          name: '管网漏损率',
          targetValue: 5,
          currentValue: 6.2,
          unit: '%',
          status: 'non-compliant',
          trend: 'down',
          evidenceStatus: 'pending',
        },
        {
          id: 'mgmt-06',
          name: '垃圾分类覆盖率',
          targetValue: 100,
          currentValue: 100,
          unit: '%',
          status: 'compliant',
          trend: 'stable',
          evidenceStatus: 'uploaded',
        },
      ],
    },
    {
      id: 'technology',
      name: '低碳技术应用',
      maxScore: 20,
      currentScore: 17,
      subIndicators: [
        {
          id: 'tech-01',
          name: '节能改造完成率',
          targetValue: 100,
          currentValue: 85,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'tech-02',
          name: '光伏装机容量利用率',
          targetValue: 90,
          currentValue: 82,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'tech-03',
          name: '绿色建筑标准执行率',
          targetValue: 100,
          currentValue: 75,
          unit: '%',
          status: 'non-compliant',
          trend: 'up',
          evidenceStatus: 'pending',
        },
        {
          id: 'tech-04',
          name: '低碳新技术应用',
          targetValue: 5,
          currentValue: 4,
          unit: '项',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'tech-05',
          name: '有害废弃物合规处置率',
          targetValue: 100,
          currentValue: 100,
          unit: '%',
          status: 'compliant',
          trend: 'stable',
          evidenceStatus: 'uploaded',
        },
      ],
    },
    {
      id: 'education',
      name: '宣传教育机制',
      maxScore: 20,
      currentScore: 16.5,
      subIndicators: [
        {
          id: 'edu-01',
          name: '低碳教育覆盖率',
          targetValue: 100,
          currentValue: 88,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'edu-02',
          name: '师生参与度',
          targetValue: 80,
          currentValue: 72,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'pending',
        },
        {
          id: 'edu-03',
          name: '低碳宣传活动频次',
          targetValue: 12,
          currentValue: 10,
          unit: '次/年',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'edu-04',
          name: '培训覆盖率',
          targetValue: 100,
          currentValue: 85,
          unit: '%',
          status: 'near',
          trend: 'up',
          evidenceStatus: 'uploaded',
        },
        {
          id: 'edu-05',
          name: '低碳文化制度建设',
          targetValue: 100,
          currentValue: 80,
          unit: '%',
          status: 'near',
          trend: 'stable',
          evidenceStatus: 'pending',
        },
      ],
    },
  ];

  // 计算总分
  const totalScore = dimensions.reduce((sum, d) => sum + d.currentScore, 0);
  const level = getEvaluationLevel(totalScore);

  // 失分项 TOP5
  const topGaps = [
    {
      indicatorId: 'energy-05',
      indicatorName: '中水回用率',
      dimension: '能源资源利用',
      gap: 6,
      suggestion: '加快中水回用设施建设，提高雨水收集利用率',
    },
    {
      indicatorId: 'tech-03',
      indicatorName: '绿色建筑标准执行率',
      dimension: '低碳技术应用',
      gap: 25,
      suggestion: '新建建筑严格执行绿色建筑标准，既有建筑逐步改造',
    },
    {
      indicatorId: 'mgmt-05',
      indicatorName: '管网漏损率',
      dimension: '校园运行管理',
      gap: 1.2,
      suggestion: '开展管网检测与修复，安装智能漏损监测系统',
    },
    {
      indicatorId: 'edu-02',
      indicatorName: '师生参与度',
      dimension: '宣传教育机制',
      gap: 8,
      suggestion: '增加低碳主题活动，建立激励机制',
    },
    {
      indicatorId: 'energy-04',
      indicatorName: '节水器具普及率',
      dimension: '能源资源利用',
      gap: 4,
      suggestion: '加快老旧器具更换，推广智能节水设备',
    },
  ];

  // 材料完备度统计
  const allIndicators = dimensions.flatMap((d) => d.subIndicators);
  const evidenceCompleteness = {
    uploaded: allIndicators.filter((i) => i.evidenceStatus === 'uploaded').length,
    pending: allIndicators.filter((i) => i.evidenceStatus === 'pending').length,
    missing: allIndicators.filter((i) => i.evidenceStatus === 'missing').length,
  };

  return {
    year,
    totalScore,
    level,
    dimensions,
    topGaps,
    evidenceCompleteness,
  };
}

// 获取近三年趋势数据
export function getYearlyTrend(): YearlyTrend[] {
  return [
    {
      year: 2024,
      totalScore: 78.5,
      energyScore: 27.5,
      managementScore: 19.5,
      technologyScore: 15,
      educationScore: 16.5,
    },
    {
      year: 2025,
      totalScore: 82.5,
      energyScore: 29,
      managementScore: 21,
      technologyScore: 16,
      educationScore: 16.5,
    },
    {
      year: 2026,
      totalScore: 86.5,
      energyScore: 31,
      managementScore: 22,
      technologyScore: 17,
      educationScore: 16.5,
    },
  ];
}
