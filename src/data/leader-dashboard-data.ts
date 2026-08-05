export const leaderKPIs = [
  { label: "年度碳排放", value: "12,680", unit: "tCO₂" },
  { label: "配额消耗", value: "86", unit: "%" },
  { label: "剩余配额", value: "1,660", unit: "tCO₂" },
  { label: "排放强度", value: "12.8", unit: "kgCO₂/m²" },
  { label: "数据完整率", value: "96.5", unit: "%" },
] as const;
export const emissionSources = [
  { name: "空调系统", value: 41, color: "#38bdf8" }, { name: "照明系统", value: 19, color: "#fbbf24" },
  { name: "锅炉/供热", value: 14, color: "#2dd4bf" }, { name: "动力系统", value: 12, color: "#94a3b8" },
  { name: "其他", value: 14, color: "#d1d5db" },
];
export const risks = [
  { label: "配额缺口预估", value: "+400", unit: "tCO₂", tone: "red" },
  { label: "剩余配额月度分配", value: "415", unit: "tCO₂/月", tone: "white" },
  { label: "异常建筑", value: "3", unit: "栋", tone: "white" },
  { label: "超标建筑", value: "0", unit: "栋", tone: "green" },
];
export const resources = [
  { name: "碳排放", value: "12,680", unit: "tCO₂", yoy: "▼ -8.6%", mom: "▲ 2.3%" },
  { name: "能源消耗", value: "26,450", unit: "MWh", yoy: "▼ -6.2%", mom: "▲ 1.8%" },
  { name: "水消耗", value: "128,600", unit: "m³", yoy: "▼ -4.1%", mom: "▲ 3.2%" },
];
export const compositions = [
  { title: "碳排放组成", items: [["实验楼",34],["宿舍",27],["教学楼",20],["食堂",11],["体育馆",8]] },
  { title: "能耗组成", items: [["实验楼",31],["宿舍",28],["教学楼",21],["食堂",11],["体育馆",9]] },
  { title: "水耗组成", items: [["宿舍",36],["教学楼",25],["实验楼",18],["食堂",13],["体育馆",8]] },
] as const;
export const rankings = [["科研楼A",2850,"#f45b62"],["主教学楼",2400,"#f08a28"],["机械学院楼",2200,"#edbd32"],["第一教学楼",1850,"#70c66b"],["信息学院楼",1650,"#21b9ba"]] as const;
export const trend = {
  actual:[1420,2180,3020,3980,5120,6480,7850,8980,10200,11350,12080,12680],
  target:[1550,2400,3300,4300,5500,6900,8300,9500,10800,12000,12800,14200],
  forecast:[1380,2100,2950,3850,4980,6250,7580,8650,9850,10900,11500,11800],
};
