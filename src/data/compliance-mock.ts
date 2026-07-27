// 合规凭证模块 Mock 数据
// 三套独立标准模板：GB/T 29117-2025 / GB/T 51356-2019 / DB11/T 1404-2025

// ==================== 通用类型 ====================

export type TitleType = "green-school" | "green-campus" | "low-carbon-campus";

export interface TitleTemplate {
  id: TitleType;
  name: string;
  standardCode: string;
  standardName: string;
  description: string;
  applicableTo: string;
  icon: string; // lucide icon name
  color: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  required: boolean; // 强制/可选
  description: string;
  acceptedFormats: string;
  namingRule: string;
  uploaded: boolean;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  expiryDate?: string; // ISO date, null=无过期
  status: "uploaded" | "missing" | "expired" | "expiring";
}

export interface EvaluationItem {
  id: string;
  code: string; // 标准条款编号
  name: string;
  description: string;
  maxScore: number;
  materials: MaterialItem[];
}

export interface Level1Indicator {
  id: string;
  name: string;
  weight: number; // 百分比
  items: EvaluationItem[];
}

export interface TitleStandardData {
  template: TitleTemplate;
  prerequisites: MaterialItem[];
  indicators: Level1Indicator[];
  totalScore: number;
  passScore: number;
  gradeLevels: { name: string; minScore: number; maxScore: number }[];
}

export interface ScoringResult {
  totalScore: number;
  totalMaxScore: number;
  indicatorScores: { indicatorId: string; indicatorName: string; score: number; maxScore: number; weight: number }[];
  deductions: { itemCode: string; itemName: string; materialName: string; deductedScore: number; reason: string }[];
  grade: string;
  passed: boolean;
}

export interface AlertItem {
  id: string;
  titleId: TitleType;
  materialName: string;
  indicatorName: string;
  itemCode: string;
  expiryDate: string;
  daysRemaining: number;
  severity: "expired" | "urgent" | "warning";
}

// ==================== 模板 1: GB/T 29117-2025 绿色学校（高校） ====================

const template29117: TitleTemplate = {
  id: "green-school",
  name: "绿色学校",
  standardCode: "GB/T 29117-2025",
  standardName: "绿色学校评价导则（高校版）",
  description: "国家标准，以精神文化、物质条件、行为规范和低碳管理为核心，覆盖生态文明教育、绿色规划管理、节能降碳等全维度评价。",
  applicableTo: "实施高等教育的学校",
  icon: "GraduationCap",
  color: "emerald",
};

