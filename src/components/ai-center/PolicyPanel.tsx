'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import { QUICK_QUESTIONS, getMockChatResponse } from '@/data/ai-center-mock';

export default function PolicyPanel() {
  const chatMessages = useAICenterStore((s) => s.chatMessages);
  const isTyping = useAICenterStore((s) => s.isTyping);
  const sendChatMessage = useAICenterStore((s) => s.sendChatMessage);
  const setChatMessages = useAICenterStore((s) => s.setChatMessages);
  const setIsTyping = useAICenterStore((s) => s.setIsTyping);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    sendChatMessage(text);
    setInput('');

    // 模拟 AI 回复
    setTimeout(() => {
      const response = getMockChatResponse(text);
      const aiMsg = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant' as const,
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        confidence: response.confidence,
      };
      setChatMessages([...useAICenterStore.getState().chatMessages, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4"
    >
      {/* 对话窗口 */}
      <div
        className="rounded-xl flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(52,136,255,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          height: 'calc(100vh - 60px - 72px - 32px)',
        }}
      >
        {/* 顶部提示 */}
        <div className="p-3 text-center text-[10px] border-b" style={{ color: '#8c8c8c', borderColor: 'rgba(52,136,255,0.1)' }}>
          AI 回答仅供参考，请以正式政策文件为准
        </div>

        {/* 快捷问题 */}
        <div className="p-3 flex flex-wrap gap-1.5 border-b" style={{ borderColor: 'rgba(52,136,255,0.1)' }}>
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSend(q.question)}
              className="text-[10px] px-2 py-1 rounded-full transition-colors"
              style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {q.icon} {q.question.length > 12 ? q.question.slice(0, 12) + '...' : q.question}
            </button>
          ))}
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[90%] rounded-xl p-3"
                style={{
                  background: msg.role === 'user' ? 'rgba(52,136,255,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(52,136,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="text-xs whitespace-pre-wrap" style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {msg.sources.map((src, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#3488ff', background: 'rgba(52,136,255,0.1)' }}>
                        {src.title}
                      </span>
                    ))}
                  </div>
                )}
                {msg.confidence !== undefined && (
                  <div className="text-[10px] mt-1" style={{ color: msg.confidence > 0.8 ? '#36d968' : msg.confidence > 0.6 ? '#ffc107' : '#8c8c8c' }}>
                    置信度: {(msg.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#3488ff', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(52,136,255,0.1)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
              placeholder="输入您的问题..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ color: '#e0e0e0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={() => handleSend(input)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#fff', background: '#3488ff' }}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
