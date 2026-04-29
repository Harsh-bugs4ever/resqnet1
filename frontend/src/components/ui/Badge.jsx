import { capitalize } from '../../lib/utils';

export const SeverityBadge = ({ severity }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border severity-${severity}`}
    style={{ borderWidth: 1 }}>
    {severity?.toUpperCase()}
  </span>
);

export const StatusBadge = ({ status }) => {
  const colors = {
    available: 'text-green-400 bg-green-400/10 border-green-400/20',
    busy: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    offline: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    active: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    resolved: 'text-green-400 bg-green-400/10 border-green-400/20',
    closed: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    completed: 'text-green-400 bg-green-400/10 border-green-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colors[status] || ''}`}
      style={{ borderWidth: 1 }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {capitalize(status)}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const colors = {
    admin: 'text-red-400 bg-red-400/10',
    government: 'text-blue-400 bg-blue-400/10',
    ngo: 'text-purple-400 bg-purple-400/10',
    rescue_team: 'text-green-400 bg-green-400/10',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[role] || ''}`}>
      {role?.replace('_', ' ').toUpperCase()}
    </span>
  );
};
