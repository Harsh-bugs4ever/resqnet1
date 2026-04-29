import { useAuthStore } from '../../stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AdminDashboard } from '../admin/AdminDashboard';
import { TeamDashboard } from '../team/TeamDashboard';
import { ToastContainer } from '../ui/Toast';
import { useRealtime } from '../../hooks/useRealtime';
import { useUIStore } from '../../stores/uiStore';

const PANEL_TITLES = {
  incidents: 'Incident Command',
  teams: 'Team Management',
  resources: 'Resource Coordination',
  alerts: 'Alert Center',
  tasks: 'My Missions',
  map: 'Live Situation Map',
};

export const AppLayout = () => {
  const { profile } = useAuthStore();
  const { activePanel } = useUIStore();
  useRealtime();

  const isAdmin = ['admin', 'government', 'ngo'].includes(profile?.role);
  const title = PANEL_TITLES[activePanel] || 'ResQNet';

  return (
    <div className="flex h-screen overflow-hidden bg-[#060910]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-hidden">
          {isAdmin ? <AdminDashboard /> : <TeamDashboard />}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
