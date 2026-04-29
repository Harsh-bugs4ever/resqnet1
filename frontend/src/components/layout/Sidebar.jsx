import { AlertTriangle, Map, Users, Package, Bell, LogOut, ChevronLeft, Activity, Shield, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useAlerts } from '../../hooks/useData';
import { RoleBadge } from '../ui/Badge';
import { getInitials } from '../../lib/utils';

const NAV_ADMIN = [
  { id: 'incidents', icon: AlertTriangle, label: 'Incidents' },
  { id: 'teams', icon: Users, label: 'Teams' },
  { id: 'resources', icon: Package, label: 'Resources' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
];

const NAV_TEAM = [
  { id: 'tasks', icon: Activity, label: 'My Tasks' },
  { id: 'map', icon: Map, label: 'Live Map' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
];

export const Sidebar = () => {
  const { profile, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar, activePanel, setActivePanel } = useUIStore();
  const { data: alerts = [] } = useAlerts();
  const unreadAlerts = alerts.filter((a) => !a.read_at).length;

  const isAdmin = ['admin', 'government'].includes(profile?.role);
  const navItems = isAdmin ? NAV_ADMIN : NAV_TEAM;

  return (
    <aside className={`flex flex-col h-full bg-[#0d1117] border-r border-[#21262d] transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-14'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[#21262d]">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-400" />
        </div>
        {sidebarOpen && (
          <span className="text-base font-black text-gray-100 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            ResQNet
          </span>
        )}
        <button onClick={toggleSidebar} className="ml-auto text-gray-600 hover:text-gray-300 transition-colors shrink-0">
          {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Role indicator */}
      {sidebarOpen && (
        <div className="px-3 py-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-gray-600" />
            <RoleBadge role={profile?.role} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => {
          const active = activePanel === id;
          const showBadge = id === 'alerts' && unreadAlerts > 0;
          return (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="relative shrink-0">
                <Icon size={16} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </div>
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#21262d]">
        <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(profile?.full_name)}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-600 truncate">{profile?.email}</p>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={signOut} className="text-gray-600 hover:text-red-400 transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          )}
        </div>
        {!sidebarOpen && (
          <button onClick={signOut} className="mt-2 w-full flex justify-center text-gray-600 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        )}
      </div>
    </aside>
  );
};
