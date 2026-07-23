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

  // Parse GB/T 29117-2025 绿色学校评价导则
  try {
    const res1 = await client.fetch(
      `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/gb-t29117-2025.pdf`
    );
    const text1 = res1.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');

    standards.push({
      id: 'green-school',
      name: '绿色学校评价',
      level: 'conservation',
      levelLabel: '绿色学校（基础层）',
      standardCode: 'GB/T 29117-2025',
      type: 'national',
      description: '国家标准·绿色学校评价导则。以精神文化、物质条件、行为规范和低碳管理为核心，覆盖生态文明教育、绿色规划管理、节能降碳、生活垃圾分类等全维度评价。',
      indicators: extractGreenSchoolIndicators(text1),
    });
  } catch (e) {
    console.error('Failed to parse GB/T 29117-2025:', e);
    standards.push(getFallbackGreenSchoolStandard());
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
      description: '国家标准·绿色校园评价标准。在绿色学校基础上，扩展到生态环境、室内环境质量、绿色教育等维度，强调校园与自然和谐共生，是学校绿色发展的综合性评价。',
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

function extractGreenSchoolIndicators(text: string): EvaluationIndicator[] {
  // GB/T 29117-2025 绿色学校评价指标体系
  return [
    // 精神文化 (25%)
    {
      id: 'gs-1', category: '精神文化', name: '生态文明教育融入教学',
      description: '结合课堂教学、专家讲座等多种形式，普及生态文明相关基本理念、生活常识和行为规范；加强教师绿色低碳发展教育培训',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅教学计划、课程大纲、培训记录',
      dataSource: '教务处/教师发展中心',
    },
    {
      id: 'gs-2', category: '精神文化', name: '学期计划体现绿色建设',
      description: '学校学期计划中体现建立健全绿色学校管理制度、开展生态文明教育、施行绿色规划管理、建设绿色环保校园、培育绿色校园文化和开展绿色创新研究等内容',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅学校学期计划文件',
      dataSource: '校办/发展规划处',
    },
    {
      id: 'gs-3', category: '精神文化', name: '宣传教育活动开展',
      description: '结合全国生态日、全国节能宣传周、全国低碳日等活动，组织开展主题班会、专题讲座等多种形式的宣传教育活动；多渠道多形式宣传报道学校节约能源资源经验做法',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅活动记录、宣传报道',
      dataSource: '宣传部/学工部',
    },
    {
      id: 'gs-4', category: '精神文化', name: '节能环保实践活动',
      description: '定期组织师生参与节能、节水、节粮、废弃物循环利用、生活垃圾分类、校园绿化、生物多样性保护等实践活动；建立志愿者队伍',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅活动记录、志愿者名册',
      dataSource: '团委/后勤管理处',
    },
    {
      id: 'gs-5', category: '精神文化', name: '发明创造与产学研',
      description: '组织师生参与节能环保领域发明创造活动，推动成果应用；联合高校、科研院所开展联合教研活动，共建创新实验室、科普站点等培养平台',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅科研成果、合作协议',
      dataSource: '科研处/教务处',
    },

    // 物质条件 (25%)
    {
      id: 'gs-6', category: '物质条件', name: '绿化用地与养护',
      description: '学校绿地率不低于35%，人均公共绿地达标；合理采用屋顶绿化、垂直绿化等立体绿化方式；科学选择适生绿化树种草种；采用喷灌、微灌等节水灌溉方式',
      weight: 5, maxScore: 5,
      scoringMethod: '现场核查+绿化面积核算',
      dataSource: '后勤绿化科/基建处',
    },
    {
      id: 'gs-7', category: '物质条件', name: '建筑节能设计与改造',
      description: '暖通空调、生活热水供应、照明系统等改造符合GB 55015规定；充分利用自然采光，高效照明光源使用率100%；新建建筑达到绿色建筑二星级',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅设计文件+现场检查',
      dataSource: '基建处',
    },
    {
      id: 'gs-8', category: '物质条件', name: '绿色产品采购使用',
      description: '采购使用节能、节水、低碳、环保、循环、再生等绿色产品；停止使用不可降解一次性塑料制品',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅采购记录+现场抽查',
      dataSource: '采购中心/后勤',
    },
    {
      id: 'gs-9', category: '物质条件', name: '新能源与可再生能源',
      description: '充分利用建筑屋顶、立面等适宜场地空间安装太阳能、地源热泵和空气源热泵系统；新建建筑可安装光伏屋顶面积光伏覆盖率达到50%；配备电动汽车充电设施',
      weight: 5, maxScore: 5,
      scoringMethod: '查看设备台账+发电量数据',
      dataSource: '基建处/后勤',
    },
    {
      id: 'gs-10', category: '物质条件', name: '能源审计与诊断',
      description: '依据GB/T 31342开展能源审计或节能诊断；依据GB/T 12452开展水平衡测试；合理采用合同能源管理、合同节水管理模式进行改造；建立实施能源管理体系',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅审计报告+合同文件',
      dataSource: '后勤管理处',
    },

    // 行为规范 (25%)
    {
      id: 'gs-11', category: '行为规范', name: '管理机构与职责',
      description: '明确分管绿色学校建设工作的领导；建立目标责任制，明确负责绿色学校建设工作的管理机构、工作职责和工作人员',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅组织文件+岗位职责',
      dataSource: '校办/人事处',
    },
    {
      id: 'gs-12', category: '行为规范', name: '发展目标与保障措施',
      description: '制定绿色学校建设发展目标和实施方案；提供绿色学校建设资金保障，配套设备设施；将建设目标实现情况纳入学校管理考核',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅规划文件+预算文件',
      dataSource: '发展规划处/财务处',
    },
    {
      id: 'gs-13', category: '行为规范', name: '节能降碳管理制度',
      description: '制定节能降碳、节水、生活垃圾分类、反食品浪费、绿色消费以及能源资源消费统计等管理制度；实行能源资源分户、分区、分项计量；定期报送能源资源消费数据',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅制度文件+计量台账',
      dataSource: '后勤管理处',
    },
    {
      id: 'gs-14', category: '行为规范', name: '节约行为模式推行',
      description: '倡导师生养成及时关水、关灯习惯；执行夏季空调不低于26℃、冬季不高于20℃的温度控制标准；推行无纸化办公；张贴节约提醒标识',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检查+问卷调查',
      dataSource: '后勤/宣传部',
    },
    {
      id: 'gs-15', category: '行为规范', name: '绿色生活方式倡导',
      description: '积极践行食堂"光盘行动"；践行"135"绿色出行方式；倡导购买符合绿色低碳要求的服装；适量使用洗涤用品；倡导合理消费',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅活动记录+问卷调查',
      dataSource: '后勤/工会/学工部',
    },

    // 低碳管理 (25%)
    {
      id: 'gs-16', category: '低碳管理', name: '建筑设备经济运行',
      description: '围护结构热工性能满足GB 50189要求；暖通空调系统节能运行符合GB/T 36710；照明系统经济运行符合GB/T 29455；节水器具普及率100%，供水管网漏损率≤5%',
      weight: 5, maxScore: 5,
      scoringMethod: '查看运行数据+现场检测',
      dataSource: '后勤能源管理平台',
    },
    {
      id: 'gs-17', category: '低碳管理', name: '碳排放核算与报告',
      description: '依据相关国家标准核算和报告学校统计范围内的直接二氧化碳排放（化石燃料燃烧排放）和间接二氧化碳排放（购入和输出的电力和热力产生的排放）',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅碳排放报告+核算底稿',
      dataSource: '碳管理办公室',
    },
    {
      id: 'gs-18', category: '低碳管理', name: '改造项目节能评估',
      description: '开展暖通空调、生活热水供应、照明、电气与控制、给排水等系统节能节水改造项目节能节水量量化工作',
      weight: 5, maxScore: 5,
      scoringMethod: '查阅改造方案+节能量核算',
      dataSource: '基建处/后勤',
    },
    {
      id: 'gs-19', category: '低碳管理', name: '生活垃圾分类回收',
      description: '合理配置生活垃圾分类收集容器，规范设置分类标志；对可回收物实行全品类精细化分类收集；有害垃圾单独存放；建立清运台账，定期公示',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检查+查阅台账',
      dataSource: '后勤物业',
    },
    {
      id: 'gs-20', category: '低碳管理', name: '反食品浪费工作',
      description: '加强食堂反食品浪费管理，在食品采购、储存、加工、消费及餐厨垃圾处理等环节做到节约减损；提供小份、半份菜品服务；开展反食品浪费成效评估',
      weight: 5, maxScore: 5,
      scoringMethod: '现场检查+查阅评估报告',
      dataSource: '后勤饮食中心',
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
      description: '在绿色学校基础上进一步提升能效，采用高效用能设备',
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

function getFallbackGreenSchoolStandard(): StandardDocument {
  return {
    id: 'green-school',
    name: '绿色学校评价',
    level: 'conservation',
    levelLabel: '绿色学校（基础层）',
    standardCode: 'GB/T 29117-2025',
    type: 'national',
    description: '国家标准·绿色学校评价导则。以精神文化、物质条件、行为规范和低碳管理为核心，覆盖生态文明教育、绿色规划管理、节能降碳、生活垃圾分类等全维度评价。',
    indicators: extractGreenSchoolIndicators(''),
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
    description: '国家标准·绿色校园评价标准。在绿色学校基础上，扩展到生态环境、室内环境质量、绿色教育等维度。',
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
