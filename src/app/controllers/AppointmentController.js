import * as Yup from 'yup'; // importa o yup para validacao de campos
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment'; // importa Model
import User from '../models/User'; // importa User para verificar se o provider eh provider
import File from '../models/File'; // importa para pegar o avatar
import Notification from '../schemas/Notification'; // importa para pegar o avatar

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancellable'],
      limit,
      offset: (page - 1) * limit, // quantos registros vao ser pulados
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    // metodo para criar
    const schema = Yup.object().shape({
      // validacao dos campos
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' }); // se validacao falhar
    }

    const { provider_id, date } = await req.body;
    // checar se o provider_id é um provider

    const isProvider = await User.findOne({
      // busca no bd para checar se é provider
      where: {
        id: provider_id,
        provider: true,
      },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers!' }); // caso nao seja provider
    }

    const isClient = await User.findOne({
      // busca no bd para checar se é provider
      where: {
        id: req.userId,
        provider: false,
      },
    });
    if (!isClient) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments as a client' }); // caso nao seja provider
    }
    // parseIso converte o utc no fomato date do JS
    // startOfHour trunca as horas e minutos passados no req.body
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date is not permitted' }); // caso a data ja seja passada
    }
    // Se o provider já não ter agendamento no horario
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' }); // caso nao seja provider
    }

    const appointment = await Appointment.create({
      // caso seja provider criar o agendamento
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    const user = await User.findOne({
      where: { id: req.userId },
    });
    // aspas duplas para usar aspas simples dentro
    // o que está dentro das aspas simples não é formatado
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    // Criar registro de notificação
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    // o agendamento precisa ser do usuario logado
    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the owner of the appointment' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }
    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();
