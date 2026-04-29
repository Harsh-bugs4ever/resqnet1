const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET alerts
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('alerts')
      .select(`*, profiles!alerts_created_by_fkey(full_name, role)`)
      .order('created_at', { ascending: false })
      .limit(50);

    // Non-admins see only alerts targeted to them or broadcast
    if (!['admin', 'government'].includes(req.user.role)) {
      query = query.or(`target_role.eq.all,target_team_id.eq.${req.user.team_id || 'null'},target_user_id.eq.${req.user.id}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create alert (admin/govt only)
router.post('/', authenticate, requireRole('admin', 'government'), async (req, res) => {
  const { title, message, alert_type, target_role, target_team_id, incident_id } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'title and message are required' });

  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        title,
        message,
        alert_type: alert_type || 'info',
        target_role: target_role || 'all',
        target_team_id,
        incident_id,
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

module.exports = router;
