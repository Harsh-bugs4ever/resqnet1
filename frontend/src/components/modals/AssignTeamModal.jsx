import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTeams, useAssignTeam } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { StatusBadge, SeverityBadge } from '../ui/Badge';
import { Users, AlertTriangle } from 'lucide-react';

export const AssignTeamModal = () => {
  const { closeModal, modals, addNotification } = useUIStore();
  const incident = modals.assignTeam;
  const { data: teams = [] } = useTeams();
  const { mutateAsync, isPending } = useAssignTeam();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [error, setError] = useState('');

  const availableTeams = teams.filter((t) => t.status === 'available');

  const handleAssign = async () => {
    if (!selectedTeamId) { setError('Please select a team'); return; }
    try {
      await mutateAsync({ teamId: selectedTeamId, incidentId: incident.id });
      addNotification({ type: 'success', title: 'Team assigned', message: `Team assigned to ${incident.title}` });
      closeModal('assignTeam');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="Assign Team to Incident" onClose={() => closeModal('assignTeam')} size="md">
      <div className="space-y-4">
        {/* Incident info */}
        <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-200">{incident?.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <SeverityBadge severity={incident?.severity} />
                {incident?.address && <span className="text-xs text-gray-500">{incident.address}</span>}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
        )}

        {incident?.severity === 'low' && (incident?.assignments?.filter(a => a.status === 'active').length >= 1) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
            <AlertTriangle size={14} />
            This low-priority incident already has a team. Assigning another will be blocked.
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
            <Users size={12} /> Available Teams ({availableTeams.length})
          </p>
          {availableTeams.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No teams currently available</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableTeams.map((team) => (
                <label key={team.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTeamId === team.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#21262d] bg-[#161b22] hover:border-gray-600'
                }`}>
                  <input type="radio" name="team" value={team.id} checked={selectedTeamId === team.id}
                    onChange={(e) => { setSelectedTeamId(e.target.value); setError(''); }}
                    className="accent-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.team_type} · {team.capacity} members</p>
                  </div>
                  <StatusBadge status={team.status} />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#21262d]">
          <Button variant="ghost" onClick={() => closeModal('assignTeam')}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign} loading={isPending} disabled={!selectedTeamId}>
            Assign Team
          </Button>
        </div>
      </div>
    </Modal>
  );
};
