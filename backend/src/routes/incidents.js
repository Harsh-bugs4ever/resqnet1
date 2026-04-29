const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET all incidents
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        assignments(
          id, status,
          teams(id, name, team_type)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single incident
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        assignments(
          id, status, assigned_at,
          teams(id, name, team_type, status)
        ),
        resource_requests(id, resource_type, quantity, status, priority)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Incident not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create incident
router.post('/', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const { title, description, severity, latitude, longitude, address, incident_type } = req.body;

  if (!title || !severity || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'title, severity, latitude, longitude are required' });
  }

  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        title,
        description,
        severity,
        latitude,
        longitude,
        address,
        incident_type,
        status: 'active',
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update incident
router.patch('/:id', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const allowed = ['title', 'description', 'severity', 'status', 'latitude', 'longitude', 'address', 'incident_type'];
  const updates = {};
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  try {
    const { data, error } = await supabase
      .from('incidents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE incident
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('incidents').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
