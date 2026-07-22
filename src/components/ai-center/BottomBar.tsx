'use client';

import { useAICenterStore } from '@/stores/ai-center-store';
import { getMockWelcomeMessage } from '@/data/ai-center-mock';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function BottomBar() {
  const activeModule = useAICenterStore((s) => s.activeModule);
  const predictionPeriod = useAICenterStore((s) => s.predictionPeriod);
  const setPredictionPeriod = useAICenterStore((s) => s.setPredictionPeriod);
  const setChatMessages = useAICenterStore((s) => s.setChatMessages);

  const renderBottomContent = () => {
    switch (activeModule) {
      case 'prediction':
        return (
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: '#8c8c8c' }}>预测周期:</span>
            {(['30d', '60d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setPredictionPeriod(period)}
                className="text-xs px-4 py-1.5 rounded-lg transition-all"
                style={{
                  color: predictionPeriod === period ? '#fff' : '#8c8c8c',
                  background: predictionPeriod === period ? 'rgba(52,136,255,0.25)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${predictionPeriod === period ? 'rgba(52,136,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {period === '30d' ? '30天' : period === '60d' ? '60天' : '90天'}
              </button>
            ))}
            <div className="w-px h-5 mx-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <button className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#3488ff', background: 'rgba(52,136,255,0.1)' }}>
              导出预测报告
            </button>
          </div>
        );

      case 'monitoring':
        return (
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: '#8c8c8c' }}>严重级别:</span>
            {['全部', '阻断', '严重', '一般', '提示'].map((level) => (
              <button
                key={level}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {level}
              </button>
            ))}
            <div className="w-px h-5 mx-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <button className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#ff7b25', background: 'rgba(255,123,37,0.1)' }}>
              批量确认
            </button>
          </div>
        );

      case 'reduction':
        return <ReductionBottomBar />;

      case 'policy':
        return (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setChatMessages([getMockWelcomeMessage()])}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: '#9b6bff', background: 'rgba(155,107,255,0.1)' }}
            >
              新建对话
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>
              导出合规报告
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="h-[72px] flex items-center px-6 flex-shrink-0 z-10"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(8, 16, 40, 0.9)',
        borderTop: '1px solid rgba(52, 136, 255, 0.1)',
      }}
    >
      {renderBottomContent()}
    </div>
  );
}

// ---- 减排模块底部栏 ----
function ReductionBottomBar() {
  const pageStatus = useAICenterStore((s) => s.reductionPageStatus);
  const selectedMeasures = useAICenterStore((s) => s.reductionSelectedMeasures);
  const adoptPlan = useAICenterStore((s) => s.adoptReductionPlan);
  const rejectPlan = useAICenterStore((s) => s.rejectReductionPlan);
  const resetPlan = useAICenterStore((s) => s.resetReductionPlan);
  const confirmAdjust = useAICenterStore((s) => s.confirmReductionAdjust);

  if (pageStatus === 'pending') {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs" style={{ color: '#8c8c8c' }}>
          已选 <span style={{ color: '#3488ff' }}>{selectedMeasures.size}</span> 项措施
        </span>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <button
          onClick={adoptPlan}
          disabled={selectedMeasures.size === 0}
          className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg transition-all disabled:opacity-30"
          style={{ color: '#36d968', background: 'rgba(54,217,104,0.12)', border: '1px solid rgba(54,217,104,0.25)' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          采纳并转项目
        </button>
        <button
          onClick={rejectPlan}
          className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg transition-all"
          style={{ color: '#ff3333', background: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)' }}
        >
          <XCircle className="w-3.5 h-3.5" />
          驳回
        </button>
      </div>
    );
  }

  if (pageStatus === 'adopted') {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs" style={{ color: '#36d968' }}>项目执行中</span>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <button
          onClick={resetPlan}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重新评估
        </button>
      </div>
    );
  }

  if (pageStatus === 'rejected') {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs" style={{ color: '#ff3333' }}>方案已驳回</span>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <button
          onClick={resetPlan}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          返回建议
        </button>
      </div>
    );
  }

  // adjusting
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs" style={{ color: '#ff7b25' }}>调整中</span>
      <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <span className="text-xs" style={{ color: '#8c8c8c' }}>
        已选 <span style={{ color: '#3488ff' }}>{selectedMeasures.size}</span> 项
      </span>
      <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <button
        onClick={confirmAdjust}
        disabled={selectedMeasures.size === 0}
        className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg transition-all disabled:opacity-30"
        style={{ color: '#ff7b25', background: 'rgba(255,123,37,0.12)', border: '1px solid rgba(255,123,37,0.25)' }}
      >
        确认调整
      </button>
      <button
        onClick={resetPlan}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        放弃
      </button>
    </div>
  );
}
