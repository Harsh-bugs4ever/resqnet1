import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi, teamsApi, assignmentsApi, resourcesApi, alertsApi } from '../lib/api';

// ── Incidents ──────────────────────────────────────────────────────────────
export const useIncidents = () =>
  useQuery({ queryKey: ['incidents'], queryFn: incidentsApi.getAll, refetchInterval: 30000 });

export const useIncident = (id) =>
  useQuery({ queryKey: ['incidents', id], queryFn: () => incidentsApi.getById(id), enabled: !!id });

export const useCreateIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: incidentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
};

export const useUpdateIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => incidentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
};

export const useDeleteIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: incidentsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
};

// ── Teams ──────────────────────────────────────────────────────────────────
export const useTeams = () =>
  useQuery({ queryKey: ['teams'], queryFn: teamsApi.getAll, refetchInterval: 15000 });

export const useTeam = (id) =>
  useQuery({ queryKey: ['teams', id], queryFn: () => teamsApi.getById(id), enabled: !!id });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => teamsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useAssignTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, incidentId }) => teamsApi.assign(teamId, incidentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

// ── Assignments ────────────────────────────────────────────────────────────
export const useAssignments = (params) =>
  useQuery({ queryKey: ['assignments', params], queryFn: () => assignmentsApi.getAll(params) });

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => assignmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// ── Resources ──────────────────────────────────────────────────────────────
export const useResources = (params) =>
  useQuery({ queryKey: ['resources', params], queryFn: () => resourcesApi.getAll(params) });

export const useResourceSummary = () =>
  useQuery({ queryKey: ['resources', 'summary'], queryFn: resourcesApi.getSummary, refetchInterval: 20000 });

export const useCreateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resourcesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
};

export const useUpdateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => resourcesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });
};

// ── Alerts ─────────────────────────────────────────────────────────────────
export const useAlerts = () =>
  useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll, refetchInterval: 10000 });

export const useCreateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: alertsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
};
