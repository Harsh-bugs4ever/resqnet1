import { Activity, Wifi, WifiOff } from 'lucide-react';
import { useIncidents, useTeams } from '../../hooks/useData';

export const Header = ({ title }) => {
  const { data: incidents = [] } = useIncidents();
  const { data: teams = [] } = useTeams();

  const activeIncidents = incidents.filter((i) => i.status === 'active').length;
  const availableTeams = teams.filter((t) => t.status === 'available').length;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#21262d] bg-[#0d1117]">
      <h1 className="text-lg font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h1>

      <div className="flex items-center gap-6">
        {/* Live stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-gray-400"><span className="text-red-400 font-mono font-bold">{activeIncidents}</span> Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400"><span className="text-green-400 font-mono font-bold">{availableTeams}</span> Teams Ready</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <Wifi size={12} className="text-green-400" />
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      </div>
    </header>
  );
};
