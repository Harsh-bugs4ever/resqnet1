import { useRef, useCallback, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import { useUIStore } from '../../stores/uiStore';
import { SEVERITY_COLORS } from '../../lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const IncidentMarker = ({ incident, onClick, isSelected }) => {
  const color = SEVERITY_COLORS[incident.severity] || '#58a6ff';
  return (
    <Marker longitude={incident.longitude} latitude={incident.latitude} anchor="center">
      <div
        onClick={() => onClick(incident)}
        className="cursor-pointer relative"
        title={incident.title}
      >
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-125"
          style={{
            backgroundColor: color + '30',
            borderColor: color,
            boxShadow: isSelected ? `0 0 0 4px ${color}40` : `0 0 8px ${color}60`,
            transform: isSelected ? 'scale(1.3)' : undefined,
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
        {incident.severity === 'critical' && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: color, opacity: 0.5 }}
          />
        )}
      </div>
    </Marker>
  );
};

const TeamMarker = ({ team, onClick, isSelected }) => {
  const statusColors = { available: '#39d353', busy: '#ff8c00', offline: '#484f58' };
  const color = statusColors[team.status] || '#484f58';
  if (!team.latitude || !team.longitude) return null;

  return (
    <Marker longitude={team.longitude} latitude={team.latitude} anchor="center">
      <div
        onClick={() => onClick(team)}
        className="cursor-pointer"
        title={team.name}
      >
        <div
          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-110"
          style={{
            backgroundColor: color + '40',
            borderColor: color,
            boxShadow: isSelected ? `0 0 0 4px ${color}40` : undefined,
            color,
          }}
        >
          T
        </div>
      </div>
    </Marker>
  );
};

export const IncidentMap = ({ incidents = [], teams = [], height = '100%' }) => {
  const { mapViewport, setMapViewport, selectedIncident, setSelectedIncident, selectedTeam, setSelectedTeam } = useUIStore();
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const handleIncidentClick = useCallback((incident) => {
    setSelectedIncident(incident);
    setSelectedTeam(null);
    setPopupInfo({ type: 'incident', data: incident });
  }, [setSelectedIncident, setSelectedTeam]);

  const handleTeamClick = useCallback((team) => {
    setSelectedTeam(team);
    setSelectedIncident(null);
    setPopupInfo({ type: 'team', data: team });
  }, [setSelectedTeam, setSelectedIncident]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] border border-[#21262d] rounded-xl gap-4">
        <div className="text-center space-y-2">
          <p className="text-gray-400 font-semibold">Map unavailable</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Add <code className="text-blue-400 bg-blue-400/10 px-1 rounded">VITE_MAPBOX_TOKEN</code> to your .env file to enable the interactive map.
          </p>
        </div>
        {/* Fallback incident list */}
        <div className="w-full max-w-sm space-y-2 px-4">
          {incidents.slice(0, 5).map((inc) => (
            <div key={inc.id} className="flex items-center gap-3 p-2 rounded bg-white/[0.03] border border-[#21262d]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[inc.severity] }} />
              <span className="text-sm text-gray-300 truncate flex-1">{inc.title}</span>
              <span className="text-xs text-gray-500">{inc.address?.slice(0, 20) || `${inc.latitude?.toFixed(2)}, ${inc.longitude?.toFixed(2)}`}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative rounded-xl overflow-hidden border border-[#21262d]">
      <Map
        ref={mapRef}
        {...mapViewport}
        onMove={(evt) => setMapViewport(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {incidents.map((inc) => (
          <IncidentMarker
            key={inc.id}
            incident={inc}
            onClick={handleIncidentClick}
            isSelected={selectedIncident?.id === inc.id}
          />
        ))}

        {teams.map((team) => (
          <TeamMarker
            key={team.id}
            team={team}
            onClick={handleTeamClick}
            isSelected={selectedTeam?.id === team.id}
          />
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.type === 'incident' ? popupInfo.data.longitude : popupInfo.data.longitude}
            latitude={popupInfo.type === 'incident' ? popupInfo.data.latitude : popupInfo.data.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            className="resqnet-popup"
          >
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 min-w-[180px] text-sm">
              {popupInfo.type === 'incident' ? (
                <>
                  <p className="font-semibold text-gray-100 mb-1">{popupInfo.data.title}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded severity-${popupInfo.data.severity}`}>
                      {popupInfo.data.severity?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{popupInfo.data.incident_type}</span>
                  </div>
                  {popupInfo.data.address && <p className="text-xs text-gray-500">{popupInfo.data.address}</p>}
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-100 mb-1">{popupInfo.data.name}</p>
                  <p className="text-xs text-gray-400">{popupInfo.data.team_type} · {popupInfo.data.status}</p>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-[#0d1117]/90 backdrop-blur border border-[#21262d] rounded-lg p-3 text-xs space-y-1.5">
        <p className="text-gray-500 font-medium mb-2 uppercase tracking-wider" style={{ fontSize: 10 }}>Legend</p>
        {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
          <div key={sev} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border" style={{ borderColor: color, backgroundColor: color + '30' }} />
            <span className="text-gray-400 capitalize">{sev}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[#21262d]">
          <div className="w-3 h-3 rounded border-2 border-green-400 bg-green-400/20" />
          <span className="text-gray-400">Team</span>
        </div>
      </div>

      {/* Incident count overlay */}
      <div className="absolute top-4 left-4 glass border border-[#21262d] rounded-lg px-3 py-1.5 text-xs">
        <span className="text-gray-400">Showing </span>
        <span className="text-blue-400 font-mono font-bold">{incidents.length}</span>
        <span className="text-gray-400"> incidents · </span>
        <span className="text-green-400 font-mono font-bold">{teams.filter(t => t.latitude).length}</span>
        <span className="text-gray-400"> teams</span>
      </div>
    </div>
  );
};
