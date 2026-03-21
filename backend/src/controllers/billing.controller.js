const pool = require('../config/db');

// ─── GET /api/billing ─────────────────────────────────────────────────────────
// Returns all invoices with patient name. Optional ?status= filter.
// Restricted to admin + billing.
const getAllInvoices = async (req, res, next) => {
  try {
    const { status } = req.query;                  // ?status=pending|paid|overdue
    const params = [];
    let where = '';

    if (status) {
      params.push(status);
      where = `WHERE i.status = $1`;
    }

    const result = await pool.query(
      `SELECT
         i.id, i.patient_id, i.description,
         i.amount, i.status, i.due_date,
         i.created_at, i.updated_at,
         p.first_name, p.last_name,
         u.name AS created_by_name
       FROM invoices i
       LEFT JOIN patients p ON p.id = i.patient_id
       LEFT JOIN users    u ON u.id = i.created_by
       ${where}
       ORDER BY i.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/billing/:id ─────────────────────────────────────────────────────
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
         i.*,
         p.first_name, p.last_name, p.phone, p.phone_code,
         u.name AS created_by_name
       FROM invoices i
       LEFT JOIN patients p ON p.id = i.patient_id
       LEFT JOIN users    u ON u.id = i.created_by
       WHERE i.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// ─── POST /api/billing ────────────────────────────────────────────────────────
const createInvoice = async (req, res, next) => {
  try {
    const { patientId, description, amount, status, dueDate } = req.body;

    if (!patientId || !description || amount === undefined || amount === '') {
      return res.status(400).json({ message: 'patientId, description, and amount are required' });
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    // Validate patient exists
    const patient = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (!patient.rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const validStatuses = ['pending', 'paid', 'overdue'];
    const invoiceStatus = validStatuses.includes(status) ? status : 'pending';

    const { rows } = await pool.query(
      `INSERT INTO invoices (patient_id, created_by, description, amount, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [patientId, req.user.id, description.trim(), Number(amount), invoiceStatus, dueDate || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// ─── PATCH /api/billing/:id ───────────────────────────────────────────────────
// Updates only the status of an invoice.
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'overdue'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus };
