import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUIStore } from '../stores/uiStore';

export const useRealtime = () => {
  const qc = useQueryClient();
  const addNotification = useUIStore((s) => s.addNotification);

  useEffect(() => {
    // Subscribe to incidents changes
    const incidentsSub = supabase
      .channel('incidents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['incidents'] });
          if (payload.eventType === 'INSERT') {
            addNotification({
              type: 'incident',
              title: 'New Incident',
              message: payload.new.title,
              severity: payload.new.severity,
            });
          }
        })
      .subscribe();

    // Subscribe to team location/status changes
    const teamsSub = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' },
        () => qc.invalidateQueries({ queryKey: ['teams'] }))
      .subscribe();

    // Subscribe to assignments
    const assignmentsSub = supabase
      .channel('assignments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' },
        () => {
          qc.invalidateQueries({ queryKey: ['assignments'] });
          qc.invalidateQueries({ queryKey: ['teams'] });
          qc.invalidateQueries({ queryKey: ['incidents'] });
        })
      .subscribe();

    // Subscribe to alerts
    const alertsSub = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['alerts'] });
          addNotification({
            type: 'alert',
            title: payload.new.title,
            message: payload.new.message,
            alertType: payload.new.alert_type,
          });
        })
      .subscribe();

    return () => {
      supabase.removeChannel(incidentsSub);
      supabase.removeChannel(teamsSub);
      supabase.removeChannel(assignmentsSub);
      supabase.removeChannel(alertsSub);
    };
  }, [qc, addNotification]);
};
