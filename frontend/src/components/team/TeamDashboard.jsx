import { useState, useEffect } from 'react';
import { Activity, MapPin, CheckCircle, Clock, AlertTriangle, Bell, RefreshCw, Navigation } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTeams, useAssignments, useUpdateAssignment, useAlerts, useUpdateTeam } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState, SectionLoader } from '../ui/Loaders';
import { IncidentMap } from '../map/IncidentMap';
import { useIncidents } from '../../hooks/useData';
import { timeAgo, formatDate } from '../../lib/utils';
import { CreateResourceModal } from '../modals/CreateResourceModal';

const StatusSelector = ({ currentStatus, onUpdate, loading }) => {
  const statuses = [
    { value: 'available', label: 'Available', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    { value: 'busy', label: 'On Mission', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { value: 'offline', label: 'Offline', color: 'text-gray-500 border-gray-600/30 bg-gray-500/10' },
  ];

  return (
    <div className="flex gap-2">
      {statuses.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => onUpdate(value)}
          disabled={loading || currentStatus === value}
          className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
            currentStatus === value ? `${color} ring-1 ring-offset-0` : 'border-[#21262d] text-gray-600 hover:text-gray-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export const TeamDashboard = () => {
  const { profile } = useAuthStore();
  const { data: teams = [] } = useTeams();
  const { data: incidents = [] } = useIncidents();
  const { data: alerts = [] } = useAlerts();
  const { mutateAsync: updateAssignment, isPending: updatingAssignment } = useUpdateAssignment();
  const { mutateAsync: updateTeam, isPending: updatingTeam } = useUpdateTeam();
  const { openModal, modals, addNotification, activePanel, setActivePanel } = useUIStore();

  // Find my team (where I'm the lead)
  const myTeam = teams.find((t) => t.lead_id === profile?.id) || teams[0];
  const { data: assignments = [], isLoading } = useAssignments({ team_id: myTeam?.id });

  const activeAssignments = assignments.filter((a) => a.status === 'active');
  const completedAssignments = assignments.filter((a) => a.status === 'completed');
  const myAlerts = alerts.slice(0, 10);

  const handleStatusUpdate = async (status) => {
    if (!myTeam) return;
    await updateTeam({ id: myTeam.id, status });
    addNotification({ type: 'success', title: `Status updated to ${status}` });
  };

  const handleCompleteAssignment = async (assignmentId) => {
    await updateAssignment({ id: assignmentId, status: 'completed' });
    addNotification({ type: 'success', title: 'Mission marked complete' });
  };

  const shareLocation = () => {
    if (!navigator.geolocation || !myTeam) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateTeam({ id: myTeam.id, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        addNotification({ type: 'success', title: 'Location shared', message: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      },
      () => addNotification({ type: 'error', title: 'Location access denied' })
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#21262d] bg-[#0d1117] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-200">{myTeam?.name || 'My Team'}</span>
          {myTeam && <StatusBadge status={myTeam.status} />}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={Navigation} onClick={shareLocation}>Share Location</Button>
          <Button size="sm" variant="ghost" icon={Activity} onClick={() => openModal('createResource')}>Request Resources</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Team status selector */}
          {myTeam && (
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d]">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">My Status</p>
              <StatusSelector currentStatus={myTeam.status} onUpdate={handleStatusUpdate} loading={updatingTeam} />
              {myTeam.latitude && (
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <MapPin size={10} /> Last location: {myTeam.latitude?.toFixed(4)}, {myTeam.longitude?.toFixed(4)}
                </p>
              )}
            </div>
          )}

          {/* Active assignments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-orange-400" />
              <h3 className="text-sm font-bold text-gray-200" style={{ fontFamily: 'Syne, sans-serif' }}>Active Missions</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-mono">{activeAssignments.length}</span>
            </div>

            {isLoading ? <SectionLoader /> : activeAssignments.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#161b22] border border-[#21262d] text-center">
                <CheckCircle size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active missions assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 rounded-xl bg-[#161b22] border border-orange-500/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-200">{assignment.incidents?.title}</p>
                        {assignment.incidents?.address && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {assignment.incidents.address}
                          </p>
                        )}
                      </div>
                      <SeverityBadge severity={assignment.incidents?.severity} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-600">Assigned {timeAgo(assignment.assigned_at)}</p>
                      <Button size="sm" variant="success" icon={CheckCircle}
                        onClick={() => handleCompleteAssignment(assignment.id)}
                        loading={updatingAssignment}>
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          {completedAssignments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-400" />
                <h3 className="text-sm font-bold text-gray-200" style={{ fontFamily: 'Syne, sans-serif' }}>Completed</h3>
              </div>
              <div className="space-y-2">
                {completedAssignments.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] opacity-60">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">{a.incidents?.title}</p>
                      <span className="text-xs text-green-400">✓ Done</span>
                    </div>
                    <p className="text-xs text-gray-600">{timeAgo(a.updated_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alerts sidebar */}
        <div className="w-72 shrink-0 border-l border-[#21262d] p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} className="text-yellow-400" />
            <h3 className="text-sm font-bold text-gray-200" style={{ fontFamily: 'Syne, sans-serif' }}>Alerts</h3>
          </div>
          {myAlerts.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts" />
          ) : (
            <div className="space-y-2">
              {myAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border text-xs ${
                  alert.alert_type === 'critical' || alert.alert_type === 'evacuation'
                    ? 'border-red-500/30 bg-red-500/10'
                    : alert.alert_type === 'warning'
                    ? 'border-orange-500/20 bg-orange-500/5'
                    : 'border-[#21262d] bg-[#161b22]'
                }`}>
                  <p className="font-semibold text-gray-200 mb-1">{alert.title}</p>
                  <p className="text-gray-400 line-clamp-3">{alert.message}</p>
                  <p className="text-gray-600 mt-1">{timeAgo(alert.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map overlay at bottom — show live map of all incidents */}
      <div className="h-48 shrink-0 border-t border-[#21262d] p-2">
        <IncidentMap incidents={incidents} teams={teams} height="100%" />
      </div>

      {modals.createResource && <CreateResourceModal />}
    </div>
  );
};
