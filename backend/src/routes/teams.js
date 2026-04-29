const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all teams
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        profiles(id, full_name, email, avatar_url),
        assignments(
          id, status,
          incidents(id, title, severity, status)
        )
      `)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single team
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        profiles(id, full_name, email, avatar_url),
        assignments(
          id, status, assigned_at,
          incidents(id, title, severity, status, address)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Team not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create team
router.post('/', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const { name, team_type, capacity, lead_id } = req.body;
  if (!name || !team_type) return res.status(400).json({ error: 'name and team_type are required' });

  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, team_type, capacity: capacity || 5, lead_id, status: 'available' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update team status / location
router.patch('/:id', authenticate, async (req, res) => {
  const allowed = ['status', 'latitude', 'longitude', 'name', 'capacity'];
  const updates = {};
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
  updates.updated_at = new Date().toISOString();

  // Only team lead or admin can update
  try {
    const { data: team } = await supabase.from('teams').select('lead_id').eq('id', req.params.id).single();
    if (req.user.role !== 'admin' && req.user.role !== 'government' && team?.lead_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this team' });
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign team to incident
router.post('/:id/assign', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const { incident_id } = req.body;
  if (!incident_id) return res.status(400).json({ error: 'incident_id is required' });

  try {
    // Check for duplicate assignment
    const { data: existing } = await supabase
      .from('assignments')
      .select('id')
      .eq('team_id', req.params.id)
      .eq('incident_id', incident_id)
      .eq('status', 'active')
      .single();

    if (existing) return res.status(409).json({ error: 'Team already assigned to this incident' });

    // Check low-priority over-assignment
    const { data: incident } = await supabase.from('incidents').select('severity').eq('id', incident_id).single();
    if (incident?.severity === 'low') {
      const { count } = await supabase
        .from('assignments')
        .select('id', { count: 'exact' })
        .eq('incident_id', incident_id)
        .eq('status', 'active');

      if (count >= 1) {
        return res.status(409).json({ error: 'Low-priority incident already has a team assigned. Multiple assignments prevented.' });
      }
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({ team_id: req.params.id, incident_id, assigned_by: req.user.id, status: 'active' })
      .select()
      .single();

    if (error) throw error;

    // Update team status to busy
    await supabase.from('teams').update({ status: 'busy' }).eq('id', req.params.id);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
