import Link from "next/link";
import { ArrowLeft, Cable, ExternalLink } from "lucide-react";
import "./platform-gateway.css";

export function GatewayPlaceholder({ name }: { name: string }) {
  return (
    <main className="gateway-shell gateway-placeholder-shell">
      <div className="gateway-backdrop" aria-hidden="true" />
      <section className="gateway-placeholder">
        <div className="gateway-placeholder-icon"><Cable /></div>
        <p>PLATFORM ACCESS</p>
        <h1>{name}</h1>
        <div className="gateway-placeholder-status"><span className="gateway-placeholder-status-dot" /> 外部系统链接待接入</div>
        <p className="gateway-placeholder-copy">入口已经建立。收到正式链接后，可直接替换跳转地址，无需调整门户页布局。</p>
        <Link href="/gateway"><ArrowLeft className="gateway-placeholder-back-icon" /> 返回统一门户</Link>
        <span className="gateway-placeholder-hint"><ExternalLink className="gateway-placeholder-external-icon" /> 此页面用于验证入口可点击</span>
      </section>
    </main>
  );
}
