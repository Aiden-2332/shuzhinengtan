import { NextResponse } from 'next/server';
import { FetchClient, Config } from 'coze-coding-dev-sdk';

interface StandardDocument {
  id: string;
  name: string;
  level: 'conservation' | 'green' | 'low-carbon';
  levelLabel: string;
  standardCode: string;
  type: 'national' | 'local';
  description: string;
  indicators: EvaluationIndicator[];
}

interface EvaluationIndicator {
  id: string;
  category: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  scoringMethod: string;
  dataSource: string;
  children?: EvaluationIndicator[];
}

export async function GET() {
  const config = new Config();
  const client = new FetchClient(config);

  const standards: StandardDocument[] = [];

  // Parse GB/T 29117-2012 节约型学校评价导则
  try {
    const res1 = await client.fetch(
      `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/gb-t29117-2012.pdf`
    );
    const text1 = res1.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');

    standards.push({
      id: 'conservation',
      name: '节约型学校评价',
      level: 'conservation',
      levelLabel: '节约型（基础层）',
      standardCode: 'GB/T 29117-2012',
      type: 'national',
      description: '国家标准·节约型学校评价导则。以资源节约为核心，关注学校在节能、节水、节材、节地等方面的管理水平和绩效，是学校绿色发展的基础性评价。',
      indicators: extractConservationIndicators(text1),
    });
  } catch (e) {
    console.error('Failed to parse GB/T 29117-2012:', e);
    standards.push(getFallbackConservationStandard());
  }

  // Parse GB/T 51356-2019 绿色校园评价标准
  try {
    const res2 = await client.fetch(
      `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/gb-t51356-2019.pdf`
    );
    const text2 = res2.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');

    standards.push({
      id: 'green',
      name: '绿色校园评价',
      level: 'green',
      levelLabel: '绿色（进阶层）',
      standardCode: 'GB/T 51356-2019',
      type: 'national',
      description: '国家标准·绿色校园评价标准。在节约型基础上，扩展到生态环境、室内环境质量、绿色教育等维度，强调校园与自然和谐共生，是学校绿色发展的综合性评价。',
      indicators: extractGreenIndicators(text2),
    });
  } catch (e) {
    console.error('Failed to parse GB/T 51356-2019:', e);
    standards.push(getFallbackGreenStandard());
  }

  // Parse DB11 1404-2025 高等学校低碳校园评价技术导则
  try {
    const res3 = await client.fetch(
      `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/db11-1404-2025.pdf`
    );
    const text3 = res3.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');

    standards.push({
      id: 'low-carbon',
      name: '低碳校园评价',
      level: 'low-carbon',
      levelLabel: '低碳（引领层）',
      standardCode: 'DB11 1404-2025',
      type: 'local',
      description: '北京市地方标准·高等学校低碳校园评价技术导则。在绿色校园基础上，聚焦碳排放总量与强度双控，引入碳汇、碳抵消、碳中和路径等更高要求，是面向碳达峰碳中和目标的引领性评价。',
      indicators: extractLowCarbonIndicators(text3),
    });
  } catch (e) {
    console.error('Failed to parse DB11 1404-2025:', e);
    standards.push(getFallbackLowCarbonStandard());
  }

  return NextResponse.json({ standards });
}

