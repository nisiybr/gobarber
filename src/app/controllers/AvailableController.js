import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    const { providerId } = req.params;
    if (!date) {
      return res.status(400).json({ error: 'Invalid Date' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00', // 2019-10-22 08:00:00
      '09:00', // 2019-10-22 09:00:00
      '10:00', // 2019-10-22 10:00:00
      '11:00', // 2019-10-22 11:00:00
      '12:00', // 2019-10-22 12:00:00
      '14:00', // 2019-10-22 14:00:00
      '15:00', // 2019-10-22 15:00:00
      '16:00', // 2019-10-22 16:00:00
      '17:00', // 2019-10-22 17:00:00
      '18:00', // 2019-10-22 18:00:00
      '23:00', // 2019-10-22 23:00:00
    ];

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}
export default new AvailableController();
