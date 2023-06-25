const router = require('express').Router();
const Notification = require('../models/notification.model');
const authMiddleware = require('../middlewares/auth.mid');

// this route fetches the most recent five notifications for the authenticated user.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5);
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// this route marks all unread notifications for the authenticated user as read.
router.put('/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;