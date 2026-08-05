"use client";

import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr = time
    ? `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
    : '--:--:--'
  const dateStr = time
    ? `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`
    : '---- -- --'

  return (
    <header style={{
      position: 'relative',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, rgba(17,79,113,0.97), rgba(6,39,65,0.95))',
      borderBottom: '1px solid rgba(73,211,255,0.58)',
      flexShrink: 0,
      zIndex: 20,
    }}>
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(to right, transparent, #21c8f6, #b5f3ff, #21c8f6, transparent)',
        opacity: 0.82,
      }} />

      {/* Left wing decoration */}
      <div style={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <WingLeft />
        <div style={{ fontSize: 11, color: 'rgba(191,226,245,0.78)', fontFamily: 'Rajdhani', letterSpacing: '0.1em' }}>
          <div>{dateStr}</div>
          <div style={{ color: '#71e4ff', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            {timeStr}
          </div>
        </div>
      </div>

      {/* Center title */}
      <div style={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {/* Wing left of title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <TitleWingLeft />
          <div>
            <div style={{
              fontFamily: 'Noto Sans SC',
              fontSize: 22,
              fontWeight: 700,
              color: '#f4fbff',
              letterSpacing: '0.18em',
              textShadow: '0 0 20px rgba(33,200,246,0.48), 0 2px 4px rgba(0,0,0,0.62)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}>
              高校智慧碳管理平台
            </div>
            <div style={{
              fontFamily: 'Rajdhani',
              fontSize: 9,
              fontWeight: 500,
              color: 'rgba(113,228,255,0.78)',
              letterSpacing: '0.28em',
              textAlign: 'center',
              marginTop: 1,
            }}>
              SMART CAMPUS CARBON MANAGEMENT PLATFORM
            </div>
          </div>
          <TitleWingRight />
        </div>
      </div>

      {/* Right info */}
      <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(191,226,245,0.78)', letterSpacing: '0.05em' }}>北京市 · 海淀区</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
            <span style={{ width: 8, height: 8, background: '#37d6b0', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px rgba(55,214,176,0.72)' }} />
            <span style={{ fontSize: 11, color: '#37d6b0' }}>系统运行正常</span>
          </div>
        </div>
        <WingRight />
      </div>

      {/* Bottom left corner line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent 5%, rgba(73,211,255,0.4) 30%, rgba(73,211,255,0.4) 70%, transparent 95%)',
      }} />
    </header>
  )
}
function TitleWingLeft() {
  return (
    <svg width="160" height="24" viewBox="0 0 160 24" fill="none">
      <line x1="0" y1="12" x2="140" y2="12" stroke="url(#wl)" strokeWidth="1" />
      <line x1="140" y1="12" x2="155" y2="4" stroke="#00d4ff" strokeWidth="1" opacity="0.7" />
      <line x1="140" y1="12" x2="155" y2="20" stroke="#00d4ff" strokeWidth="1" opacity="0.7" />
      <rect x="136" y="10" width="4" height="4" fill="#00d4ff" opacity="0.8" />
      <rect x="100" y="11" width="2" height="2" fill="#00a0cc" opacity="0.6" />
      <rect x="60" y="11" width="2" height="2" fill="#006090" opacity="0.5" />
      <defs>
        <linearGradient id="wl" x1="0" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#00d4ff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#00d4ff" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  )
}
function TitleWingRight() {
  return (
    <svg width="160" height="24" viewBox="0 0 160 24" fill="none">
      <line x1="160" y1="12" x2="20" y2="12" stroke="url(#wr)" strokeWidth="1" />
      <line x1="20" y1="12" x2="5" y2="4" stroke="#00d4ff" strokeWidth="1" opacity="0.7" />
      <line x1="20" y1="12" x2="5" y2="20" stroke="#00d4ff" strokeWidth="1" opacity="0.7" />
      <rect x="20" y="10" width="4" height="4" fill="#00d4ff" opacity="0.8" />
      <rect x="58" y="11" width="2" height="2" fill="#00a0cc" opacity="0.6" />
      <rect x="98" y="11" width="2" height="2" fill="#006090" opacity="0.5" />
      <defs>
        <linearGradient id="wr" x1="160" y1="0" x2="20" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#00d4ff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#00d4ff" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function WingLeft() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
      <polyline points="0,15 60,15 70,8 80,15 70,22 60,15" stroke="#00a0cc" strokeWidth="0.8" fill="none" opacity="0.6" />
      <line x1="0" y1="15" x2="58" y2="15" stroke="url(#swl)" strokeWidth="1" />
      <rect x="56" y="13" width="4" height="4" fill="#00d4ff" opacity="0.7" />
      <defs>
        <linearGradient id="swl" x1="0" y1="0" x2="58" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="1" stopColor="#00d4ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function WingRight() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
      <polyline points="80,15 20,15 10,8 0,15 10,22 20,15" stroke="#00a0cc" strokeWidth="0.8" fill="none" opacity="0.6" />
      <line x1="80" y1="15" x2="22" y2="15" stroke="url(#swr)" strokeWidth="1" />
      <rect x="20" y="13" width="4" height="4" fill="#00d4ff" opacity="0.7" />
      <defs>
        <linearGradient id="swr" x1="80" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="1" stopColor="#00d4ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

