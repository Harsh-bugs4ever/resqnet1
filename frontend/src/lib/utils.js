export const SEVERITY_COLORS = {
  critical: '#ff2d2d',
  high: '#ff6b00',
  medium: '#ffd700',
  low: '#39d353',
};

export const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

export const STATUS_COLORS = {
  available: '#39d353',
  busy: '#ff8c00',
  offline: '#484f58',
  active: '#58a6ff',
  resolved: '#39d353',
  closed: '#484f58',
};

export const INCIDENT_TYPES = [
  'flood', 'earthquake', 'fire', 'cyclone', 'landslide',
  'tsunami', 'chemical', 'medical', 'infrastructure', 'other',
];

export const TEAM_TYPES = ['rescue', 'medical', 'fire', 'logistics', 'ngo', 'government'];

export const RESOURCE_TYPES = ['food', 'water', 'medical', 'shelter', 'clothing', 'fuel', 'vehicles', 'other'];

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const getSeverityClass = (severity) => `severity-${severity}`;

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};
