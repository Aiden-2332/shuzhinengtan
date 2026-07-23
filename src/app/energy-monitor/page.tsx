'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, ComposedChart, Bar,
} from 'recharts';
import {
  Zap, Droplets, Flame, Thermometer, AlertTriangle, Bell,
  Wifi, WifiOff, Settings, Search, ChevronDown, ChevronUp,
  Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle,
  Info, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import {
  getEnergyOverview, getLoadCurveSeries, getEnergyAlerts,
  getDeviceStatusPanel, conversionFactors,
} from '@/data/energy-three-pages-data';
import type { EnergyOverview, LoadCurveSeries, EnergyAlert, DeviceStatusPanel, DeviceItem } from '@/types/energy';

// ============================================================
// 子组件
// ============================================================

function EnergyTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const cls = 'inline-block';
  switch (type) {
    case 'electricity': return <Zap size={size} className={cls} style={{ color: '#3B82F6' }} />;
    case 'water': return <Droplets size={size} className={cls} style={{ color: '#06B6D4' }} />;
    case 'gas': return <Flame size={size} className={cls} style={{ color: '#F59E0B' }} />;
    case 'heat': return <Thermometer size={size} className={cls} style={{ color: '#EF4444' }} />;
    default: return <Activity size={size} className={cls} />;
  }
}

function EnergyTypeLabel({ type }: { type: string }) {
  switch (type) {
    case 'electricity': return '电力';
    case 'water': return '水';
    case 'gas': return '天然气';
    case 'heat': return '热力';
    default: return type;
  }
}

function formatNumber(n: number, decimals = 1): string {
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(2) + '万';
  return n.toFixed(decimals);
}

