import Users from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await Users.findAll({
      where: { provider: true }, // where da query
      attributes: ['id', 'name', 'email', 'avatar_id'], // select da query
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ], // faz o join e traz os atributos do avatar
    });
    return res.json(providers);
  }
}
export default new ProviderController();