const prerequisites29117: MaterialItem[] = [
  { id: "pr-1", name: "学校法人证书", required: true, description: "学校独立法人资格证明文件", acceptedFormats: "PDF/JPG/PNG", namingRule: "YYYY-法人证书", uploaded: true, fileName: "2025-法人证书.pdf", fileSize: "1.2MB", uploadDate: "2025-03-15", status: "uploaded" },
  { id: "pr-2", name: "办学许可证", required: true, description: "教育主管部门颁发的办学许可", acceptedFormats: "PDF/JPG/PNG", namingRule: "YYYY-办学许可证", uploaded: true, fileName: "2025-办学许可证.pdf", fileSize: "0.8MB", uploadDate: "2025-03-15", status: "uploaded" },
  { id: "pr-3", name: "近3年无行政处罚/失信证明", required: true, description: "近3年内未受到行政处罚和环境信访投诉，未列入国家信用信息严重失信主体相关名录", acceptedFormats: "PDF", namingRule: "YYYY-无处罚证明", uploaded: true, fileName: "2023-2025-无处罚证明.pdf", fileSize: "2.1MB", uploadDate: "2025-04-01", status: "uploaded" },
  { id: "pr-4", name: "设备投用满1年验收报告", required: true, description: "主要设备设施建成并投入运行使用不少于1年的验收报告", acceptedFormats: "PDF", namingRule: "YYYY-设备验收报告", uploaded: true, fileName: "2024-设备验收报告.pdf", fileSize: "3.5MB", uploadDate: "2025-02-20", status: "uploaded" },
  { id: "pr-5", name: "年度碳/能源定额完成回执", required: true, description: "完成管理部门下达的年度碳排放目标和能源资源评价指标要求的回执", acceptedFormats: "PDF", namingRule: "YYYY-定额完成回执", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
];

const indicators29117: Level1Indicator[] = [
  {
    id: "gs-spirit",
    name: "精神文化",
    weight: 25,
    items: [
      { id: "gs-s1", code: "4.3.1", name: "生态文明教育融入日常教学", description: "结合课堂教学、专家讲座等形式普及生态文明理念，加强教师绿色低碳发展教育培训", maxScore: 5, materials: [
        { id: "gs-s1-m1", name: "生态文明课程教学大纲", required: true, description: "含生态文明相关专业课程和通识课程的教学大纲", acceptedFormats: "PDF/DOC", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-生态文明-教学大纲.pdf", fileSize: "1.5MB", uploadDate: "2025-03-10", status: "uploaded" },
        { id: "gs-s1-m2", name: "教师绿色低碳培训记录", required: true, description: "教师参加绿色低碳发展教育培训的签到表、照片、培训证书", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-教师培训-记录.pdf", fileSize: "2.3MB", uploadDate: "2025-04-15", status: "uploaded" },
        { id: "gs-s1-m3", name: "生态文明普及读本", required: false, description: "学校编制的生态文明普及读本或教材", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
      { id: "gs-s2", code: "4.3.2", name: "学期计划体现绿色学校建设", description: "学校学期计划中体现绿色学校管理制度、生态文明教育、绿色规划管理等内容", maxScore: 5, materials: [
        { id: "gs-s2-m1", name: "学期工作计划", required: true, description: "含绿色学校建设责任落实和具体措施的学期计划", acceptedFormats: "PDF/DOC", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025春-学期计划.pdf", fileSize: "1.1MB", uploadDate: "2025-02-28", status: "uploaded" },
      ]},
      { id: "gs-s3", code: "4.3.3", name: "宣传教育活动开展", description: "结合全国生态日、节能宣传周等活动开展主题班会、专题讲座、知识竞赛等", maxScore: 5, materials: [
        { id: "gs-s3-m1", name: "宣传教育活动方案与总结", required: true, description: "各类宣传教育活动的方案、照片、总结报告", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-宣传活动-总结.pdf", fileSize: "3.8MB", uploadDate: "2025-06-20", status: "uploaded" },
        { id: "gs-s3-m2", name: "媒体报道与宣传材料", required: false, description: "多渠道宣传报道学校节约能源资源经验做法的材料", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-媒体报道-汇编.pdf", fileSize: "2.1MB", uploadDate: "2025-06-20", status: "uploaded" },
      ]},
      { id: "gs-s4", code: "4.3.4", name: "节能环保实践活动", description: "组织师生参与节能、节水、节粮、废弃物循环利用、垃圾分类等实践活动", maxScore: 5, materials: [
        { id: "gs-s4-m1", name: "实践活动记录", required: true, description: "节能环保实践活动的方案、照片、参与人数统计", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-实践活动-记录.pdf", fileSize: "4.2MB", uploadDate: "2025-05-30", status: "uploaded" },
        { id: "gs-s4-m2", name: "志愿者队伍名册", required: true, description: "节能环保、反食品浪费、垃圾分类等志愿者队伍名册及活动记录", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
      { id: "gs-s5", code: "4.3.5", name: "节能环保发明创造与产学研", description: "组织师生参与节能环保领域发明创造，推进产教融合、校企合作", maxScore: 5, materials: [
        { id: "gs-s5-m1", name: "发明创造活动成果清单", required: true, description: "师生参与节能环保领域发明创造活动的成果清单及应用证明", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-发明成果-清单.pdf", fileSize: "1.8MB", uploadDate: "2025-06-10", status: "uploaded" },
        { id: "gs-s5-m2", name: "产学研合作项目协议", required: false, description: "与中小学、科研院所、企业合作的协议或项目书", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-产学研-合作协议.pdf", fileSize: "2.5MB", uploadDate: "2025-04-20", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "gs-material",
    name: "物质条件",
    weight: 25,
    items: [
      { id: "gs-m1", code: "4.4.1", name: "校园绿化规划与养护", description: "绿地率≥35%，人均公共绿地≥0.8m²，采用立体绿化、节水灌溉", maxScore: 5, materials: [
        { id: "gs-m1-m1", name: "校园绿化规划图", required: true, description: "含绿地率、人均公共绿地面积计算的绿化规划图", acceptedFormats: "PDF/DWG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿化规划图.pdf", fileSize: "5.2MB", uploadDate: "2025-03-01", status: "uploaded" },
        { id: "gs-m1-m2", name: "绿化养护记录", required: true, description: "绿化养护责任人、日常养护措施、巡查记录", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿化养护-记录.pdf", fileSize: "1.3MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
      { id: "gs-m2", code: "4.4.2", name: "建筑节能设计与改造", description: "新建建筑达绿色建筑二星级，既有建筑节能改造符合GB 55015", maxScore: 5, materials: [
        { id: "gs-m2-m1", name: "绿色建筑星级证书", required: true, description: "新建建筑绿色建筑二星级及以上评价证书", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2024-绿色建筑-二星证书.pdf", fileSize: "1.8MB", uploadDate: "2024-12-01", status: "uploaded" },
        { id: "gs-m2-m2", name: "建筑节能改造验收报告", required: true, description: "暖通空调、照明、电气等系统节能改造验收报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-节能改造-验收.pdf", fileSize: "3.1MB", uploadDate: "2025-05-15", status: "uploaded" },
        { id: "gs-m2-m3", name: "照明系统检测报告", required: true, description: "高效照明光源使用率100%的检测报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
      { id: "gs-m3", code: "4.4.3", name: "绿色产品采购", description: "采购使用节能、节水、低碳、环保产品，停止使用不可降解一次性塑料制品", maxScore: 5, materials: [
        { id: "gs-m3-m1", name: "绿色产品采购清单", required: true, description: "含节能产品、节水产品、低碳环保产品的采购清单及发票", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿色采购-清单.pdf", fileSize: "2.4MB", uploadDate: "2025-06-15", status: "uploaded" },
        { id: "gs-m3-m2", name: "塑料制品禁用执行证明", required: true, description: "停止使用不可降解一次性塑料制品的制度文件及执行记录", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-禁塑-执行记录.pdf", fileSize: "0.9MB", uploadDate: "2025-03-20", status: "uploaded" },
      ]},
      { id: "gs-m4", code: "4.4.4", name: "可再生能源利用", description: "利用太阳能、地热能等新能源，新建建筑光伏覆盖率≥50%", maxScore: 5, materials: [
        { id: "gs-m4-m1", name: "可再生能源系统设计方案", required: true, description: "太阳能、地源热泵、空气源热泵系统设计文件", acceptedFormats: "PDF/DWG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-可再生能源-方案.pdf", fileSize: "4.5MB", uploadDate: "2025-02-15", status: "uploaded" },
        { id: "gs-m4-m2", name: "光伏覆盖率计算报告", required: true, description: "新建建筑可安装光伏屋顶面积光伏覆盖率≥50%的计算报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
      { id: "gs-m5", code: "4.4.5", name: "能源审计与绩效评价", description: "定期开展能源审计或节能诊断、水平衡测试，实施能源管理体系", maxScore: 5, materials: [
        { id: "gs-m5-m1", name: "能源审计报告", required: true, description: "依据GB/T 31342开展的能源审计报告或节能诊断报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-能源审计-报告.pdf", fileSize: "6.2MB", uploadDate: "2025-04-10", status: "uploaded" },
        { id: "gs-m5-m2", name: "水平衡测试报告", required: true, description: "依据GB/T 12452开展的水平衡测试报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-水平衡测试-报告.pdf", fileSize: "3.3MB", uploadDate: "2025-04-10", expiryDate: "2026-04-10", status: "uploaded" },
        { id: "gs-m5-m3", name: "能源管理体系认证证书", required: false, description: "依据GB/T 23331建立的能源管理体系认证证书", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
    ],
  },
  {
    id: "gs-behavior",
    name: "行为规范",
    weight: 25,
    items: [
      { id: "gs-b1", code: "4.5.1", name: "管理机构与岗位设置", description: "明确分管领导、管理机构、工作职责和工作人员", maxScore: 5, materials: [
        { id: "gs-b1-m1", name: "绿色学校建设组织架构文件", required: true, description: "明确分管领导、管理机构、工作职责的正式文件", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-组织架构-文件.pdf", fileSize: "0.7MB", uploadDate: "2025-01-15", status: "uploaded" },
      ]},
      { id: "gs-b2", code: "4.5.2", name: "发展目标与保障措施", description: "制定绿色学校建设发展目标和实施方案，提供资金保障", maxScore: 5, materials: [
        { id: "gs-b2-m1", name: "绿色学校建设实施方案", required: true, description: "含发展目标、资金保障、考核机制的建设实施方案", acceptedFormats: "PDF/DOC", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-建设方案.pdf", fileSize: "2.8MB", uploadDate: "2025-01-20", status: "uploaded" },
      ]},
      { id: "gs-b3", code: "4.5.3", name: "管理制度与计量体系", description: "建立节能降碳、节水、垃圾分类等管理制度，实行分户分项计量", maxScore: 5, materials: [
        { id: "gs-b3-m1", name: "节能降碳管理制度汇编", required: true, description: "含节能降碳、节水、垃圾分类、反食品浪费、绿色消费等制度", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-管理制度-汇编.pdf", fileSize: "3.5MB", uploadDate: "2025-02-10", status: "uploaded" },
        { id: "gs-b3-m2", name: "能源资源消费统计台账", required: true, description: "依据公共机构能源资源消费统计调查制度建立的统计台账", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-能源消费-台账.xlsx", fileSize: "1.2MB", uploadDate: "2025-07-01", status: "uploaded" },
      ]},
      { id: "gs-b4", code: "4.5.4", name: "节约行为模式推行", description: "养成关水关灯习惯，执行空调温度控制标准，推行无纸化办公", maxScore: 5, materials: [
        { id: "gs-b4-m1", name: "节约行为宣传标识照片", required: true, description: "办公区域、用能用水部位张贴节约用电、用水、空调温度设定等提醒标识的照片", acceptedFormats: "JPG/PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-节约标识-照片集.pdf", fileSize: "4.8MB", uploadDate: "2025-03-25", status: "uploaded" },
      ]},
      { id: "gs-b5", code: "4.5.5", name: "绿色生活方式倡导", description: "践行光盘行动、135绿色出行、旧衣公益捐赠等", maxScore: 5, materials: [
        { id: "gs-b5-m1", name: "光盘行动活动记录", required: true, description: "食堂光盘行动的活动方案、照片、成效数据", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-光盘行动-记录.pdf", fileSize: "2.1MB", uploadDate: "2025-06-15", status: "uploaded" },
        { id: "gs-b5-m2", name: "绿色出行倡议书", required: false, description: "135绿色出行方式倡议书及执行情况", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
    ],
  },
  {
    id: "gs-carbon",
    name: "低碳管理",
    weight: 25,
    items: [
      { id: "gs-c1", code: "4.6.1", name: "建筑设备经济运行管理", description: "暖通空调、照明、电气系统节能运行，节水器具普及率100%，管网漏损率≤5%", maxScore: 5, materials: [
        { id: "gs-c1-m1", name: "暖通空调系统运行记录", required: true, description: "空调系统节能运行记录，含冷却塔补水率、高效制冷机房数据", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-暖通运行-记录.xlsx", fileSize: "1.5MB", uploadDate: "2025-07-01", status: "uploaded" },
        { id: "gs-c1-m2", name: "节水器具台账", required: true, description: "节水器具普及率100%的台账及检测报告", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-节水器具-台账.pdf", fileSize: "1.1MB", uploadDate: "2025-03-30", status: "uploaded" },
        { id: "gs-c1-m3", name: "管网漏损检测报告", required: true, description: "供水管网漏损率≤5%的检测报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
      { id: "gs-c2", code: "4.6.2", name: "二氧化碳排放核算与报告", description: "核算直接和间接碳排放，核算粮食消耗、生活垃圾、交通出行碳排放", maxScore: 5, materials: [
        { id: "gs-c2-m1", name: "年度碳排放核算报告", required: true, description: "依据国家标准核算的直接和间接二氧化碳排放报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-碳排放-核算报告.pdf", fileSize: "3.2MB", uploadDate: "2025-06-30", expiryDate: "2026-06-30", status: "uploaded" },
      ]},
      { id: "gs-c3", code: "4.6.3", name: "改造项目节能节水量评估", description: "暖通空调、照明、给排水等系统节能节水改造项目量化评估", maxScore: 5, materials: [
        { id: "gs-c3-m1", name: "节能节水量评估报告", required: true, description: "改造项目节能节水量量化计算报告（参照附录C）", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-节能节水-评估.pdf", fileSize: "2.7MB", uploadDate: "2025-05-20", status: "uploaded" },
      ]},
      { id: "gs-c4", code: "4.6.4", name: "生活垃圾分类与环保回收", description: "合理配置分类容器，可回收物精细化分类，有害垃圾单独存放", maxScore: 5, materials: [
        { id: "gs-c4-m1", name: "生活垃圾分类清运台账", required: true, description: "含清运量、去向、收运处置协议的垃圾分类清运台账", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-垃圾分类-台账.xlsx", fileSize: "0.9MB", uploadDate: "2025-07-01", status: "uploaded" },
        { id: "gs-c4-m2", name: "废弃电器电子产品回收记录", required: true, description: "废弃电器电子产品和废旧家具类资产环保回收记录", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-电子回收-记录.pdf", fileSize: "1.3MB", uploadDate: "2025-06-25", status: "uploaded" },
      ]},
      { id: "gs-c5", code: "4.6.5", name: "反食品浪费工作", description: "食品采购、储存、加工、消费各环节节约减损，提供小份半份菜品", maxScore: 5, materials: [
        { id: "gs-c5-m1", name: "反食品浪费成效评估报告", required: true, description: "含食品浪费监测数据、边角料再利用率、成效评估的报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-反浪费-评估.pdf", fileSize: "1.6MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
    ],
  },
];

// ==================== 模板 2: GB/T 51356-2019 绿色校园（高校/职校） ====================

const template51356: TitleTemplate = {
  id: "green-campus",
  name: "绿色校园",
  standardCode: "GB/T 51356-2019",
  standardName: "绿色校园评价标准（高校/职校）",
  description: "国家标准，覆盖规划与生态、能源与资源、环境与健康、运行与管理、教育与推广五大维度，区分控制项与评分项。",
  applicableTo: "高等院校及职业院校",
  icon: "Building2",
  color: "teal",
};

const prerequisites51356: MaterialItem[] = [
  { id: "gc-pr-1", name: "绿色校园总体规划", required: true, description: "经批准的绿色校园总体规划文件", acceptedFormats: "PDF/DWG", namingRule: "YYYY-绿色校园总规", uploaded: true, fileName: "2024-绿色校园总规.pdf", fileSize: "8.5MB", uploadDate: "2024-06-01", status: "uploaded" },
  { id: "gc-pr-2", name: "绿色建筑星级证书", required: true, description: "校园内新建建筑绿色建筑星级评价证书", acceptedFormats: "PDF", namingRule: "YYYY-绿色建筑证书", uploaded: true, fileName: "2024-绿色建筑-证书.pdf", fileSize: "1.8MB", uploadDate: "2024-12-01", status: "uploaded" },
  { id: "gc-pr-3", name: "设施投用满1年证明", required: true, description: "主要设施设备建成并投入运行使用不少于1年的证明", acceptedFormats: "PDF", namingRule: "YYYY-设施投用证明", uploaded: true, fileName: "2025-设施投用-证明.pdf", fileSize: "0.6MB", uploadDate: "2025-01-10", status: "uploaded" },
  { id: "gc-pr-4", name: "场地安全检测报告", required: true, description: "校园场地土壤、地下水等环境安全检测报告", acceptedFormats: "PDF", namingRule: "YYYY-场地安全检测", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
];

const indicators51356: Level1Indicator[] = [
  {
    id: "gc-planning",
    name: "规划与生态",
    weight: 20,
    items: [
      { id: "gc-p1", code: "5.1.1", name: "场地生态保护与修复", description: "保护原有地形地貌、水系和植被，进行生态修复", maxScore: 4, materials: [
        { id: "gc-p1-m1", name: "场地生态评估报告", required: true, description: "校园场地原有生态状况评估及保护措施报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-生态评估-报告.pdf", fileSize: "3.2MB", uploadDate: "2025-03-15", status: "uploaded" },
      ]},
      { id: "gc-p2", code: "5.1.2", name: "绿地率与绿化方式", description: "校园绿地率达标，合理采用屋顶绿化、垂直绿化", maxScore: 4, materials: [
        { id: "gc-p2-m1", name: "绿地率核算报告", required: true, description: "含各类绿化面积统计和绿地率计算", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿地率-核算.pdf", fileSize: "1.5MB", uploadDate: "2025-03-20", status: "uploaded" },
      ]},
      { id: "gc-p3", code: "5.1.3", name: "海绵校园建设", description: "合理采用透水铺装、雨水花园、下沉绿地等海绵设施", maxScore: 4, materials: [
        { id: "gc-p3-m1", name: "海绵校园设计文件", required: true, description: "海绵校园建设方案及设计图纸", acceptedFormats: "PDF/DWG", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
    ],
  },
  {
    id: "gc-energy",
    name: "能源与资源",
    weight: 25,
    items: [
      { id: "gc-e1", code: "5.2.1", name: "建筑能耗指标", description: "校园建筑单位面积能耗达到约束值/引导值", maxScore: 5, materials: [
        { id: "gc-e1-m1", name: "建筑能耗监测数据年报", required: true, description: "各建筑分类分项能耗监测年度数据", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-能耗监测-年报.pdf", fileSize: "2.8MB", uploadDate: "2025-07-01", status: "uploaded" },
      ]},
      { id: "gc-e2", code: "5.2.2", name: "可再生能源利用率", description: "可再生能源占建筑总能耗比例", maxScore: 5, materials: [
        { id: "gc-e2-m1", name: "可再生能源利用统计表", required: true, description: "各类可再生能源利用量及占比统计", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-可再生能源-统计.pdf", fileSize: "1.3MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
      { id: "gc-e3", code: "5.2.3", name: "水资源利用效率", description: "节水器具普及率、管网漏损率、非传统水源利用率", maxScore: 5, materials: [
        { id: "gc-e3-m1", name: "水资源利用效率报告", required: true, description: "含节水器具普及率、管网漏损率、非传统水源利用率的综合报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-水资源-效率报告.pdf", fileSize: "2.1MB", uploadDate: "2025-06-25", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "gc-environment",
    name: "环境与健康",
    weight: 20,
    items: [
      { id: "gc-en1", code: "5.3.1", name: "室内环境质量", description: "室内空气质量、热湿环境、声环境、光环境达标", maxScore: 4, materials: [
        { id: "gc-en1-m1", name: "室内环境检测报告", required: true, description: "教学楼、宿舍、图书馆等主要建筑的室内环境检测报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-室内环境-检测.pdf", fileSize: "4.5MB", uploadDate: "2025-04-15", status: "uploaded" },
      ]},
      { id: "gc-en2", code: "5.3.2", name: "室外物理环境", description: "校园热岛强度、风环境、噪声环境达标", maxScore: 4, materials: [
        { id: "gc-en2-m1", name: "室外环境模拟报告", required: true, description: "校园热岛、风环境、噪声模拟分析报告", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
    ],
  },
  {
    id: "gc-operation",
    name: "运行与管理",
    weight: 20,
    items: [
      { id: "gc-o1", code: "5.4.1", name: "能源管理系统", description: "建立校园能源管理系统，实现分类分项计量与监控", maxScore: 4, materials: [
        { id: "gc-o1-m1", name: "能源管理系统验收报告", required: true, description: "校园能源管理系统的功能验收报告及运行截图", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-能管系统-验收.pdf", fileSize: "2.3MB", uploadDate: "2025-02-28", status: "uploaded" },
      ]},
      { id: "gc-o2", code: "5.4.2", name: "物业绿色管理", description: "物业管理制度含绿色校园建设目标和服务要求", maxScore: 4, materials: [
        { id: "gc-o2-m1", name: "物业绿色管理合同", required: true, description: "含绿色校园建设目标和节能节水要求的物业服务合同", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-物业合同-绿色条款.pdf", fileSize: "1.7MB", uploadDate: "2025-01-15", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "gc-education",
    name: "教育与推广",
    weight: 15,
    items: [
      { id: "gc-ed1", code: "5.5.1", name: "绿色教育课程体系", description: "开设绿色校园、可持续发展相关课程", maxScore: 3, materials: [
        { id: "gc-ed1-m1", name: "绿色教育课程清单", required: true, description: "绿色校园、可持续发展相关课程清单及教学大纲", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿色课程-清单.pdf", fileSize: "1.1MB", uploadDate: "2025-03-10", status: "uploaded" },
      ]},
      { id: "gc-ed2", code: "5.5.2", name: "绿色校园宣传与推广", description: "开展绿色校园主题宣传活动，建立绿色校园展示平台", maxScore: 3, materials: [
        { id: "gc-ed2-m1", name: "绿色校园宣传活动记录", required: true, description: "绿色校园主题宣传活动的方案、照片、总结", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-绿色宣传-记录.pdf", fileSize: "2.8MB", uploadDate: "2025-06-20", status: "uploaded" },
      ]},
    ],
  },
];

// ==================== 模板 3: DB11/T 1404-2025 北京低碳校园 ====================

const template1404: TitleTemplate = {
  id: "low-carbon-campus",
  name: "低碳校园",
  standardCode: "DB11/T 1404-2025",
  standardName: "高等学校低碳校园评价技术导则（北京地标）",
  description: "北京市地方标准，以碳排放强度为核心（30分），结合低碳管理、低碳文化、低碳运行，对标约束值/平均值/先进值自动打分。",
  applicableTo: "北京市高等学校",
  icon: "Leaf",
  color: "green",
};

const prerequisites1404: MaterialItem[] = [
  { id: "lc-pr-1", name: "学校法人资质证明", required: true, description: "学校法人证书及办学许可证", acceptedFormats: "PDF/JPG", namingRule: "YYYY-法人资质", uploaded: true, fileName: "2025-法人资质.pdf", fileSize: "1.2MB", uploadDate: "2025-03-15", status: "uploaded" },
  { id: "lc-pr-2", name: "连续3年碳台账", required: true, description: "近3年完整的碳排放核算台账", acceptedFormats: "PDF/XLS", namingRule: "YYYY-碳台账", uploaded: true, fileName: "2023-2025-碳台账.xlsx", fileSize: "3.5MB", uploadDate: "2025-06-30", status: "uploaded" },
  { id: "lc-pr-3", name: "DB11/T 1785碳排放报告", required: true, description: "依据DB11/T 1785编制的年度碳排放报告", acceptedFormats: "PDF", namingRule: "YYYY-碳排放报告", uploaded: true, fileName: "2025-碳排放-报告.pdf", fileSize: "4.2MB", uploadDate: "2025-06-30", expiryDate: "2026-06-30", status: "uploaded" },
];

const indicators1404: Level1Indicator[] = [
  {
    id: "lc-intensity",
    name: "碳排放强度",
    weight: 30,
    items: [
      { id: "lc-i1", code: "6.1.1", name: "单位建筑面积碳排放", description: "年度碳排放总量/建筑面积，对标约束值/平均值/先进值", maxScore: 10, materials: [
        { id: "lc-i1-m1", name: "建筑面积证明", required: true, description: "学校各建筑产权证或测绘报告，含各建筑分类面积", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-建筑面积-证明.pdf", fileSize: "2.8MB", uploadDate: "2025-03-01", status: "uploaded" },
        { id: "lc-i1-m2", name: "年度碳排放核算表", required: true, description: "含各排放源碳排放量的年度核算明细表", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-碳排放-核算表.xlsx", fileSize: "1.5MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
      { id: "lc-i2", code: "6.1.2", name: "人均碳排放", description: "年度碳排放总量/在校人数，对标约束值/平均值/先进值", maxScore: 10, materials: [
        { id: "lc-i2-m1", name: "在校人数统计表", required: true, description: "含本科生、硕士生、博士生、留学生等分类统计的在校人数", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-在校人数-统计.pdf", fileSize: "0.8MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
      { id: "lc-i3", code: "6.1.3", name: "碳排放强度下降率", description: "与基准年相比碳排放强度下降幅度", maxScore: 10, materials: [
        { id: "lc-i3-m1", name: "碳排放强度对比分析报告", required: true, description: "与基准年对比的碳排放强度变化趋势分析", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-碳强度-对比分析.pdf", fileSize: "1.9MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "lc-management",
    name: "低碳管理",
    weight: 25,
    items: [
      { id: "lc-m1", code: "6.2.1", name: "碳管理体系", description: "建立碳排放管理制度，设置碳管理岗位", maxScore: 8, materials: [
        { id: "lc-m1-m1", name: "碳管理制度文件", required: true, description: "碳排放管理制度、岗位职责文件", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-碳管理制度.pdf", fileSize: "1.1MB", uploadDate: "2025-01-20", status: "uploaded" },
      ]},
      { id: "lc-m2", code: "6.2.2", name: "碳监测与核算能力", description: "具备碳排放监测设备、核算软件和专业技术人员", maxScore: 8, materials: [
        { id: "lc-m2-m1", name: "碳监测设备清单", required: true, description: "碳排放监测设备清单及检定证书", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-监测设备-清单.pdf", fileSize: "1.3MB", uploadDate: "2025-03-20", status: "uploaded" },
      ]},
      { id: "lc-m3", code: "6.2.3", name: "碳减排目标与路径", description: "制定碳达峰碳中和目标及实施路径", maxScore: 9, materials: [
        { id: "lc-m3-m1", name: "碳达峰碳中和实施方案", required: true, description: "含碳达峰碳中和目标、实施路径、年度分解任务的方案", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-双碳方案.pdf", fileSize: "3.1MB", uploadDate: "2025-02-15", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "lc-culture",
    name: "低碳文化",
    weight: 20,
    items: [
      { id: "lc-c1", code: "6.3.1", name: "低碳宣传教育", description: "开展低碳主题宣传教育活动", maxScore: 10, materials: [
        { id: "lc-c1-m1", name: "低碳宣传教育活动记录", required: true, description: "低碳日、节能宣传周等活动方案、照片、参与人数", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-低碳宣传-记录.pdf", fileSize: "3.5MB", uploadDate: "2025-06-20", status: "uploaded" },
      ]},
      { id: "lc-c2", code: "6.3.2", name: "低碳行为引导", description: "倡导低碳出行、低碳消费、光盘行动等", maxScore: 10, materials: [
        { id: "lc-c2-m1", name: "低碳行为引导活动记录", required: true, description: "低碳出行、光盘行动等活动记录及成效数据", acceptedFormats: "PDF/JPG", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-低碳行为-记录.pdf", fileSize: "2.2MB", uploadDate: "2025-06-15", status: "uploaded" },
      ]},
    ],
  },
  {
    id: "lc-operation",
    name: "低碳运行",
    weight: 25,
    items: [
      { id: "lc-o1", code: "6.4.1", name: "建筑低碳运行", description: "建筑能耗在线监测、节能运行管理", maxScore: 8, materials: [
        { id: "lc-o1-m1", name: "建筑能耗在线监测系统报告", required: true, description: "建筑能耗在线监测系统运行数据年报", acceptedFormats: "PDF", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-能耗在线监测-年报.pdf", fileSize: "2.5MB", uploadDate: "2025-07-01", status: "uploaded" },
      ]},
      { id: "lc-o2", code: "6.4.2", name: "可再生能源应用", description: "太阳能、地热能等可再生能源应用比例", maxScore: 8, materials: [
        { id: "lc-o2-m1", name: "可再生能源应用统计报告", required: true, description: "各类可再生能源装机容量、发电量/供热量统计", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: true, fileName: "2025-可再生能源-应用统计.pdf", fileSize: "1.6MB", uploadDate: "2025-06-30", status: "uploaded" },
      ]},
      { id: "lc-o3", code: "6.4.3", name: "绿色交通", description: "校园新能源车辆比例、充电设施配置", maxScore: 9, materials: [
        { id: "lc-o3-m1", name: "校园车辆与充电设施统计", required: true, description: "校园公务用车新能源比例、充电桩数量及分布统计", acceptedFormats: "PDF/XLS", namingRule: "YYYY-指标名称-材料类型", uploaded: false, fileName: "", fileSize: "", uploadDate: "", status: "missing" },
      ]},
    ],
  },
];

// ==================== 评分结果 ====================

export const scoringResults: Record<TitleType, ScoringResult> = {
  "green-school": {
    totalScore: 82,
    totalMaxScore: 100,
    indicatorScores: [
      { indicatorId: "gs-spirit", indicatorName: "精神文化", score: 21, maxScore: 25, weight: 25 },
      { indicatorId: "gs-material", indicatorName: "物质条件", score: 18, maxScore: 25, weight: 25 },
      { indicatorId: "gs-behavior", indicatorName: "行为规范", score: 22, maxScore: 25, weight: 25 },
      { indicatorId: "gs-carbon", indicatorName: "低碳管理", score: 21, maxScore: 25, weight: 25 },
    ],
    deductions: [
      { itemCode: "4.4.2", itemName: "建筑节能设计与改造", materialName: "照明系统检测报告", deductedScore: 2, reason: "强制材料未上传" },
      { itemCode: "4.4.4", itemName: "可再生能源利用", materialName: "光伏覆盖率计算报告", deductedScore: 2, reason: "强制材料未上传" },
      { itemCode: "4.4.5", itemName: "能源审计与绩效评价", materialName: "能源管理体系认证证书", deductedScore: 0, reason: "可选材料未上传（不扣分）" },
      { itemCode: "4.6.1", itemName: "建筑设备经济运行管理", materialName: "管网漏损检测报告", deductedScore: 2, reason: "强制材料未上传" },
      { itemCode: "4.3.1", itemName: "生态文明教育融入日常教学", materialName: "生态文明普及读本", deductedScore: 0, reason: "可选材料未上传（不扣分）" },
      { itemCode: "4.3.4", itemName: "节能环保实践活动", materialName: "志愿者队伍名册", deductedScore: 1, reason: "强制材料未上传" },
      { itemCode: "4.5.5", itemName: "绿色生活方式倡导", materialName: "绿色出行倡议书", deductedScore: 0, reason: "可选材料未上传（不扣分）" },
      { itemCode: "4.2", itemName: "准入前置条件", materialName: "年度碳/能源定额完成回执", deductedScore: 0, reason: "准入材料缺失，当前暂以预评分展示" },
    ],
    grade: "良好",
    passed: true,
  },
  "green-campus": {
    totalScore: 68,
    totalMaxScore: 100,
    indicatorScores: [
      { indicatorId: "gc-planning", indicatorName: "规划与生态", score: 12, maxScore: 20, weight: 20 },
      { indicatorId: "gc-energy", indicatorName: "能源与资源", score: 20, maxScore: 25, weight: 25 },
      { indicatorId: "gc-environment", indicatorName: "环境与健康", score: 12, maxScore: 20, weight: 20 },
      { indicatorId: "gc-operation", indicatorName: "运行与管理", score: 16, maxScore: 20, weight: 20 },
      { indicatorId: "gc-education", indicatorName: "教育与推广", score: 8, maxScore: 15, weight: 15 },
    ],
    deductions: [
      { itemCode: "5.1.3", itemName: "海绵校园建设", materialName: "海绵校园设计文件", deductedScore: 4, reason: "强制材料未上传" },
      { itemCode: "5.3.2", itemName: "室外物理环境", materialName: "室外环境模拟报告", deductedScore: 4, reason: "强制材料未上传" },
      { itemCode: "前置", itemName: "准入控制项", materialName: "场地安全检测报告", deductedScore: 0, reason: "控制项缺失，当前暂以预评分展示" },
    ],
    grade: "合格",
    passed: true,
  },
  "low-carbon-campus": {
    totalScore: 75,
    totalMaxScore: 100,
    indicatorScores: [
      { indicatorId: "lc-intensity", indicatorName: "碳排放强度", score: 24, maxScore: 30, weight: 30 },
      { indicatorId: "lc-management", indicatorName: "低碳管理", score: 20, maxScore: 25, weight: 25 },
      { indicatorId: "lc-culture", indicatorName: "低碳文化", score: 16, maxScore: 20, weight: 20 },
      { indicatorId: "lc-operation", indicatorName: "低碳运行", score: 15, maxScore: 25, weight: 25 },
    ],
    deductions: [
      { itemCode: "6.4.3", itemName: "绿色交通", materialName: "校园车辆与充电设施统计", deductedScore: 9, reason: "强制材料未上传" },
    ],
    grade: "良好",
    passed: true,
  },
};

// ==================== 到期预警 ====================

export const alertItems: AlertItem[] = [
  { id: "al-1", titleId: "green-school", materialName: "年度碳排放核算报告", indicatorName: "二氧化碳排放核算与报告", itemCode: "4.6.2", expiryDate: "2026-06-30", daysRemaining: 342, severity: "warning" },
  { id: "al-2", titleId: "green-school", materialName: "水平衡测试报告", indicatorName: "能源审计与绩效评价", itemCode: "4.4.5", expiryDate: "2026-04-10", daysRemaining: 261, severity: "warning" },
  { id: "al-3", titleId: "low-carbon-campus", materialName: "DB11/T 1785碳排放报告", indicatorName: "准入前置材料", itemCode: "准入", expiryDate: "2026-06-30", daysRemaining: 342, severity: "warning" },
  { id: "al-4", titleId: "green-school", materialName: "设备投用满1年验收报告", indicatorName: "准入前置材料", itemCode: "准入", expiryDate: "2025-08-01", daysRemaining: 9, severity: "urgent" },
  { id: "al-5", titleId: "green-campus", materialName: "绿色建筑星级证书", indicatorName: "准入控制项", itemCode: "前置", expiryDate: "2025-06-01", daysRemaining: -52, severity: "expired" },
];

// ==================== 数据总览趋势 ====================

export interface KpiTrendCard {
  id: string;
  name: string;
  currentValue: number;
  previousValue: number;
  changeValue: number;
  changeRate: number; // 百分比，如 8.6
  trend: "up" | "down" | "flat";
  trendPositive: boolean; // 上升是否正向
  sparklineData: number[]; // 近6期迷你趋势数据
  status: "normal" | "warning" | "risk";
  description: string;
  unit?: string;
}

export interface RiskSummary {
  highRiskCount: number;
  pendingRequiredCount: number;
  expiringCount: number;
  topMissingTypes: { type: string; count: number }[];
  recentCompletionTrend: { label: string; count: number }[];
}

export interface ActionEntry {
  id: string;
  label: string;
  description: string;
  icon: string;
  urgency: "normal" | "warning" | "critical";
  action: string;
}

export function getKpiTrendCards(data: TitleStandardData): KpiTrendCard[] {
  const allMaterials: MaterialItem[] = [...data.prerequisites];
  data.indicators.forEach(ind => ind.items.forEach(it => allMaterials.push(...it.materials)));
  const total = allMaterials.length;
  const uploaded = allMaterials.filter(m => m.status === "uploaded").length;
  const required = allMaterials.filter(m => m.required).length;
  const requiredUploaded = allMaterials.filter(m => m.required && m.status === "uploaded").length;
  const missing = allMaterials.filter(m => m.status === "missing").length;
  const missingRequired = allMaterials.filter(m => m.required && m.status === "missing").length;

  return [
    {
      id: "total",
      name: "材料总数",
      currentValue: total,
      previousValue: total - 3,
      changeValue: 3,
      changeRate: Math.round(3 / (total - 3) * 1000) / 10,
      trend: "up",
      trendPositive: true,
      sparklineData: [total - 8, total - 6, total - 5, total - 3, total - 1, total],
      status: "normal",
      description: `较上期新增${3}项材料`,
      unit: "项",
    },
    {
      id: "uploaded",
      name: "已上传数 / 上传率",
      currentValue: uploaded,
      previousValue: uploaded - 5,
      changeValue: 5,
      changeRate: Math.round(5 / (uploaded - 5) * 1000) / 10,
      trend: "up",
      trendPositive: true,
      sparklineData: [uploaded - 10, uploaded - 8, uploaded - 6, uploaded - 4, uploaded - 2, uploaded],
      status: uploaded / total >= 0.9 ? "normal" : uploaded / total >= 0.7 ? "warning" : "risk",
      description: `上传率 ${Math.round(uploaded / total * 100)}%，${uploaded / total >= 0.9 ? "状态良好" : "需关注"}`,
      unit: "项",
    },
    {
      id: "required",
      name: "强制材料完成数 / 完成率",
      currentValue: requiredUploaded,
      previousValue: requiredUploaded - 2,
      changeValue: 2,
      changeRate: Math.round(2 / Math.max(1, requiredUploaded - 2) * 1000) / 10,
      trend: "up",
      trendPositive: true,
      sparklineData: [requiredUploaded - 4, requiredUploaded - 3, requiredUploaded - 3, requiredUploaded - 2, requiredUploaded - 1, requiredUploaded],
      status: requiredUploaded === required ? "normal" : required - requiredUploaded <= 2 ? "warning" : "risk",
      description: `完成率 ${Math.round(requiredUploaded / required * 100)}%，${required - requiredUploaded}项强制材料缺失`,
      unit: "项",
    },
    {
      id: "missing",
      name: "缺失材料数 / 缺失强制项",
      currentValue: missing,
      previousValue: missing + 2,
      changeValue: -2,
      changeRate: Math.round(2 / Math.max(1, missing + 2) * 1000) / 10,
      trend: "down",
      trendPositive: true, // 缺失下降 = 正向
      sparklineData: [missing + 6, missing + 5, missing + 4, missing + 3, missing + 2, missing],
      status: missingRequired > 0 ? "risk" : missing > 3 ? "warning" : "normal",
      description: `其中${missingRequired}项为强制材料缺失`,
      unit: "项",
    },
  ];
}

export function getRiskSummary(data: TitleStandardData): RiskSummary {
  const allMaterials: MaterialItem[] = [...data.prerequisites];
  data.indicators.forEach(ind => ind.items.forEach(it => allMaterials.push(...it.materials)));
  const missingRequired = allMaterials.filter(m => m.required && m.status === "missing");
  const expiring = allMaterials.filter(m => m.status === "expiring" || m.status === "expired");

  // 缺失最多的材料类型 TOP3
  const typeCount: Record<string, number> = {};
  missingRequired.forEach(m => {
    const t = m.name.includes("报告") ? "报告类" : m.name.includes("证书") ? "证书类" : m.name.includes("记录") ? "记录类" : m.name.includes("计划") ? "计划类" : "其他";
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  const topMissingTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));

  return {
    highRiskCount: missingRequired.length > 3 ? 2 : missingRequired.length > 0 ? 1 : 0,
    pendingRequiredCount: missingRequired.length,
    expiringCount: expiring.length,
    topMissingTypes,
    recentCompletionTrend: [
      { label: "周一", count: 2 },
      { label: "周二", count: 1 },
      { label: "周三", count: 3 },
      { label: "周四", count: 2 },
      { label: "周五", count: 4 },
      { label: "周六", count: 1 },
      { label: "周日", count: 3 },
    ],
  };
}

export function getActionEntries(): ActionEntry[] {
  return [
    { id: "view-missing", label: "查看缺失材料", description: "一键定位所有未上传材料清单", icon: "AlertCircle", urgency: "critical", action: "view-missing" },
    { id: "view-required", label: "强制未完成项", description: "筛选所有强制材料缺失项", icon: "ShieldCheck", urgency: "critical", action: "view-required" },
    { id: "filter-high-risk", label: "高风险单位筛选", description: "快速定位高风险学校/院区", icon: "Filter", urgency: "warning", action: "filter-high-risk" },
    { id: "go-upload", label: "进入上传明细页", description: "跳转至材料上传详细管理页", icon: "Upload", urgency: "normal", action: "go-upload" },
  ];
}

// ==================== 汇总导出 ====================

export const titleTemplates: Record<TitleType, TitleTemplate> = {
  "green-school": template29117,
  "green-campus": template51356,
  "low-carbon-campus": template1404,
};

export const standardData: Record<TitleType, TitleStandardData> = {
  "green-school": {
    template: template29117,
    prerequisites: prerequisites29117,
    indicators: indicators29117,
    totalScore: 100,
    passScore: 70,
    gradeLevels: [
      { name: "优秀", minScore: 90, maxScore: 100 },
      { name: "良好", minScore: 80, maxScore: 89 },
      { name: "合格", minScore: 70, maxScore: 79 },
      { name: "不达标", minScore: 0, maxScore: 69 },
    ],
  },
  "green-campus": {
    template: template51356,
    prerequisites: prerequisites51356,
    indicators: indicators51356,
    totalScore: 100,
    passScore: 60,
    gradeLevels: [
      { name: "三星", minScore: 85, maxScore: 100 },
      { name: "二星", minScore: 70, maxScore: 84 },
      { name: "一星", minScore: 60, maxScore: 69 },
      { name: "不达标", minScore: 0, maxScore: 59 },
    ],
  },
  "low-carbon-campus": {
    template: template1404,
    prerequisites: prerequisites1404,
    indicators: indicators1404,
    totalScore: 100,
    passScore: 60,
    gradeLevels: [
      { name: "先进", minScore: 85, maxScore: 100 },
      { name: "良好", minScore: 70, maxScore: 84 },
      { name: "达标", minScore: 60, maxScore: 69 },
      { name: "不达标", minScore: 0, maxScore: 59 },
    ],
  },
};

// 子模块列表
export const subModules = [
  { id: "upload", name: "称号材料上传中心", icon: "Upload", desc: "树形展示准入材料与指标分项材料，支持批量上传与状态管理" },
  { id: "trace", name: "指标溯源查询", icon: "Search", desc: "正向/反向双向溯源，快速定位指标与材料的对应关系" },
  { id: "score", name: "自评打分看板", icon: "Gauge", desc: "根据材料完整性自动计算预得分，展示扣分明细与达标等级" },
  { id: "archive", name: "材料档案库", icon: "Archive", desc: "按称号分独立档案夹，支持检索、预览、打包导出" },
  { id: "alert", name: "材料到期预警", icon: "Bell", desc: "年度类材料到期提醒，双渠道推送预警" },
  { id: "export", name: "导出申报全套资料", icon: "Package", desc: "一键导出整套申报归档包，含全部文件+自评表+目录清单" },
] as const;