// ============================================================
// KPI 卡片
// ============================================================
function EnergyKPICard({ data }: { data: EnergyOverview }) {
  const isElectricity = data.energyType === 'electricity';
  const isHeat = data.energyType === 'heat';
  const unit = isElectricity ? 'kW' : data.energyType === 'water' ? 'm³/h' : data.energyType === 'gas' ? 'm³/h' : 'GJ/h';
  const todayUnit = isElectricity ? 'kWh' : data.energyType === 'water' ? 'm³' : data.energyType === 'gas' ? 'm³' : 'GJ';
  const monthUnit = todayUnit;
  const yearUnit = todayUnit;

  const cf = conversionFactors;
  const energyFactors = cf[data.energyType];
  const tceFactor = typeof energyFactors === 'object' ? energyFactors.coalEquivalent : 0;
  const todayTce = data.todayCumulative * tceFactor;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <EnergyTypeIcon type={data.energyType} size={22} />
        <span className="text-sm font-semibold text-foreground"><EnergyTypeLabel type={data.energyType} /></span>
        <span className="text-xs text-muted-foreground ml-auto">主校区</span>
      </div>

      {/* 实时功率 */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-0.5">实时功率</div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {isHeat ? '—' : formatNumber(data.currentPower, 1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* 累计用量 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-xs text-muted-foreground">今日</div>
          <div className="text-sm font-semibold text-foreground tabular-nums">{isHeat ? '—' : formatNumber(data.todayCumulative, 0)}</div>
          <div className="text-xs text-muted-foreground">{todayUnit}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">本月</div>
          <div className="text-sm font-semibold text-foreground tabular-nums">{isHeat ? '—' : formatNumber(data.monthCumulative, 0)}</div>
          <div className="text-xs text-muted-foreground">{monthUnit}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">年度</div>
          <div className="text-sm font-semibold text-foreground tabular-nums">{formatNumber(data.yearCumulative, 0)}</div>
          <div className="text-xs text-muted-foreground">{yearUnit}</div>
        </div>
      </div>

      {/* 同比/环比 + 标煤 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">同比</span>
          <span className={data.yoyChange < 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
            {data.yoyChange > 0 ? '+' : ''}{data.yoyChange}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">环比</span>
          <span className={data.momChange < 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
            {data.momChange > 0 ? '+' : ''}{data.momChange}%
          </span>
        </div>
        <div className="text-muted-foreground">
          今日折标煤 <span className="text-foreground font-semibold">{todayTce.toFixed(1)}</span> tce
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 负荷曲线
// ============================================================
function LoadCurveChart({ series }: { series: LoadCurveSeries[] }) {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(series.map(s => s.buildingId)));

  const toggleSeries = (id: string) => {
    const next = new Set(visibleSeries);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisibleSeries(next);
  };

  const filtered = series.filter(s => visibleSeries.has(s.buildingId));
  const timeLabels = series[0]?.data.map(p => p.timestamp.slice(11, 16)) ?? [];

  const chartData = timeLabels.map((time, i) => {
    const point: Record<string, number | string> = { time };
    filtered.forEach(s => { point[s.buildingName] = s.data[i]?.electricity ?? 0; });
    return point;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">实时负荷曲线</h3>
        <div className="flex items-center gap-2 text-xs">
          {series.map(s => (
            <button
              key={s.buildingId}
              onClick={() => toggleSeries(s.buildingId)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                visibleSeries.has(s.buildingId) ? 'bg-muted text-foreground' : 'text-muted-foreground opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.buildingName}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} unit="kW" />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          />
          {filtered.map(s => (
            <Line key={s.buildingId} type="monotone" dataKey={s.buildingName} stroke={s.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 设备面板
// ============================================================
function DevicePanel({ panel }: { panel: DeviceStatusPanel }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = panel.devices.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search && !d.deviceName.includes(search) && !d.buildingName.includes(search)) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      online: { icon: <Wifi size={12} />, label: '在线', cls: 'bg-green-100 text-green-700' },
      offline: { icon: <WifiOff size={12} />, label: '离线', cls: 'bg-red-100 text-red-700' },
      fault: { icon: <XCircle size={12} />, label: '故障', cls: 'bg-red-100 text-red-700' },
      maintenance: { icon: <Settings size={12} />, label: '维护', cls: 'bg-yellow-100 text-yellow-700' },
    };
    const s = map[status] ?? map.online;
    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${s.cls}`}>{s.icon}{s.label}</span>;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">设备状态面板</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-green-600">在线 {panel.onlineCount}</span>
          <span className="text-red-600">离线 {panel.offlineCount}</span>
          <span className="text-red-600">故障 {panel.faultCount}</span>
          <span className="text-yellow-600">维护 {panel.maintenanceCount}</span>
          <span>/ 共 {panel.totalDevices}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="搜索设备名称或楼宇..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {['all', 'online', 'offline', 'fault', 'maintenance'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'
            }`}
          >
            {s === 'all' ? '全部' : s === 'online' ? '在线' : s === 'offline' ? '离线' : s === 'fault' ? '故障' : '维护'}
          </button>
        ))}
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {filtered.slice(0, expanded ? undefined : 8).map(d => (
          <div key={d.deviceId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{d.deviceName}</span>
                {statusBadge(d.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><MapPin size={10} />{d.buildingName}</span>
                <span className="flex items-center gap-1"><Clock size={10} />{d.lastHeartbeat.slice(11, 19)}</span>
                {d.batteryLevel !== undefined && (
                  <span>电量 {d.batteryLevel}%</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground tabular-nums">{formatNumber(d.currentValue, 1)}</div>
              <div className="text-xs text-muted-foreground">{d.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mx-auto mt-2 text-xs text-primary hover:underline"
        >
          {expanded ? <><ChevronUp size={14} />收起</> : <><ChevronDown size={14} />展开全部 ({filtered.length}台)</>}
        </button>
      )}
    </div>
  );
}

// ============================================================
// 告警中心
// ============================================================
function AlertCenter({ alerts }: { alerts: EnergyAlert[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = alerts.filter(a => categoryFilter === 'all' || a.category === categoryFilter);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'energy': return <Zap size={14} />;
      case 'device': return <Settings size={14} />;
      case 'environment': return <Thermometer size={14} />;
      case 'data': return <Activity size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const levelBadge = (level: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      critical: { icon: <AlertCircle size={12} />, cls: 'bg-red-100 text-red-700' },
      warning: { icon: <AlertTriangle size={12} />, cls: 'bg-yellow-100 text-yellow-700' },
      info: { icon: <Info size={12} />, cls: 'bg-blue-100 text-blue-700' },
    };
    const s = map[level] ?? map.info;
    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${s.cls}`}>{s.icon}{level === 'critical' ? '严重' : level === 'warning' ? '警告' : '提示'}</span>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理', processing: '处理中', acknowledged: '已确认', resolved: '已解决',
    };
    return <span className="text-xs text-muted-foreground">{map[status] ?? status}</span>;
  };

  const categories = [
    { key: 'all', label: '全部', count: alerts.length },
    { key: 'energy', label: '能源异常', count: alerts.filter(a => a.category === 'energy').length },
    { key: 'device', label: '设备异常', count: alerts.filter(a => a.category === 'device').length },
    { key: 'environment', label: '环境异常', count: alerts.filter(a => a.category === 'environment').length },
    { key: 'data', label: '数据异常', count: alerts.filter(a => a.category === 'data').length },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-yellow-500" />
          告警中心
        </h3>
        <span className="text-xs text-muted-foreground">共 {alerts.length} 条</span>
      </div>

      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategoryFilter(c.key)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              categoryFilter === c.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.map(a => (
          <div key={a.id} className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-border transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground">{categoryIcon(a.category)}</span>
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                  {levelBadge(a.level)}
                  {statusBadge(a.status)}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={10} />{a.alertTime.slice(11, 19)}</span>
                  {a.buildingName && <span className="flex items-center gap-1"><MapPin size={10} />{a.buildingName}</span>}
                  {a.assignee && <span className="flex items-center gap-1"><User size={10} />{a.assignee}</span>}
                  {a.workOrderId && <span className="text-primary">工单: {a.workOrderId}</span>}
                </div>
              </div>
              {a.metricValue !== undefined && (
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold tabular-nums ${
                    a.level === 'critical' ? 'text-red-500' : a.level === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {a.metricValue}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.unit}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function EnergyMonitorPage() {
  const overview = useMemo(() => getEnergyOverview(), []);
  const loadSeries = useMemo(() => getLoadCurveSeries(), []);
  const alerts = useMemo(() => getEnergyAlerts(), []);
  const devicePanel = useMemo(() => getDeviceStatusPanel(), []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">能源监控中心</h2>
            <p className="text-xs text-muted-foreground mt-0.5">实时监测全校能源消耗、设备状态与异常告警</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={14} />
            <span>数据更新: {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* 四维 KPI 卡片 */}
        <div className="grid grid-cols-4 gap-3">
          {overview.map(o => (
            <EnergyKPICard key={o.energyType} data={o} />
          ))}
        </div>

        {/* 负荷曲线 + 设备面板 两栏 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <LoadCurveChart series={loadSeries} />
          </div>
          <div>
            <DevicePanel panel={devicePanel} />
          </div>
        </div>

        {/* 告警中心 */}
        <AlertCenter alerts={alerts} />
      </div>
    </div>
  );
}
