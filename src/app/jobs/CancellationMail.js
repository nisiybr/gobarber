import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail'; // para cada job é nexessário uma chave unica
    // se fizermos um import CancellationMail from '..'
    // é possivel utilizar CancellationMail.key() sem precisar de constructor
  }

  async handle({ data }) {
    const { appointment } = data;
    console.log('A fila executou!');

    // eh a função executada para cada ação na fila
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}
export default new CancellationMail();
