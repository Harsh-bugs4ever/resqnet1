import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Active panel on admin dashboard
  activePanel: 'incidents', // incidents | teams | resources | alerts
  setActivePanel: (panel) => set({ activePanel: panel }),

  // Map viewport
  mapViewport: {
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 10,
  },
  setMapViewport: (viewport) => set({ mapViewport: viewport }),

  // Selected incident on map
  selectedIncident: null,
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  // Selected team on map
  selectedTeam: null,
  setSelectedTeam: (team) => set({ selectedTeam: team }),

  // Modal state
  modals: {
    createIncident: false,
    createTeam: false,
    assignTeam: false,
    createAlert: false,
    createResource: false,
  },
  openModal: (name, data = null) => set((s) => ({
    modals: { ...s.modals, [name]: data || true },
  })),
  closeModal: (name) => set((s) => ({
    modals: { ...s.modals, [name]: false },
  })),

  // Notifications
  notifications: [],
  addNotification: (notif) => set((s) => ({
    notifications: [{ id: Date.now(), ...notif }, ...s.notifications].slice(0, 20),
  })),
  dismissNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id),
  })),
}));
