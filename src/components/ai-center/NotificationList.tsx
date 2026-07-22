'use client';

import { useAICenterStore } from '@/stores/ai-center-store';

export default function NotificationList() {
  const notifications = useAICenterStore((s) => s.notifications);
  const markNotificationRead = useAICenterStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAICenterStore((s) => s.markAllNotificationsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{unreadCount} 条未读</span>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="text-[10px]" style={{ color: '#3488ff' }}>
            全部已读
          </button>
        )}
      </div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {notifications.map((notif) => (
          <button
            key={notif.id}
            onClick={() => markNotificationRead(notif.id)}
            className="w-full text-left p-2 rounded transition-colors"
            style={{ background: notif.read ? 'transparent' : 'rgba(52,136,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              {!notif.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3488ff' }} />}
              <span className="text-xs font-medium" style={{ color: notif.read ? '#8c8c8c' : '#e0e0e0' }}>{notif.title}</span>
              <span className="text-[10px] px-1 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>
                {notif.channel === 'in_app' ? '站内' : notif.channel === 'sms' ? '短信' : '邮件'}
              </span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#8c8c8c' }}>{notif.message}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
