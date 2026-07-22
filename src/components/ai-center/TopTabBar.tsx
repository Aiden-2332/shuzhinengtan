'use client';

import { motion } from 'framer-motion';
import { useAICenterStore, type AIModule } from '@/stores/ai-center-store';

const MODULE_TABS: { key: AIModule; label: string; icon: string; color: string }[] = [
  { key: 'prediction', label: '预测性分析', icon: '🔮', color: '#3488ff' },
  { key: 'monitoring', label: '异常监控', icon: '🚨', color: '#ff7b25' },
  { key: 'reduction', label: '减排路径', icon: '🌿', color: '#36d968' },
  { key: 'policy', label: '政策助手', icon: '🤖', color: '#9b6bff' },
];

export default function TopTabBar() {
  const activeModule = useAICenterStore((s) => s.activeModule);
  const switchModule = useAICenterStore((s) => s.switchModule);

  return (
    <div
      className="h-[60px] flex items-center px-6 gap-2 flex-shrink-0 z-10"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(8, 16, 40, 0.85)',
        borderBottom: '1px solid rgba(52, 136, 255, 0.1)',
      }}
    >
      <div className="text-lg font-bold mr-6" style={{ color: '#3488ff' }}>
        AI 智能分析中心
      </div>
      <div className="flex gap-1">
        {MODULE_TABS.map((tab) => {
          const isActive = activeModule === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => switchModule(tab.key)}
              className="relative px-5 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              style={{
                color: isActive ? '#fff' : '#8c8c8c',
                background: isActive ? 'rgba(52, 136, 255, 0.12)' : 'transparent',
              }}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                  style={{ width: 24, backgroundColor: tab.color }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
