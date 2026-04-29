const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET resource requests
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('resource_requests')
      .select(`*, incidents(id, title, address, severity), profiles!resource_requests_requested_by_fkey(full_name)`)
      .order('created_at', { ascending: false });

    if (req.query.incident_id) query = query.eq('incident_id', req.query.incident_id);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.resource_type) query = query.eq('resource_type', req.query.resource_type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create resource request
router.post('/', authenticate, async (req, res) => {
  const { incident_id, resource_type, quantity, priority, notes } = req.body;
  if (!incident_id || !resource_type || !quantity) {
    return res.status(400).json({ error: 'incident_id, resource_type, and quantity are required' });
  }

  try {
    const { data, error } = await supabase
      .from('resource_requests')
      .insert({
        incident_id,
        resource_type,
        quantity,
        priority: priority || 'medium',
        notes,
        status: 'pending',
        requested_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update resource request
router.patch('/:id', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const allowed = ['status', 'quantity', 'priority', 'notes'];
  const updates = {};
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  try {
    const { data, error } = await supabase
      .from('resource_requests')
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

// GET resource demand summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resource_requests')
      .select('resource_type, quantity, status, priority')
      .eq('status', 'pending');

    if (error) throw error;

    const summary = data.reduce((acc, req) => {
      if (!acc[req.resource_type]) acc[req.resource_type] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      acc[req.resource_type].total += req.quantity;
      acc[req.resource_type][req.priority] += req.quantity;
      return acc;
    }, {});

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
