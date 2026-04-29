const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

// GET current user profile
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// GET all profiles (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teams(id, name, team_type)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update profile
router.patch('/me', authenticate, async (req, res) => {
  const allowed = ['full_name', 'avatar_url', 'phone'];
  const updates = {};
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update user role (admin only)
router.patch('/:id/role', authenticate, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'government', 'ngo', 'rescue_team'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
