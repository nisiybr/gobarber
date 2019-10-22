import jwt from 'jsonwebtoken';

import * as Yup from 'yup';

import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } }); // uso de object short syntax

    if (!user) {
      return res.status(401).json({ error: 'User does not exists' });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'The password is invalid' });
    }
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // primeiro parametro eh o id do user, segundo parametro eh um salt,terceiro parametro eh expiracao do token
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}
export default new SessionController();