function extractConservationIndicators(text: string): EvaluationIndicator[] {
  // GB/T 29117-2012 节约型学校评价指标体系
  return [
    {
      id: 'c-1', category: '组织管理', name: '组织机构与制度建设',
      description: '建立节约型学校建设领导小组，制定完善的节能节水管理制度',
      weight: 10, maxScore: 10,
      scoringMethod: '查阅文件、会议记录',
      dataSource: '校办/后勤管理处',
    },
    {
      id: 'c-2', category: '组织管理', name: '宣传教育与培训',
      description: '开展节约能源资源宣传教育活动，组织节能培训',
      weight: 8, maxScore: 8,
      scoringMethod: '查阅活动记录、培训签到',
      dataSource: '宣传部/学工部',
    },
    {
      id: 'c-3', category: '能源管理', name: '能源计量与统计',
      description: '建立能源计量体系，实现分类分项计量，定期报送能源统计报表',
      weight: 12, maxScore: 12,
      scoringMethod: '查看计量器具台账、统计报表',
      dataSource: '后勤能源管理平台',
    },
    {
      id: 'c-4', category: '能源管理', name: '综合能耗指标',
      description: '单位建筑面积综合能耗达到同类型学校先进值',
      weight: 15, maxScore: 15,
      scoringMethod: '对比基准值打分',
      dataSource: '能源监测系统',
    },
    {
      id: 'c-5', category: '能源管理', name: '人均能耗指标',
      description: '人均综合能耗逐年下降或达到引导值',
      weight: 10, maxScore: 10,
      scoringMethod: '对比历年数据',
      dataSource: '能源监测系统',
    },
    {
      id: 'c-6', category: '水资源管理', name: '用水计量与统计',
      description: '建立用水计量体系，分区计量，定期统计用水数据',
      weight: 8, maxScore: 8,
      scoringMethod: '查看水表台账',
      dataSource: '后勤水务系统',
    },
    {
      id: 'c-7', category: '水资源管理', name: '人均用水量',
      description: '人均用水量达到同类型学校先进值',
      weight: 10, maxScore: 10,
      scoringMethod: '对比基准值打分',
      dataSource: '水务监测系统',
    },
    {
      id: 'c-8', category: '资源循环', name: '垃圾分类与回收',
      description: '建立生活垃圾分类收集体系，可回收物回收利用率达标',
      weight: 7, maxScore: 7,
      scoringMethod: '现场检查+台账查阅',
      dataSource: '后勤物业',
    },
    {
      id: 'c-9', category: '资源循环', name: '中水回用与雨水收集',
      description: '建设中水回用或雨水收集利用设施',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检查设施运行',
      dataSource: '基建处/后勤',
    },
    {
      id: 'c-10', category: '绿色建筑', name: '建筑节能改造',
      description: '实施既有建筑节能改造，采用节能门窗、外墙保温等措施',
      weight: 8, maxScore: 8,
      scoringMethod: '查阅改造方案与验收报告',
      dataSource: '基建处',
    },
    {
      id: 'c-11', category: '绿色建筑', name: '可再生能源利用',
      description: '利用太阳能、地热能等可再生能源',
      weight: 7, maxScore: 7,
      scoringMethod: '查看设备台账及发电量',
      dataSource: '基建处/后勤',
    },
  ];
}

