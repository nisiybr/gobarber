import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    if (!checkUserIsProvider) {
      return res.status(401).json({ error: 'The user is not a provider' });
    }
    const { date } = req.query;
    const parsedDate = parseISO(date);
    const startDate = startOfDay(parsedDate);
    const endData = endOfDay(parsedDate);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startDate, endData],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });

    return res.json(appointments);
  }
}
export default new ScheduleController();