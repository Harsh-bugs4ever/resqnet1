import { Package, Plus, TrendingUp } from 'lucide-react';
import { useResources, useResourceSummary } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState, SectionLoader } from '../ui/Loaders';
import { timeAgo, capitalize } from '../../lib/utils';

const RESOURCE_ICONS = {
  food: '🍱', water: '💧', medical: '🏥', shelter: '⛺',
  clothing: '👕', fuel: '⛽', vehicles: '🚗', other: '📦',
};

const ResourceDemandBar = ({ type, data }) => {
  const max = Math.max(data.total, 100);
  const pct = Math.min((data.total / max) * 100, 100);
  const criticalPct = (data.critical / data.total) * 100 || 0;

  return (
    <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{RESOURCE_ICONS[type] || '📦'}</span>
          <span className="text-sm font-semibold text-gray-200 capitalize">{type}</span>
        </div>
        <span className="text-xs font-mono text-gray-400">{data.total.toLocaleString()} units</span>
      </div>
      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
        <div className="h-full flex rounded-full overflow-hidden" style={{ width: `${pct}%` }}>
          <div className="bg-red-500" style={{ width: `${criticalPct}%` }} />
          <div className="bg-orange-500 flex-1" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
        {data.critical > 0 && <span className="text-red-400">{data.critical} critical</span>}
        {data.high > 0 && <span className="text-orange-400">{data.high} high</span>}
        {data.medium > 0 && <span className="text-yellow-400">{data.medium} medium</span>}
      </div>
    </div>
  );
};

export const ResourcesPanel = () => {
  const { data: resources = [], isLoading } = useResources({ status: 'pending' });
  const { data: summary = {} } = useResourceSummary();
  const { openModal } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-purple-400" />
          <h2 className="font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Resources</h2>
        </div>
        <Button variant="ghost" size="sm" icon={Plus} onClick={() => openModal('createResource')}>Request</Button>
      </div>

      {/* Demand summary */}
      {Object.keys(summary).length > 0 && (
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <TrendingUp size={12} />
            <span className="uppercase tracking-wider font-medium">Pending Demand</span>
          </div>
          <div className="space-y-2">
            {Object.entries(summary).map(([type, data]) => (
              <ResourceDemandBar key={type} type={type} data={data} />
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 shrink-0">
        Recent Requests ({resources.length})
      </div>

      {isLoading ? <SectionLoader /> : resources.length === 0 ? (
        <EmptyState icon={Package} title="No pending requests" description="All resource requests have been fulfilled." />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {resources.map((req) => (
            <div key={req.id} className="p-3 rounded-xl bg-[#161b22] border border-[#21262d]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{RESOURCE_ICONS[req.resource_type] || '📦'}</span>
                  <span className="text-sm font-medium text-gray-200 capitalize">{req.resource_type}</span>
                </div>
                <SeverityBadge severity={req.priority} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono font-bold text-gray-300">{req.quantity} units</span>
                <span className="truncate flex-1">{req.incidents?.title}</span>
                <span>{timeAgo(req.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
