const express = require('express');
const router = express.Router();

// GET /help/activities
router.get('/help/activities', async (req, res) => {
  try {
    // Replace with your actual data fetching logic
    const activities = []; // e.g., await db.collection('activities').find().toArray();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /help/activities (optional, for adding new activities)
router.post('/help/activities', async (req, res) => {
  try {
    // Replace with your actual insert logic
    // const newActivity = await db.collection('activities').insertOne(req.body);
    res.status(201).json({ message: 'Activity created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

module.exports = router;
