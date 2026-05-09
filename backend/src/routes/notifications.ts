import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

const router = Router();
router.use(authenticate);

// GET /notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });
  res.json({ notifications, unreadCount });
});

// PUT /notifications/read-all  (must be before /:id)
router.put('/read-all', async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});

// PUT /notifications/:id/read
router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { read: true },
    { new: true }
  );
  if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
  res.json(notification);
});

// DELETE /notifications/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
  res.json({ message: 'Notification deleted' });
});

export default router;