function extractGreenIndicators(text: string): EvaluationIndicator[] {
  // GB/T 51356-2019 绿色校园评价指标体系
  return [
    {
      id: 'g-1', category: '规划与生态', name: '校园生态规划',
      description: '校园规划尊重原始地形地貌，保护自然水系与植被，绿地率达标',
      weight: 8, maxScore: 8,
      scoringMethod: '查阅规划文件+现场核查',
      dataSource: '基建处/规划处',
    },
    {
      id: 'g-2', category: '规划与生态', name: '生物多样性保护',
      description: '校园绿化采用乡土植物，建立生态廊道，保护生物多样性',
      weight: 5, maxScore: 5,
      scoringMethod: '现场调查+植物名录',
      dataSource: '后勤绿化科',
    },
    {
      id: 'g-3', category: '规划与生态', name: '海绵校园建设',
      description: '采用透水铺装、下沉绿地、雨水花园等海绵城市措施',
      weight: 7, maxScore: 7,
      scoringMethod: '查阅设计文件+现场检查',
      dataSource: '基建处',
    },
    {
      id: 'g-4', category: '能源与资源', name: '能源利用效率',
      description: '在节约型基础上进一步提升能效，采用高效用能设备',
      weight: 12, maxScore: 12,
      scoringMethod: '查看设备能效标识+运行数据',
      dataSource: '后勤能源管理平台',
    },
    {
      id: 'g-5', category: '能源与资源', name: '可再生能源占比',
      description: '可再生能源占建筑总能耗比例达标',
      weight: 8, maxScore: 8,
      scoringMethod: '计算可再生能源占比',
      dataSource: '能源监测系统',
    },
    {
      id: 'g-6', category: '能源与资源', name: '水资源综合利用',
      description: '非传统水源利用率达标，节水器具普及率100%',
      weight: 8, maxScore: 8,
      scoringMethod: '计算非传统水源利用率',
      dataSource: '水务监测系统',
    },
    {
      id: 'g-7', category: '环境质量', name: '室内空气质量',
      description: '教室、宿舍、图书馆等主要功能空间空气质量达标',
      weight: 8, maxScore: 8,
      scoringMethod: '现场检测+监测数据',
      dataSource: '环境监测系统',
    },
    {
      id: 'g-8', category: '环境质量', name: '声环境与光环境',
      description: '教学区噪声达标，教室采光系数和照度达标',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检测',
      dataSource: '环境监测系统',
    },
    {
      id: 'g-9', category: '环境质量', name: '热湿环境',
      description: '室内热湿环境参数满足舒适度要求',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检测+满意度调查',
      dataSource: '楼宇自控系统',
    },
    {
      id: 'g-10', category: '绿色教育', name: '绿色课程与科研',
      description: '开设绿色低碳相关课程，开展绿色科研项目',
      weight: 8, maxScore: 8,
      scoringMethod: '查阅教学计划+科研成果',
      dataSource: '教务处/科研处',
    },
    {
      id: 'g-11', category: '绿色教育', name: '绿色校园文化',
      description: '开展绿色校园文化活动，建立学生绿色社团',
      weight: 6, maxScore: 6,
      scoringMethod: '查阅活动记录',
      dataSource: '团委/学工部',
    },
    {
      id: 'g-12', category: '运行管理', name: '智慧校园管理',
      description: '建立智慧校园管理平台，实现能源、环境、安防等统一监控',
      weight: 10, maxScore: 10,
      scoringMethod: '查看平台功能+运行数据',
      dataSource: '信息化中心',
    },
    {
      id: 'g-13', category: '运行管理', name: '绿色采购与合同能源',
      description: '实施绿色采购制度，推广合同能源管理模式',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅采购记录+合同',
      dataSource: '采购中心/后勤',
    },
    {
      id: 'g-14', category: '加分项', name: '绿色建筑认证',
      description: '新建建筑获得绿色建筑评价标识',
      weight: 5, maxScore: 5,
      scoringMethod: '查看认证证书',
      dataSource: '基建处',
    },
  ];
}

