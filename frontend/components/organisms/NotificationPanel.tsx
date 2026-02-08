
import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, Check, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import Button from '../atoms/Button';

const iconMap = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-rose-500" />,
};

const NotificationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotificationStore();

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm">Notifications</h3>
          {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={markAllAsRead} title="Mark all as read">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={clearAll} title="Clear all">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                  !notification.read && "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">{iconMap[notification.type]}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold leading-tight">{notification.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground/50 pt-1">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t text-center">
        <button onClick={onClose} className="text-xs text-primary font-medium hover:underline">Close</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
