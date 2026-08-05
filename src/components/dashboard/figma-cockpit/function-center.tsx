"use client";

import { useRouter } from "next/navigation";

const CYAN = '#00d4ff', GREEN = '#00e090', ORANGE = '#ff8c42'
const YELLOW = '#ffd700', PURPLE = '#a855f7', RED = '#ff4466'

type FunctionDefinition = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  desc: string;
  stats: Array<{ label: string; value: string }>;
  status: string;
  statusColor: string;
  links: Array<{ label: string; href: string }>;
};

const functions: FunctionDefinition[] = [
  {
    key: 'energy', title: '能源管理', subtitle: 'Energy Management', icon: '⚡', color: CYAN,
    desc: '整合能源监测与能源诊断，覆盖设备实时监控、能耗异常定位、趋势分析与节能诊断',
    stats: [{ label: '监测点位', value: '1,248个' }, { label: '今日能耗', value: '89.2 MWh' }, { label: '节能率', value: '12.7%' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '能源监测', href: '/energy-monitor' }, { label: '能源诊断', href: '/energy-diagnosis' }],
  },
  {
    key: 'carbon', title: '碳核算工作台', subtitle: 'Carbon Accounting', icon: '⬡', color: GREEN,
    desc: '碳排放数据采集、核算与报告，覆盖范围一、二、三排放源，支持国标及ISO14064',
    stats: [{ label: '核算周期', value: '月度' }, { label: '数据完整率', value: '98.6%' }, { label: '核算边界', value: '校区全域' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '进入工作台', href: '/calculation' }],
  },
  {
    key: 'evaluation', title: '绿色低碳校园评价', subtitle: 'Green Campus Evaluation', icon: '◈', color: ORANGE,
    desc: '围绕绿色校园建设指标开展评价、对标与改进，形成低碳校园建设成果总览',
    stats: [{ label: '评价维度', value: '6项' }, { label: '当前得分', value: '86.5' }, { label: '改进任务', value: '12项' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '进入评价', href: '/evaluation' }],
  },
  {
    key: 'asset', title: '碳资产管理', subtitle: 'Carbon Asset Management', icon: '◇', color: YELLOW,
    desc: '管理碳配额、履约缺口、交易与碳资产价值，支持履约决策和资产增值分析',
    stats: [{ label: '年度配额', value: '148,000' }, { label: '履约进度', value: '85.3%' }, { label: '资产估值', value: '826万' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '进入资产管理', href: '/asset' }],
  },
  {
    key: 'compliance', title: '合规凭证看板', subtitle: 'Compliance Evidence', icon: '▣', color: PURPLE,
    desc: '集中管理合规凭证、材料版本、到期预警与MRV证据链，支撑核查和履约审计',
    stats: [{ label: '凭证总数', value: '286份' }, { label: '完整率', value: '96.8%' }, { label: '待补材料', value: '7份' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '进入合规看板', href: '/compliance' }],
  },
  {
    key: 'ai', title: 'AI智能分析中心', subtitle: 'AI Analysis Center', icon: '◎', color: RED,
    desc: '提供预测性分析、异常监控、政策助手与AI减排建议，辅助校园碳管理决策',
    stats: [{ label: '分析模型', value: '4类' }, { label: '今日洞察', value: '28条' }, { label: '建议采纳率', value: '72.6%' }],
    status: '正常运行', statusColor: GREEN,
    links: [{ label: '进入AI中心', href: '/ai-center' }],
  },
]

export default function FunctionCenter() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(2,1fr)',
      gap: 10,
      height: '100%',
    }}>
      {functions.map(fn => <FunctionCard key={fn.key} fn={fn} />)}
    </div>
  )
}
function FunctionCard({ fn }: { fn: FunctionDefinition }) {
  const router = useRouter()
  const primaryHref = fn.links[0].href

  return (
    <div
      className="panel"
      role="link"
      tabIndex={0}
      aria-label={`进入${fn.title}`}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'all .28s' }}
      onClick={() => router.push(primaryHref)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          router.push(primaryHref)
        }
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = `${fn.color}70`
        el.style.boxShadow = `0 0 28px ${fn.color}20, inset 0 0 18px ${fn.color}07`
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(0,180,255,.22)'
        el.style.boxShadow = 'inset 0 0 24px rgba(0,200,255,.04), 0 0 18px rgba(0,200,255,.07)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Top accent */}
      <div style={{ height: 2, background: `linear-gradient(to right, transparent, ${fn.color}, transparent)`, opacity: .55 }} />

      {/* Header */}
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${fn.color}10`, border: `1px solid ${fn.color}38`,
          clipPath: 'polygon(5px 0%,calc(100% - 5px) 0%,100% 5px,100% calc(100% - 5px),calc(100% - 5px) 100%,5px 100%,0% calc(100% - 5px),0% 5px)',
          fontSize: 20, flexShrink: 0,
        }}>
          <span style={{ filter: `drop-shadow(0 0 4px ${fn.color})` }}>{fn.icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Noto Sans SC', color: fn.color, textShadow: `0 0 7px ${fn.color}55`, letterSpacing: '.07em' }}>
              {fn.title}
            </div>
            <div style={{
              fontSize: 9, padding: '2px 6px',
              background: `${fn.statusColor}16`, border: `1px solid ${fn.statusColor}44`,
              color: fn.statusColor,
              clipPath: 'polygon(3px 0%,calc(100% - 3px) 0%,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0% calc(100% - 3px),0% 3px)',
            }}>{fn.status}</div>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(100,155,215,.5)', fontFamily: 'Rajdhani', letterSpacing: '.1em', marginTop: 2 }}>{fn.subtitle}</div>
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${fn.color}28, transparent)`, margin: '0 14px' }} />

      <div style={{ padding: '8px 14px', fontSize: 11, color: 'rgba(145,195,238,.7)', lineHeight: 1.65, flex: 1 }}>
        {fn.desc}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(0,100,150,.14)' }}>
        {fn.stats.map((stat, i) => (
          <div key={i} style={{
            padding: '7px 10px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(0,100,150,.14)' : 'none',
          }}>
            <div style={{ fontSize: 12, fontFamily: 'Rajdhani', fontWeight: 700, color: fn.color, textShadow: `0 0 5px ${fn.color}45` }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: 'rgba(100,150,200,.6)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '6px 14px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${fn.links.length}, minmax(0, 1fr))`, gap: 6 }}>
          {fn.links.map(link => (
            <button
              key={link.href}
              type="button"
              onClick={event => {
                event.stopPropagation()
                router.push(link.href)
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '5px', background: `${fn.color}0e`, border: `1px solid ${fn.color}30`,
                clipPath: 'polygon(5px 0%,calc(100% - 5px) 0%,100% 5px,100% calc(100% - 5px),calc(100% - 5px) 100%,5px 100%,0% calc(100% - 5px),0% 5px)',
                fontSize: 11, color: fn.color, fontFamily: 'Noto Sans SC', fontWeight: 600, letterSpacing: '.08em', cursor: 'pointer',
              }}
            >{link.label} →</button>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 7, right: 7, width: 10, height: 10, borderTop: `1px solid ${fn.color}55`, borderRight: `1px solid ${fn.color}55` }} />
      <div style={{ position: 'absolute', bottom: 7, left: 7, width: 10, height: 10, borderBottom: `1px solid ${fn.color}55`, borderLeft: `1px solid ${fn.color}55` }} />
    </div>
  )
}