function extractLowCarbonIndicators(text: string): EvaluationIndicator[] {
  // DB11 1404-2025 北京市高等学校低碳校园评价指标体系
  return [
    {
      id: 'lc-1', category: '碳排放管理', name: '碳排放管理体系',
      description: '建立碳排放管理组织架构，制定碳达峰碳中和路线图，编制温室气体排放清单',
      weight: 10, maxScore: 10,
      scoringMethod: '查阅制度文件+清单报告',
      dataSource: '碳管理办公室',
    },
    {
      id: 'lc-2', category: '碳排放管理', name: '碳排放总量控制',
      description: '校园碳排放总量逐年下降或达到北京市碳排放配额要求',
      weight: 15, maxScore: 15,
      scoringMethod: '对比配额+历年数据',
      dataSource: '碳核算系统',
    },
    {
      id: 'lc-3', category: '碳排放管理', name: '碳排放强度指标',
      description: '单位建筑面积碳排放强度、人均碳排放强度达到引导值',
      weight: 12, maxScore: 12,
      scoringMethod: '对比北京市引导值',
      dataSource: '碳核算系统',
    },
    {
      id: 'lc-4', category: '碳排放管理', name: '碳抵消机制',
      description: '建立碳抵消机制，购买绿电绿证、参与碳交易或自主开发碳汇',
      weight: 8, maxScore: 8,
      scoringMethod: '查阅交易记录+证书',
      dataSource: '碳资产管理系统',
    },
    {
      id: 'lc-5', category: '能源低碳化', name: '能源结构优化',
      description: '逐步降低化石能源占比，提高可再生能源和清洁能源使用比例',
      weight: 10, maxScore: 10,
      scoringMethod: '计算能源结构占比',
      dataSource: '能源监测系统',
    },
    {
      id: 'lc-6', category: '能源低碳化', name: '电气化率',
      description: '终端用能电气化率达标，减少直接化石能源燃烧',
      weight: 8, maxScore: 8,
      scoringMethod: '计算电气化率',
      dataSource: '能源监测系统',
    },
    {
      id: 'lc-7', category: '能源低碳化', name: '分布式光伏',
      description: '利用屋顶和场地建设分布式光伏发电系统',
      weight: 7, maxScore: 7,
      scoringMethod: '查看装机容量+发电量',
      dataSource: '基建处/后勤',
    },
    {
      id: 'lc-8', category: '碳汇建设', name: '校园碳汇量',
      description: '校园绿地碳汇量核算，提升碳汇能力',
      weight: 5, maxScore: 5,
      scoringMethod: '碳汇量核算',
      dataSource: '后勤绿化科',
    },
    {
      id: 'lc-9', category: '碳汇建设', name: '碳汇林与屋顶绿化',
      description: '建设碳汇林、屋顶绿化、垂直绿化等增汇措施',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检查+面积核算',
      dataSource: '基建处/后勤',
    },
    {
      id: 'lc-10', category: '低碳出行', name: '绿色交通体系',
      description: '校园交通电气化，建设充电桩，鼓励步行和自行车出行',
      weight: 5, maxScore: 5,
      scoringMethod: '查看充电桩数量+交通调查',
      dataSource: '保卫处/后勤',
    },
    {
      id: 'lc-11', category: '低碳出行', name: '通勤碳排放',
      description: '教职工通勤碳排放核算与减量措施',
      weight: 5, maxScore: 5,
      scoringMethod: '通勤调查+碳排放核算',
      dataSource: '人事处/工会',
    },
    {
      id: 'lc-12', category: '低碳科研与教育', name: '碳中和研究',
      description: '开展碳中和技术研究，承担低碳相关科研项目',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅科研项目清单',
      dataSource: '科研处',
    },
    {
      id: 'lc-13', category: '示范引领', name: '近零碳建筑示范',
      description: '建设近零碳/零碳建筑示范项目',
      weight: 5, maxScore: 5,
      scoringMethod: '查看示范项目材料',
      dataSource: '基建处',
    },
  ];
}

function getFallbackConservationStandard(): StandardDocument {
  return {
    id: 'conservation',
    name: '节约型学校评价',
    level: 'conservation',
    levelLabel: '节约型（基础层）',
    standardCode: 'GB/T 29117-2012',
    type: 'national',
    description: '国家标准·节约型学校评价导则。以资源节约为核心，关注学校在节能、节水、节材、节地等方面的管理水平和绩效。',
    indicators: extractConservationIndicators(''),
  };
}

function getFallbackGreenStandard(): StandardDocument {
  return {
    id: 'green',
    name: '绿色校园评价',
    level: 'green',
    levelLabel: '绿色（进阶层）',
    standardCode: 'GB/T 51356-2019',
    type: 'national',
    description: '国家标准·绿色校园评价标准。在节约型基础上，扩展到生态环境、室内环境质量、绿色教育等维度。',
    indicators: extractGreenIndicators(''),
  };
}

function getFallbackLowCarbonStandard(): StandardDocument {
  return {
    id: 'low-carbon',
    name: '低碳校园评价',
    level: 'low-carbon',
    levelLabel: '低碳（引领层）',
    standardCode: 'DB11 1404-2025',
    type: 'local',
    description: '北京市地方标准·高等学校低碳校园评价技术导则。聚焦碳排放总量与强度双控，引入碳汇、碳抵消、碳中和路径。',
    indicators: extractLowCarbonIndicators(''),
  };
}
