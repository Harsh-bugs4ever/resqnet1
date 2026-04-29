const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all assignments
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('assignments')
      .select(`
        *,
        teams(id, name, team_type, status),
        incidents(id, title, severity, status, address),
        profiles!assignments_assigned_by_fkey(full_name)
      `)
      .order('assigned_at', { ascending: false });

    if (req.query.team_id) query = query.eq('team_id', req.query.team_id);
    if (req.query.incident_id) query = query.eq('incident_id', req.query.incident_id);
    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update assignment status
router.patch('/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const { data, error } = await supabase
      .from('assignments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // If completed, check if team has other active assignments; if not, set team available
    if (status === 'completed' || status === 'cancelled') {
      const { count } = await supabase
        .from('assignments')
        .select('id', { count: 'exact' })
        .eq('team_id', data.team_id)
        .eq('status', 'active');

      if (count === 0) {
        await supabase.from('teams').update({ status: 'available' }).eq('id', data.team_id);
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
