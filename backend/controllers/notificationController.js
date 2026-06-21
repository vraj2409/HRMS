import { dbService } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const list = await dbService.notifications.find({ employeeId: req.user.id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: err.message });
  }
};

export const readNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await dbService.notifications.updateOne({ id }, { read: true });
    res.json({ message: 'Message read' });
  } catch (err) {
    res.status(500).json({ message: 'Action failed.', error: err.message });
  }
};
