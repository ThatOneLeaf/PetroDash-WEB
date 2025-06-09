const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a db.js file for database connection

// @route   GET /help/activities
// @desc    Get all help activities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const activities = await pool.query('SELECT * FROM help_activities');
    res.json(activities.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /help/activities
// @desc    Create a new help activity
// @access  Public
router.post('/', async (req, res) => {
  const { projectYear, companyId, programName, projectName, csrReport, projectExpenses, statusId } = req.body;
  try {
    const newActivity = await pool.query(
      `INSERT INTO help_activities (project_year, company_id, program_name, project_name, csr_report, project_expenses, status_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [projectYear, companyId, programName, projectName, csrReport, projectExpenses, statusId]
    );
    res.json(newActivity.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH /help/activities/:id
// @desc    Update a help activity
// @access  Public
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { projectYear, companyId, programName, projectName, csrReport, projectExpenses, statusId } = req.body;
  try {
    const updatedActivity = await pool.query(
      `UPDATE help_activities
       SET project_year = $1, company_id = $2, program_name = $3, project_name = $4, csr_report = $5, project_expenses = $6, status_id = $7
       WHERE project_id = $8 RETURNING *`,
      [projectYear, companyId, programName, projectName, csrReport, projectExpenses, statusId, id]
    );
    res.json(updatedActivity.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /help/activities/:id
// @desc    Delete a help activity
// @access  Public
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM help_activities WHERE project_id = $1', [id]);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;