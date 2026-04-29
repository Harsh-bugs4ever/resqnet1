import { useUIStore } from '../../stores/uiStore';
import { useIncidents, useTeams } from '../../hooks/useData';
import { IncidentMap } from '../map/IncidentMap';
import { IncidentsPanel } from './IncidentsPanel';
import { TeamsPanel } from './TeamsPanel';
import { ResourcesPanel } from './ResourcesPanel';
import { AlertsPanel } from './AlertsPanel';
import { CreateIncidentModal } from '../modals/CreateIncidentModal';
import { AssignTeamModal } from '../modals/AssignTeamModal';
import { CreateAlertModal } from '../modals/CreateAlertModal';
import { CreateResourceModal } from '../modals/CreateResourceModal';

const PANELS = {
  incidents: IncidentsPanel,
  teams: TeamsPanel,
  resources: ResourcesPanel,
  alerts: AlertsPanel,
};

export const AdminDashboard = () => {
  const { activePanel, modals } = useUIStore();
  const { data: incidents = [] } = useIncidents();
  const { data: teams = [] } = useTeams();

  const ActivePanel = PANELS[activePanel] || IncidentsPanel;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top stats bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#21262d] bg-[#0d1117] shrink-0 overflow-x-auto">
        {[
          { label: 'Active', value: incidents.filter(i => i.status === 'active').length, color: 'text-red-400' },
          { label: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: 'text-red-500' },
          { label: 'Teams Ready', value: teams.filter(t => t.status === 'available').length, color: 'text-green-400' },
          { label: 'Teams Busy', value: teams.filter(t => t.status === 'busy').length, color: 'text-orange-400' },
          { label: 'Resolved Today', value: incidents.filter(i => i.status === 'resolved').length, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <span className={`text-xl font-black font-mono ${color}`}>{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-[#21262d] ml-2">|</span>
          </div>
        ))}
      </div>

      {/* Main content: map + side panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 p-3 overflow-hidden">
          <IncidentMap incidents={incidents} teams={teams} height="100%" />
        </div>

        {/* Side panel */}
        <div className="w-80 shrink-0 border-l border-[#21262d] bg-[#0d1117] p-4 overflow-hidden flex flex-col">
          <ActivePanel />
        </div>
      </div>

      {/* Modals */}
      {modals.createIncident && <CreateIncidentModal />}
      {modals.assignTeam && <AssignTeamModal />}
      {modals.createAlert && <CreateAlertModal />}
      {modals.createResource && <CreateResourceModal />}
    </div>
  );
};
