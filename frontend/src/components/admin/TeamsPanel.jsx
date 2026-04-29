import { useState } from 'react';
import { Users, Plus, MapPin } from 'lucide-react';
import { useTeams, useUpdateTeam } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormFields';
import { Modal } from '../ui/Modal';
import { EmptyState, SectionLoader } from '../ui/Loaders';
import { useCreateTeam } from '../../hooks/useData';
import { TEAM_TYPES, timeAgo } from '../../lib/utils';

const CreateTeamModal = ({ onClose }) => {
  const { mutateAsync, isPending } = useCreateTeam();
  const { addNotification } = useUIStore();
  const [form, setForm] = useState({ name: '', team_type: 'rescue', capacity: '5' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    try {
      await mutateAsync({ ...form, capacity: parseInt(form.capacity) });
      addNotification({ type: 'success', title: 'Team created' });
      onClose();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal title="Create New Team" onClose={onClose}>
      <div className="space-y-4">
        {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
        <Input label="Team Name *" placeholder="Alpha Rescue Unit" value={form.name} onChange={set('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.team_type} onChange={set('team_type')}>
            {TEAM_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
          <Input label="Capacity" type="number" min="1" max="50" value={form.capacity} onChange={set('capacity')} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#21262d]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isPending}>Create Team</Button>
        </div>
      </div>
    </Modal>
  );
};

export const TeamsPanel = () => {
  const { data: teams = [], isLoading } = useTeams();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = teams.filter((t) => filter === 'all' ? true : t.status === filter);

  return (
    <div className="flex flex-col h-full">
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <h2 className="font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>Teams</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-mono">{teams.length}</span>
        </div>
        <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New Team</Button>
      </div>

      <div className="flex gap-1.5 mb-4 shrink-0">
        {['all', 'available', 'busy', 'offline'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <SectionLoader /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No teams" description="Create a team to get started." />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((team) => {
            const activeAssignments = team.assignments?.filter(a => a.status === 'active') || [];
            return (
              <div key={team.id} className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] card-hover">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-200">{team.name}</p>
                  <StatusBadge status={team.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="capitalize">{team.team_type}</span>
                  <span>{team.capacity} members</span>
                  {team.latitude && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> Live
                    </span>
                  )}
                </div>
                {activeAssignments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {activeAssignments.slice(0, 2).map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <span className="text-gray-400 truncate">{a.incidents?.title}</span>
                        <span className={`ml-auto shrink-0 text-xs severity-${a.incidents?.severity} px-1 rounded`}>
                          {a.incidents?.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
