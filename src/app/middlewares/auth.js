import jwt from 'jsonwebtoken';
import { promisify } from 'util'; // para utilizar o async await assincrono
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization; // busca o parametro de autorizacao do header
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' '); // essa deesestruturacao desconsidera a primeira posicao do array

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token not valid' });
  }
};
