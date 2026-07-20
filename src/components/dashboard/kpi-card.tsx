'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  subValue?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  unit,
  change,
  changeLabel,
  trend,
  status,
  icon,
  subValue,
  className
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    // 对于排放数据，上升是坏的（红色），下降是好的（绿色）
    if (trend === 'up') return 'text-red-500';
    if (trend === 'down') return 'text-green-500';
    return 'text-slate-500';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'danger': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return '';
    }
  };

  return (
    <Card className={cn('kpi-card', getStatusColor(), className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="data-number text-3xl text-slate-900">{value}</span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
            {subValue && (
              <p className="text-xs text-slate-400 mt-1">{subValue}</p>
            )}
            {(change !== undefined || changeLabel) && (
              <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
                {trend && getTrendIcon()}
                {change !== undefined && (
                  <span className="font-medium">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-slate-500">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 风险等级卡片
interface RiskCardProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action?: string;
  onClick?: () => void;
}

export function RiskCard({ level, title, description, action, onClick }: RiskCardProps) {
  const levelConfig = {
    low: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: '低风险' },
    medium: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: '中风险' },
    high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', label: '高风险' },
    critical: { bg: 'bg-red-100', border: 'border-red-300', badge: 'bg-red-200 text-red-800', label: '严重' }
  };

  const config = levelConfig[level];

  return (
    <Card className={cn(config.bg, config.border, 'cursor-pointer transition-all hover:shadow-md')} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge className={config.badge}>{config.label}</Badge>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
            {action && (
              <p className="text-sm text-blue-600 mt-2 hover:underline">{action} →</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 状态徽章
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <Badge variant="outline" className={cn('font-normal', styles[status])}>
      {children}
    </Badge>
  );
}