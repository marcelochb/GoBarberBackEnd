import Notification from '../schemas/Notifications';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications' });
    }

    const notification = await Notification.find({
      user: req.userId,
    })
      .sort({ createAt: 'desc' })
      .limit(20);

    return res.json(notification);
  }
}

export default new NotificationController();
