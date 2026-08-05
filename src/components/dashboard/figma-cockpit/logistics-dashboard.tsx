"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const CYAN = '#21c8f6', GREEN = '#37d6b0', ORANGE = '#ff9b58'
const RED = '#ff5b6e', YELLOW = '#ffd66b', PURPLE = '#a855f7', BLUE = '#4488ff'

const TS = {
  contentStyle: { background: 'rgba(2,12,32,.95)', border: '1px solid rgba(0,180,255,.38)', borderRadius: 0, fontSize: 10 },
  labelStyle: { color: CYAN, fontSize: 10 },
  itemStyle: { color: '#c0e8ff', fontSize: 10 },
}
function GlassSection({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="glass-section" style={style}>
      <div className="glass-title">{title}</div>
      <div style={{ padding: '6px 8px' }}>{children}</div>
    </div>
  )
}

function ProgressRow({ label, value, pct, color, unit = '' }: { label: string; value: string | number; pct: number; color: string; unit?: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 10 }}>
        <span style={{ color: 'rgba(160,210,255,.85)' }}>{label}</span>
        <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, color }}>{value}{unit && <span style={{ fontSize: 9, color: 'rgba(140,190,230,.6)', marginLeft: 2 }}>{unit}</span>}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(to right,${color}55,${color})` }} />
      </div>
    </div>
  )
}
/* ─── data ─── */
const energyStructure = [
  { name: '电力', value: 58.4, color: CYAN },
  { name: '天然气', value: 22.1, color: ORANGE },
  { name: '光伏', value: 16.7, color: YELLOW },
  { name: '其他', value: 2.8, color: PURPLE },
]

const itemEnergyRanking = [
  { name: '空调系统', value: 31755, pct: 100, color: CYAN },
  { name: '照明系统', value: 18920, pct: 59.6, color: BLUE },
  { name: '动力系统', value: 15640, pct: 49.2, color: GREEN },
  { name: '热水系统', value: 12380, pct: 38.9, color: ORANGE },
  { name: '电梯设备', value: 6840, pct: 21.5, color: PURPLE },
  { name: '其他设备', value: 4220, pct: 13.3, color: RED },
]

const regionRanking = [
  { name: '教学楼群', value: 34.5, pct: 100, color: ORANGE },
  { name: '学生公寓区', value: 28.2, pct: 81.7, color: CYAN },
  { name: '行政办公区', value: 18.4, pct: 53.3, color: BLUE },
  { name: '体育场馆', value: 11.6, pct: 33.6, color: GREEN },
  { name: '后勤服务区', value: 7.5, pct: 21.7, color: YELLOW },
]

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  能耗: Math.round(66 + 30 * Math.sin((i - 6) * Math.PI / 12) + (i % 4) * 2),
  负荷: Math.round(60 + 25 * Math.sin((i - 7) * Math.PI / 11) + (i % 5)),
}))

const carbonTrend = [
  { t: '6:00', v: 42 }, { t: '8:00', v: 68 }, { t: '10:00', v: 85 },
  { t: '12:00', v: 72 }, { t: '14:00', v: 91 }, { t: '16:00', v: 78 },
  { t: '18:00', v: 65 }, { t: '20:00', v: 48 }, { t: '22:00', v: 35 },
]

const greenEnergy = [
  { name: '光伏发电', color: YELLOW, value: 1234.5, pct: 16.7 },
  { name: '储能放电', color: GREEN, value: 423.2, pct: 5.7 },
  { name: '风力发电', color: BLUE, value: 168.3, pct: 2.3 },
]

const deviceStatus = [
  { name: '中央空调主机', status: 'online', load: 78, power: 156.4 },
  { name: '变电站', status: 'online', load: 65, power: 89.2 },
  { name: '锅炉房1号', status: 'warning', load: 92, power: 220.8 },
  { name: '给水泵站', status: 'online', load: 54, power: 38.6 },
  { name: '光伏逆变器', status: 'online', load: 88, power: 124.3 },
  { name: '冷却塔组', status: 'error', load: 0, power: 0 },
]

const alerts = [
  { level: 'error', text: '冷却塔3号故障停机', time: '10:32', building: '能源中心' },
  { level: 'warning', text: '锅炉房1号负荷过高', time: '11:15', building: '锅炉房' },
  { level: 'warning', text: '教学楼B能耗异常', time: '09:48', building: '教学楼B' },
  { level: 'info', text: '光伏发电效率下降', time: '08:22', building: '屋顶光伏' },
  { level: 'info', text: '宿舍楼D用水量偏高', time: '07:55', building: '宿舍D' },
]

/* ─── KPI strip ─── */
export function LogisticsKpi() {
  const kpis = [
    { label: '今日综合能耗', value: '132.6', unit: 'tce',   change: '-4.2%', up: false, color: CYAN },
    { label: '今日用电量',   value: '89.2',  unit: 'MWh',   change: '-2.8%', up: false, color: CYAN },
    { label: '今日用水量',   value: '24.8',  unit: '万m³',  change: '+1.3%', up: true,  color: BLUE },
    { label: '今日用气量',   value: '3.17',  unit: '万m³',  change: '-6.1%', up: false, color: PURPLE },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, padding: '0 6px' }}>
      {kpis.map((k, i) => (
        <div key={i} className="kpi-card" style={{ padding: '7px 12px' }}>
          <div style={{ fontSize: 10, color: 'rgba(130,185,230,.7)', marginBottom: 3 }}>{k.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="kpi-value" style={{ fontSize: 21, color: k.color, textShadow: `0 0 10px ${k.color}80` }}>{k.value}</span>
            <span style={{ fontSize: 9, color: 'rgba(0,180,255,.6)', fontFamily: 'Rajdhani' }}>{k.unit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
            <span style={{ fontSize: 10, fontFamily: 'Rajdhani', color: k.up ? RED : GREEN }}>{k.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Left panel ─── */
export function LogisticsLeft() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 能源结构分析 */}
      <GlassSection title="能源结构分析">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 76, height: 76, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={energyStructure} cx="50%" cy="50%" innerRadius={23} outerRadius={36} dataKey="value" stroke="none">
                  {energyStructure.map((e, i) => <Cell key={i} fill={e.color} opacity={0.88} />)}
                </Pie>
                <Tooltip {...TS} formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(100,150,200,.55)', marginBottom: 4 }}>
              综合能耗 <span style={{ fontFamily: 'Rajdhani', color: CYAN, fontSize: 11, fontWeight: 700 }}>132.6 tce</span>
            </div>
            {energyStructure.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'rgba(150,200,240,.8)', flex: 1 }}>{item.name}</span>
                <span style={{ fontSize: 9, fontFamily: 'Rajdhani', color: item.color, fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
            <div style={{ marginTop: 3, fontSize: 9, color: 'rgba(100,160,210,.6)' }}>
              可再生占比 <span style={{ color: GREEN }}>16.7%</span> <span style={{ color: GREEN }}>↑3.1%</span>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* 分项能耗排名 */}
      <GlassSection title="分项能耗排名">
        {itemEnergyRanking.map((item, i) => (
          <ProgressRow key={i} label={`${i + 1}. ${item.name}`} value={item.value.toLocaleString()} pct={item.pct} color={item.color} unit="kWh" />
        ))}
      </GlassSection>

      {/* 区域能耗排名 */}
      <GlassSection title="区域能耗排名">
        {regionRanking.map((item, i) => (
          <ProgressRow key={i} label={item.name} value={item.value} pct={item.pct} color={item.color} unit="tce" />
        ))}
        <div style={{ marginTop: 3, paddingTop: 3, borderTop: '1px solid rgba(0,100,150,.18)', display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'rgba(100,150,200,.6)' }}>合计</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: CYAN }}>100.2 tce</span>
        </div>
      </GlassSection>
    </div>
  )
}

/* ─── Right panel ─── */
export function LogisticsRight() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 今日碳排放趋势 */}
      <GlassSection title="今日碳排放趋势">
        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={carbonTrend} margin={{ top: 4, right: 6, bottom: 0, left: -26 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,100,160,.14)" />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: 'rgba(100,160,220,.6)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'rgba(100,160,220,.6)' }} tickLine={false} axisLine={false} />
              <Tooltip {...TS} />
              <Line type="monotone" dataKey="v" stroke={CYAN} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="排放(tCO₂e)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassSection>

      {/* 绿色能源使用情况 */}
      <GlassSection title="绿色能源使用情况">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
            <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(0,70,110,.4)" strokeWidth="6" />
              <circle cx="34" cy="34" r="28" fill="none" stroke={YELLOW} strokeWidth="6"
                strokeDasharray={`${0.167 * Math.PI * 2 * 28} ${Math.PI * 2 * 28}`}
                style={{ filter: `drop-shadow(0 0 3px ${YELLOW})` }} />
              <circle cx="34" cy="34" r="28" fill="none" stroke={GREEN} strokeWidth="6"
                strokeDasharray={`${0.057 * Math.PI * 2 * 28} ${Math.PI * 2 * 28}`}
                strokeDashoffset={`${-(0.167 * Math.PI * 2 * 28)}`}
                style={{ filter: `drop-shadow(0 0 3px ${GREEN})` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontFamily: 'Rajdhani', fontWeight: 700, color: GREEN }}>16.7</span>
              <span style={{ fontSize: 8, color: 'rgba(100,200,150,.7)' }}>%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {greenEnergy.map((item, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color }} />
                    <span style={{ color: 'rgba(150,200,240,.8)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: 'Rajdhani', color: item.color, fontWeight: 600 }}>{item.value}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: `linear-gradient(to right,${item.color}55,${item.color})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassSection>

      {/* 设备运行状态 */}
      <GlassSection title="设备运行状态">
        {deviceStatus.map((dev, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0', borderBottom: '1px solid rgba(0,80,120,.14)' }}>
            <span className={`status-dot status-${dev.status}`} />
            <span style={{ fontSize: 10, color: 'rgba(155,208,255,.85)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.name}</span>
            {dev.status !== 'error' ? (
              <>
                <div style={{ width: 30, height: 4, background: 'rgba(0,45,80,.55)', flexShrink: 0 }}>
                  <div style={{ height: '100%', width: `${dev.load}%`, background: dev.load > 85 ? RED : dev.load > 70 ? ORANGE : GREEN }} />
                </div>
                <span style={{ fontSize: 9, fontFamily: 'Rajdhani', color: 'rgba(130,185,225,.75)', flexShrink: 0, width: 38, textAlign: 'right' }}>{dev.power}kW</span>
              </>
            ) : (
              <span style={{ fontSize: 9, color: RED, fontFamily: 'Rajdhani' }}>FAULT</span>
            )}
          </div>
        ))}
        <div style={{ marginTop: 4, display: 'flex', gap: 10, fontSize: 9 }}>
          <span><span className="status-dot status-online" style={{ marginRight: 3 }} /><span style={{ color: 'rgba(120,175,220,.6)' }}>正常 {deviceStatus.filter(d => d.status === 'online').length}</span></span>
          <span><span className="status-dot status-warning" style={{ marginRight: 3 }} /><span style={{ color: 'rgba(120,175,220,.6)' }}>告警 {deviceStatus.filter(d => d.status === 'warning').length}</span></span>
          <span><span className="status-dot status-error" style={{ marginRight: 3 }} /><span style={{ color: 'rgba(120,175,220,.6)' }}>故障 {deviceStatus.filter(d => d.status === 'error').length}</span></span>
        </div>
      </GlassSection>

      {/* 实时告警 */}
      <GlassSection title="实时告警">
        {alerts.map((alert, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0', borderBottom: '1px solid rgba(0,75,115,.14)' }}>
            <span className="alert-dot" style={{
              background: alert.level === 'error' ? RED : alert.level === 'warning' ? ORANGE : CYAN,
              animationDelay: `${i * 0.5}s`,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: alert.level === 'error' ? '#ff8899' : alert.level === 'warning' ? '#ffb070' : 'rgba(160,210,255,.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {alert.text}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(100,150,200,.5)' }}>{alert.building}</div>
            </div>
            <span style={{ fontSize: 9, fontFamily: 'Rajdhani', color: 'rgba(100,150,200,.5)', flexShrink: 0 }}>{alert.time}</span>
          </div>
        ))}
      </GlassSection>
    </div>
  )
}

/* ─── Bottom chart ─── */
export function LogisticsBottom() {
  return (
    <div className="glass-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="glass-title">24小时能耗与负荷趋势</div>
      <div style={{ flex: 1, padding: '4px 8px 4px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 6, right: 12, bottom: 2, left: -12 }}>
            <defs>
              <linearGradient id="logEg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.38} /><stop offset="95%" stopColor={CYAN} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="logLg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.38} /><stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,100,160,.1)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'rgba(120,175,225,.7)' }} tickLine={false} axisLine={{ stroke: 'rgba(0,100,160,.2)' }} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(120,175,225,.7)' }} tickLine={false} axisLine={false} />
            <Tooltip {...TS} />
            <Area type="monotone" dataKey="能耗" stroke={CYAN} fill="url(#logEg)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Area type="monotone" dataKey="负荷" stroke={ORANGE} fill="url(#logLg)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

