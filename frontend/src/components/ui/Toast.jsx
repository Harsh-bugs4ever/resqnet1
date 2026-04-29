import { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Bell } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const ICONS = {
  incident: AlertTriangle,
  alert: Bell,
  success: CheckCircle,
  info: Info,
  error: AlertTriangle,
};

const COLORS = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-orange-500/50 bg-orange-500/10',
  medium: 'border-yellow-500/50 bg-yellow-500/10',
  low: 'border-green-500/50 bg-green-500/10',
  incident: 'border-orange-500/50 bg-orange-500/10',
  alert: 'border-blue-500/50 bg-blue-500/10',
  success: 'border-green-500/50 bg-green-500/10',
  error: 'border-red-500/50 bg-red-500/10',
  info: 'border-gray-500/50 bg-gray-500/10',
};

const Toast = ({ id, type, title, message, severity }) => {
  const dismiss = useUIStore((s) => s.dismissNotification);
  const Icon = ICONS[type] || Info;
  const colorKey = severity || type || 'info';

  useEffect(() => {
    const t = setTimeout(() => dismiss(id), 5000);
    return () => clearTimeout(t);
  }, [id, dismiss]);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${COLORS[colorKey]} max-w-sm w-full shadow-xl animate-in`}>
      <Icon size={16} className="mt-0.5 shrink-0 text-current opacity-80" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{title}</p>
        {message && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{message}</p>}
      </div>
      <button onClick={() => dismiss(id)} className="text-gray-500 hover:text-gray-300 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const notifications = useUIStore((s) => s.notifications);
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <Toast {...n} />
        </div>
      ))}
    </div>
  );
};
