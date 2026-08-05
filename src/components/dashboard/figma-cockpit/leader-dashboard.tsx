"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { Cloud, Droplets, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { compositions, rankings, resources } from '@/data/leader-dashboard-data'

const CYAN = '#21c8f6', GREEN = '#37d6b0', ORANGE = '#ff9b58'
const RED = '#ff5b6e', YELLOW = '#ffd66b'

const TS = {
  contentStyle: { background: 'rgba(2,12,32,.95)', border: '1px solid rgba(0,180,255,.38)', borderRadius: 0, fontSize: 10 },
  labelStyle: { color: CYAN, fontSize: 10 },
  itemStyle: { color: '#c0e8ff', fontSize: 10 },
}
/* ─── shared tiny components ─── */
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
        <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, color }}>{value}{unit && <span style={{ fontSize: 9, color: 'rgba(140,190,230,.65)', marginLeft: 2 }}>{unit}</span>}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(to right,${color}55,${color})` }} />
      </div>
    </div>
  )
}
/* ─── data ─── */
const quotaControl = [
  { name: '已使用', value: 82.9, color: CYAN },
  { name: '剩余配额', value: 17.1, color: ORANGE },
]

const buildingRanking = [
  { name: '教学楼群', value: 22430, pct: 100 },
  { name: '学生宿舍区', value: 15280, pct: 68 },
  { name: '体育馆', value: 7920, pct: 35 },
  { name: '行政办公楼', value: 7410, pct: 33 },
  { name: '食堂', value: 6170, pct: 27.5 },
  { name: '图书馆', value: 5620, pct: 25 },
  { name: '能源中心', value: 3840, pct: 17 },
]

const reductionTargets = [
  { name: '节电措施', pct: 84.9 },
  { name: '清洁能源替代', pct: 95.0 },
  { name: '建筑节能改造', pct: 80.0 },
  { name: '绿色出行', pct: 65.0 },
]

const trendData = [
  { month: '1月', 碳排放: 12400, 减排量: 1200 },
  { month: '2月', 碳排放: 10800, 减排量: 980 },
  { month: '3月', 碳排放: 11200, 减排量: 1100 },
  { month: '4月', 碳排放: 10500, 减排量: 1050 },
  { month: '5月', 碳排放: 9800,  减排量: 1300 },
  { month: '6月', 碳排放: 11800, 减排量: 1150 },
  { month: '7月', 碳排放: 13200, 减排量: 900 },
  { month: '8月', 碳排放: 12900, 减排量: 870 },
  { month: '9月', 碳排放: 11500, 减排量: 1080 },
  { month: '10月', 碳排放: 10200, 减排量: 1250 },
  { month: '11月', 碳排放: 11800, 减排量: 1120 },
  { month: '12月', 碳排放: 12340, 减排量: 980 },
]

const renewableData = [
  { name: '光伏', value: 16.4, color: YELLOW },
  { name: '风能', value: 8.7, color: CYAN },
  { name: '其他', value: 6.5, color: GREEN },
  { name: '传统能源', value: 68.4, color: 'rgba(0,60,100,.45)' },
]

const budgetItems = [
  { name: '教学区', used: 73, budget: 45000, actual: 32850 },
  { name: '生活区', used: 89, budget: 36000, actual: 32040 },
  { name: '行政区', used: 62, budget: 18000, actual: 11160 },
  { name: '运动区', used: 78, budget: 12000, actual: 9360 },
]

const compositionColors = [RED, '#36b9da', '#f7bc31', '#70c66b', '#d7e0e7']

function ResourceIcon({ name }: { name: string }) {
  if (name === '能源消耗') return <Zap size={14} strokeWidth={2} />
  if (name === '水消耗') return <Droplets size={14} strokeWidth={2} />
  return <Cloud size={14} strokeWidth={2} />
}

function CompositionDonut({ title, items }: { title: string; items: readonly (readonly [string, number])[] }) {
  const segments = items.map(([, value], index) => {
    const start = items.slice(0, index).reduce((sum, [, amount]) => sum + amount, 0)
    const end = start + value
    return `${compositionColors[index]} ${start}% ${end}%`
  }).join(', ')

  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ marginBottom: 4, color: 'rgba(226,244,255,.92)', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{title}</div>
      <div style={{ position: 'relative', width: 62, height: 62, margin: '0 auto 5px', borderRadius: '50%', background: `conic-gradient(${segments})` }}>
        <div style={{ position: 'absolute', inset: 13, borderRadius: '50%', background: '#062039', boxShadow: 'inset 0 0 10px rgba(0,0,0,.35)' }} />
      </div>
      {items.map(([label, value], index) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, marginBottom: 2, fontSize: 8 }}>
          <span style={{ width: 5, height: 5, flexShrink: 0, background: compositionColors[index] }} />
          <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', color: 'rgba(166,208,235,.72)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          <strong style={{ flexShrink: 0, color: 'rgba(230,246,255,.92)', font: '600 9px Rajdhani, monospace' }}>{value}%</strong>
        </div>
      ))}
    </div>
  )
}

/* ─── KPI strip ─── */
export function LeaderKpi() {
  const kpis = [
    { label: '年度碳排放总量', value: '132,680', unit: 'tCO₂',    change: '+3.8%', up: true },
    { label: '人均碳排放',     value: '2.48',    unit: 'tCO₂/人', change: '-7.2%', up: false },
    { label: '单位面积碳排放', value: '0.42',    unit: 'tCO₂/m²', change: '-12.7%', up: false },
    { label: '碳减排完成率',   value: '85.3',    unit: '%',       change: '+2.1%', up: true },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, padding: '0 6px' }}>
      {kpis.map((k, i) => (
        <div key={i} className="kpi-card" style={{ padding: '7px 12px' }}>
          <div style={{ fontSize: 10, color: 'rgba(130,185,230,.7)', marginBottom: 3, letterSpacing: '.04em' }}>{k.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="kpi-value" style={{ fontSize: 21 }}>{k.value}</span>
            <span style={{ fontSize: 9, color: 'rgba(0,180,255,.6)', fontFamily: 'Rajdhani' }}>{k.unit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
            <span style={{ fontSize: 10, fontFamily: 'Rajdhani', color: k.up ? ORANGE : GREEN }}>{k.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Left overlay panel ─── */
export function LeaderLeft() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 经济控制分区 */}
      <GlassSection title="经济控制分区">
        <div
          aria-label="年度碳配额使用情况：已使用122680吨，使用率82.9%，当前低风险"
          style={{ position: 'relative', height: 132, overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 1, left: '50%', width: 112, height: 112, transform: 'translateX(-50%)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quotaControl} cx="50%" cy="50%" innerRadius={38} outerRadius={52} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {quotaControl.map((item) => <Cell key={item.name} fill={item.color} opacity={0.94} />)}
                </Pie>
                <Tooltip {...TS} formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ color: 'rgba(191,226,245,.75)', fontSize: 9, lineHeight: 1 }}>已用</span>
              <strong style={{ marginTop: 4, color: '#f4fbff', font: '700 19px/1 Rajdhani, monospace', letterSpacing: '.02em', textShadow: '0 0 10px rgba(33,200,246,.38)' }}>122,680</strong>
              <span style={{ marginTop: 4, color: 'rgba(215,239,252,.9)', font: '10px Rajdhani, monospace' }}>tCO₂</span>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 23, left: 0, width: 58, color: GREEN, textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: 12, whiteSpace: 'nowrap' }}>配额合规</strong>
            <ShieldCheck size={31} strokeWidth={1.8} style={{ margin: '8px auto 0', filter: `drop-shadow(0 0 5px ${GREEN}55)` }} />
          </div>

          <div style={{ position: 'absolute', top: 23, right: 0, width: 58, color: ORANGE, textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: 12, whiteSpace: 'nowrap' }}>成本控制</strong>
            <TrendingUp size={31} strokeWidth={2} style={{ margin: '8px auto 0', filter: `drop-shadow(0 0 5px ${ORANGE}55)` }} />
          </div>

          <div style={{ position: 'absolute', right: 48, bottom: 20, left: 48, padding: '3px 5px', border: '1px solid rgba(33,200,246,.28)', background: 'rgba(4,31,52,.82)', color: 'rgba(180,220,242,.78)', fontSize: 9, textAlign: 'center' }}>
            总配额 <span style={{ color: CYAN, font: '600 10px Rajdhani, monospace' }}>148,000 tCO₂</span>
          </div>

          <div style={{ position: 'absolute', right: 0, bottom: 0, left: 0, color: GREEN, fontSize: 10, fontWeight: 600, textAlign: 'center' }}>
            配额风险：低 <span style={{ color: 'rgba(170,216,238,.72)', fontFamily: 'Rajdhani, monospace', fontWeight: 500 }}>· 使用率 82.9%</span>
          </div>
        </div>
      </GlassSection>

      {/* 年度减排目标进度 */}
      <GlassSection title="年度减排目标进度">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(0,70,110,.45)" strokeWidth="5" />
              <circle cx="30" cy="30" r="24" fill="none" stroke={GREEN} strokeWidth="5"
                strokeDasharray={`${0.853 * Math.PI * 2 * 24} ${Math.PI * 2 * 24}`}
                style={{ filter: `drop-shadow(0 0 3px ${GREEN})` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontFamily: 'Rajdhani', fontWeight: 700, color: GREEN, lineHeight: 1 }}>85.3</span>
              <span style={{ fontSize: 8, color: 'rgba(100,200,155,.7)' }}>%</span>
            </div>
          </div>
          <div style={{ flex: 1, fontSize: 10 }}>
            <div style={{ color: 'rgba(130,180,220,.7)', marginBottom: 2 }}>目标 <span style={{ color: CYAN, fontFamily: 'Rajdhani' }}>20,000</span> tCO₂</div>
            <div style={{ color: 'rgba(130,180,220,.7)', marginBottom: 2 }}>已减排 <span style={{ color: GREEN, fontFamily: 'Rajdhani' }}>17,060</span> tCO₂</div>
            <div style={{ color: 'rgba(130,180,220,.7)' }}>剩余 <span style={{ color: ORANGE, fontFamily: 'Rajdhani' }}>2,940</span> tCO₂</div>
          </div>
        </div>
        {reductionTargets.map((item, i) => (
          <ProgressRow key={i} label={item.name} value={`${item.pct}%`} pct={item.pct}
            color={item.pct >= 90 ? GREEN : item.pct >= 75 ? CYAN : ORANGE} />
        ))}
      </GlassSection>

      {/* 重点建筑碳排放排名 */}
      <GlassSection title="重点建筑碳排放排名">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(100,150,200,.55)', marginBottom: 4 }}>
          <span>建筑</span><span>tCO₂</span>
        </div>
        {buildingRanking.map((item, i) => (
          <ProgressRow key={i}
            label={`${i + 1}. ${item.name}`}
            value={item.value.toLocaleString()}
            pct={item.pct}
            color={i === 0 ? RED : i === 1 ? ORANGE : CYAN} />
        ))}
        <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(0,100,150,.2)', display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'rgba(100,150,200,.6)' }}>合计</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: CYAN }}>132,680 tCO₂</span>
        </div>
      </GlassSection>
    </div>
  )
}

/* ─── Right overlay panel ─── */
export function LeaderRight() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <GlassSection title="资源消耗分析">
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-2px 0 5px' }}>
          <span style={{ padding: '3px 7px', border: '1px solid rgba(33,200,246,.28)', background: 'rgba(18,111,153,.62)', color: '#72e4ff', fontSize: 8 }}>全校资源总消耗</span>
          <span style={{ padding: '3px 7px', border: '1px solid rgba(33,200,246,.18)', color: 'rgba(147,190,215,.55)', fontSize: 8 }}>生均资源消耗强度</span>
        </div>
        <div style={{ border: '1px solid rgba(46,166,214,.28)', background: 'rgba(2,24,44,.45)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.35fr .75fr .75fr', padding: '4px 6px', borderBottom: '1px solid rgba(49,165,211,.26)', color: 'rgba(150,194,220,.62)', fontSize: 8 }}>
            <span>资源类型</span><span>本年累计</span><span>同比</span><span>环比</span>
          </div>
          {resources.map((item) => (
            <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.35fr .75fr .75fr', alignItems: 'center', minHeight: 25, padding: '0 6px', borderBottom: '1px solid rgba(49,165,211,.18)', fontSize: 9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, color: 'rgba(221,240,252,.88)' }}><span style={{ color: CYAN }}><ResourceIcon name={item.name} /></span>{item.name}</span>
              <strong style={{ color: '#f2fbff', font: '700 12px Rajdhani, monospace', whiteSpace: 'nowrap' }}>{item.value} <small style={{ color: 'rgba(165,200,220,.7)', fontSize: 7, fontWeight: 500 }}>{item.unit}</small></strong>
              <strong style={{ color: GREEN, font: '600 9px Rajdhani, monospace', whiteSpace: 'nowrap' }}>{item.yoy}</strong>
              <span style={{ color: RED, font: '500 9px Rajdhani, monospace', whiteSpace: 'nowrap' }}>{item.mom}</span>
            </div>
          ))}
        </div>
      </GlassSection>

      <div className="glass-section" style={{ padding: '9px 8px 7px' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {compositions.map((item) => <CompositionDonut key={item.title} title={item.title} items={item.items} />)}
        </div>
      </div>

      <div className="glass-section">
        <div className="glass-title" style={{ justifyContent: 'space-between' }}>
          <span>排放 TOP 5</span>
          <span style={{ marginLeft: 'auto', color: 'rgba(221,239,250,.82)', font: '500 9px Rajdhani, monospace', letterSpacing: 0 }}>单位：tCO₂</span>
        </div>
        <div style={{ padding: '6px 8px 7px' }}>
          {rankings.map(([name, value, color], index) => (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '22px 76px 1fr 38px', alignItems: 'center', gap: 5, minHeight: 28, borderBottom: '1px solid rgba(44,139,182,.18)' }}>
              <strong style={{ display: 'grid', width: 18, height: 18, placeItems: 'center', borderRadius: 2, background: color, color: '#fff', font: '700 12px Rajdhani, monospace' }}>{index + 1}</strong>
              <span style={{ overflow: 'hidden', color: 'rgba(222,240,250,.9)', fontSize: 9, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${value / rankings[0][1] * 100}%`, background: color }} />
              </div>
              <strong style={{ color: 'rgba(235,248,255,.94)', font: '600 10px Rajdhani, monospace', textAlign: 'right' }}>{value.toLocaleString()}</strong>
            </div>
          ))}
        </div>
      </div>

      <GlassSection title="可再生能源占比">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={renewableData} cx="50%" cy="50%" innerRadius={22} outerRadius={34} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {renewableData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip {...TS} formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
              <strong style={{ color: GREEN, font: '700 13px Rajdhani, monospace' }}>31.6%</strong>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {renewableData.slice(0, 3).map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color }} />
                <span style={{ flex: 1, color: 'rgba(150,200,240,.8)', fontSize: 10 }}>{item.name}</span>
                <strong style={{ color: item.color, font: '600 10px Rajdhani, monospace' }}>{item.value}%</strong>
              </div>
            ))}
            <div style={{ color: 'rgba(100,170,220,.6)', fontSize: 9 }}>同比 <span style={{ color: GREEN }}>↑ 4.2%</span></div>
          </div>
        </div>
      </GlassSection>

      <GlassSection title="碳预算执行情况">
        {budgetItems.map((item) => (
          <div key={item.name} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 10 }}>
              <span style={{ color: 'rgba(160,210,255,.85)' }}>{item.name}</span>
              <span style={{ color: item.used > 85 ? RED : item.used > 70 ? ORANGE : GREEN, font: '600 10px Rajdhani, monospace' }}>{item.used}%</span>
            </div>
            <div className="progress-bar" style={{ height: 7 }}>
              <div className="progress-fill" style={{ width: `${item.used}%`, background: item.used > 85 ? RED : item.used > 70 ? ORANGE : GREEN }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'grid', gap: 2, padding: 6, border: '1px solid rgba(0,120,170,.2)', background: 'rgba(0,25,55,.55)', fontSize: 9 }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(120,175,220,.65)' }}>年度总预算 <strong style={{ color: CYAN }}>148,000 tCO₂</strong></span>
          <span style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(120,175,220,.65)' }}>已使用 <strong style={{ color: ORANGE }}>122,680 tCO₂</strong></span>
          <span style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(120,175,220,.65)' }}>使用率 <strong style={{ color: GREEN }}>82.9%</strong></span>
        </div>
      </GlassSection>
    </div>
  )
}

/* ─── Bottom chart ─── */
export function LeaderBottom() {
  return (
    <div className="glass-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="glass-title">近12个月碳排放与减排趋势</div>
      <div style={{ flex: 1, padding: '4px 8px 4px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 6, right: 12, bottom: 2, left: -12 }}>
            <defs>
              <linearGradient id="btmCg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.35} /><stop offset="95%" stopColor={CYAN} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="btmRg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.38} /><stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,100,160,.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(120,175,225,.7)' }} tickLine={false} axisLine={{ stroke: 'rgba(0,100,160,.2)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(120,175,225,.7)' }} tickLine={false} axisLine={false} />
            <Tooltip {...TS} />
            <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(160,210,255,.8)' }} />
            <Area type="monotone" dataKey="碳排放" stroke={CYAN} fill="url(#btmCg)" strokeWidth={2} dot={{ r: 2, fill: CYAN }} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="减排量" stroke={GREEN} fill="url(#btmRg)" strokeWidth={2} dot={{ r: 2, fill: GREEN }} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

