'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import {
  getMockPredictionCurve, getMockHolidayPlans, getMockRiskCalendar,
  getMockAnomalies, getMockNotifications, getMockRealtimeStream,
  getMockReductionBubbles, getMockOptimizationPath, getMockCostScenarios,
  getMockComplianceChecks, getMockPolicyChanges, getMockWelcomeMessage,
} from '@/data/ai-center-mock';
import TopTabBar from '@/components/ai-center/TopTabBar';
import PredictionPanel from '@/components/ai-center/PredictionPanel';
import PredictionRight from '@/components/ai-center/PredictionRight';
import MonitoringPanel from '@/components/ai-center/MonitoringPanel';
import MonitoringRight from '@/components/ai-center/MonitoringRight';
import PolicyPanel from '@/components/ai-center/PolicyPanel';
import PolicyRight from '@/components/ai-center/PolicyRight';
import BottomBar from '@/components/ai-center/BottomBar';
import AISuggestionPage from '@/app/ai-suggestion/page';
import { useRealtimeNow } from '@/hooks/use-realtime-now';

export default function AICenterPage() {
  const nowMs = useRealtimeNow();
  const activeModule = useAICenterStore((s) => s.activeModule);
  const setPredictionCurve = useAICenterStore((s) => s.setPredictionCurve);
  const setHolidayPlans = useAICenterStore((s) => s.setHolidayPlans);
  const setRiskCalendar = useAICenterStore((s) => s.setRiskCalendar);
  const setAnomalies = useAICenterStore((s) => s.setAnomalies);
  const setNotifications = useAICenterStore((s) => s.setNotifications);
  const setReductionBubbles = useAICenterStore((s) => s.setReductionBubbles);
  const setReductionPath = useAICenterStore((s) => s.setReductionPath);
  const setCostScenarios = useAICenterStore((s) => s.setCostScenarios);
  const setComplianceChecks = useAICenterStore((s) => s.setComplianceChecks);
  const setPolicyChanges = useAICenterStore((s) => s.setPolicyChanges);
  const setChatMessages = useAICenterStore((s) => s.setChatMessages);
  const predictionPeriod = useAICenterStore((s) => s.predictionPeriod);
  const optimizationConstraints = useAICenterStore((s) => s.optimizationConstraints);

  // 初始化加载所有模块数据
  useEffect(() => {
    setReductionBubbles(getMockReductionBubbles());
    setReductionPath(getMockOptimizationPath(optimizationConstraints.budget));
    setCostScenarios(getMockCostScenarios());
    setComplianceChecks(getMockComplianceChecks());
    setPolicyChanges(getMockPolicyChanges());
    setChatMessages([getMockWelcomeMessage()]);
  }, []);

  useEffect(() => {
    if (nowMs === null) return;
    const now = new Date(nowMs);
    setPredictionCurve(getMockPredictionCurve(predictionPeriod, now));
    setHolidayPlans(getMockHolidayPlans(now));
    setRiskCalendar(getMockRiskCalendar(now));
    setAnomalies(getMockAnomalies(now));
    setNotifications(getMockNotifications(now));
  }, [nowMs, predictionPeriod, setPredictionCurve, setHolidayPlans, setRiskCalendar, setAnomalies, setNotifications]);

  // 实时数据流模拟
  useEffect(() => {
    const setRealtimeStream = useAICenterStore.getState().setRealtimeStream;
    const interval = setInterval(() => {
      setRealtimeStream(getMockRealtimeStream());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 预测周期变化时更新
  useEffect(() => {
    setPredictionCurve(getMockPredictionCurve(predictionPeriod, nowMs === null ? new Date() : new Date(nowMs)));
  }, [predictionPeriod, nowMs, setPredictionCurve]);

  const leftPanel = () => {
    switch (activeModule) {
      case 'prediction': return <PredictionPanel key="prediction" />;
      case 'monitoring': return <MonitoringPanel key="monitoring" />;
      case 'policy': return <PolicyPanel key="policy" />;
      case 'suggestion': return null;
    }
  };

  const rightPanel = () => {
    switch (activeModule) {
      case 'prediction': return <PredictionRight key="prediction" />;
      case 'monitoring': return <MonitoringRight key="monitoring" />;
      case 'policy': return <PolicyRight key="policy" />;
      case 'suggestion': return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #081028, #0d1b3d)' }}>
      {/* 顶部 Tab 栏 */}
      <TopTabBar />

      {/* AI减排建议 - 全页渲染 */}
      {activeModule === 'suggestion' ? (
        <div className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 60px - 72px)' }}>
          <AISuggestionPage />
        </div>
      ) : (
        <>
          {/* 主体双栏 */}
          <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 60px - 72px)' }}>
            {/* 左侧面板 32% */}
            <div className="w-[32%] min-w-[380px] border-r overflow-y-auto" style={{ borderColor: 'rgba(52,136,255,0.1)' }}>
              <AnimatePresence mode="wait">
                {leftPanel()}
              </AnimatePresence>
            </div>

            {/* 右侧主面板 68% */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {rightPanel()}
              </AnimatePresence>
            </div>
          </div>

          {/* 底部操作栏 */}
          <BottomBar />
        </>
      )}

      {/* 水印 */}
      <div className="fixed bottom-2 right-4 text-xs select-none pointer-events-none z-50" style={{ color: 'rgba(140,140,140,0.3)' }}>
        Demo模拟数据 仅课题演示
      </div>
    </div>
  );
}
