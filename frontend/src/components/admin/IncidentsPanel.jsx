import { useState } from 'react';
import { AlertTriangle, Plus, Users, Trash2, CheckCircle } from 'lucide-react';
import { useIncidents, useUpdateIncident, useDeleteIncident } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState, SectionLoader } from '../ui/Loaders';
import { timeAgo, capitalize } from '../../lib/utils';

export const IncidentsPanel = () => {
  const { data: incidents = [], isLoading } = useIncidents();
  const { mutateAsync: updateIncident } = useUpdateIncident();
  const { mutateAsync: deleteIncident } = useDeleteIncident();
  const { openModal, setSelectedIncident, addNotification } = useUIStore();
  const [filter, setFilter] = useState('all');

  const filtered = incidents.filter((i) => filter === 'all' ? true : i.severity === filter || i.status === filter);

  const handleResolve = async (id) => {
    await updateIncident({ id, status: 'resolved' });
    addNotification({ type: 'success', title: 'Incident resolved' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this incident?')) return;
    await deleteIncident(id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <h2 className="font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Incidents</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-mono">{incidents.length}</span>
        </div>
        <Button variant="danger" size="sm" icon={Plus} onClick={() => openModal('createIncident')}>
          Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap mb-4 shrink-0">
        {['all', 'active', 'critical', 'high', 'medium', 'low', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {capitalize(f)}
          </button>
        ))}
      </div>

      {isLoading ? <SectionLoader /> : filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents" description="No incidents match the current filter." />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((incident) => (
            <div
              key={incident.id}
              className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] card-hover cursor-pointer"
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-200 leading-tight flex-1">{incident.title}</p>
                <SeverityBadge severity={incident.severity} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span>{incident.incident_type}</span>
                {incident.address && <span className="truncate max-w-[160px]">{incident.address}</span>}
                <span className="ml-auto">{timeAgo(incident.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={incident.status} />
                  {incident.assignments?.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={10} /> {incident.assignments.filter(a => a.status === 'active').length} teams
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {incident.status === 'active' && (
                    <>
                      <Button size="sm" variant="ghost" className="!p-1.5" onClick={() => openModal('assignTeam', incident)}>
                        <Users size={12} />
                      </Button>
                      <Button size="sm" variant="ghost" className="!p-1.5 text-green-400 hover:text-green-300" onClick={() => handleResolve(incident.id)}>
                        <CheckCircle size={12} />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="!p-1.5 text-red-500 hover:text-red-400" onClick={() => handleDelete(incident.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
