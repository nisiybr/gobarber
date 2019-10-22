import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      // busca no bd para checar se é provider
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' }); // caso nao seja provider
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id, // campo de busca
      { read: true }, // alteração
      { new: true } // retorna a nova notificação atualizada para enviar no return
    );
    notification.read = true;
    return res.json(notification);
  }
}
export default new NotificationController();
