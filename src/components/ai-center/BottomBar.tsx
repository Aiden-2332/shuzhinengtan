'use client';

import { useAICenterStore } from '@/stores/ai-center-store';
import { getMockWelcomeMessage } from '@/data/ai-center-mock';

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


