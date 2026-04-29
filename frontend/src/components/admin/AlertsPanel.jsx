import { Bell, Plus, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import { useAlerts } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { EmptyState, SectionLoader } from '../ui/Loaders';
import { timeAgo, capitalize } from '../../lib/utils';

const ALERT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  critical: Zap,
  evacuation: AlertTriangle,
};

const ALERT_COLORS = {
  info: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  warning: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
  critical: 'border-red-500/20 bg-red-500/5 text-red-400',
  evacuation: 'border-red-500/30 bg-red-500/10 text-red-400',
};

export const AlertsPanel = () => {
  const { data: alerts = [], isLoading } = useAlerts();
  const { openModal } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-yellow-400" />
          <h2 className="font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Alerts</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-mono">{alerts.length}</span>
        </div>
        <Button variant="warning" size="sm" icon={Plus} onClick={() => openModal('createAlert')}>Broadcast</Button>
      </div>

      {isLoading ? <SectionLoader /> : alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" description="Broadcast an alert to notify field teams." />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.alert_type] || Info;
            const colorClass = ALERT_COLORS[alert.alert_type] || ALERT_COLORS.info;
            return (
              <div key={alert.id} className={`p-3 rounded-xl border ${colorClass}`}>
                <div className="flex items-start gap-2 mb-1">
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{alert.title}</p>
                    <p className="text-xs opacity-70 mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs opacity-60 mt-1">
                  <span>{capitalize(alert.alert_type)}</span>
                  <span>→ {alert.target_role === 'all' ? 'All Personnel' : capitalize(alert.target_role)}</span>
                  <span className="ml-auto">{timeAgo(alert.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
