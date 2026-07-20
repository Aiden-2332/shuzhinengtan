import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '高校智慧碳管理平台',
    template: '%s | 高校智慧碳管理平台',
  },
  description: '面向北京市重点碳排放单位中的高校，覆盖数据采集、碳排放核算、排放分析、减排路径、碳管理、碳资产管理全链条的碳管理数字化平台。',
  keywords: [
    '碳管理',
    '碳排放',
    '高校',
    '低碳校园',
    '双碳',
    '能源管理',
    '减排',
    '碳核算',
  ],
  authors: [{ name: '数智能碳课题组' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}