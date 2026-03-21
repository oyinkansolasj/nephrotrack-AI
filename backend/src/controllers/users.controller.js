const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['clinician', 'admin', 'records_officer', 'billing'];

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Returns all staff accounts (no password_hash). Admin only.
const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// ─── POST /api/users ──────────────────────────────────────────────────────────
// Creates a new staff account with a bcrypt-hashed password. Admin only.
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' });
    }

    // Check for duplicate email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows[0]) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), email.toLowerCase().trim(), hash, role]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
// Updates a staff account's name, email, role, or is_active status. Admin only.
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    // Check user exists
    const exists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (!exists.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    // If changing email, check it's not taken by someone else
    if (email) {
      const taken = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), id]
      );
      if (taken.rows[0]) {
        return res.status(409).json({ message: 'That email is already in use by another account' });
      }
    }

    const { rows } = await pool.query(
      `UPDATE users SET
         name      = COALESCE($1, name),
         email     = COALESCE($2, email),
         role      = COALESCE($3, role),
         is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING id, name, email, role, is_active, created_at`,
      [
        name?.trim()                || null,
        email?.toLowerCase().trim() || null,
        role                        || null,
        isActive !== undefined ? Boolean(isActive) : null,
        id,
      ]
    );

    res.json(rows[0]);
  } catch (err) { next(err); }
};

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// Soft-deletes a user by setting is_active = FALSE.
// Hard delete is avoided to preserve audit trails. Admin only.
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const result = await pool.query(
      `UPDATE users SET is_active = FALSE WHERE id = $1
       RETURNING id, name, email, role, is_active`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', user: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
