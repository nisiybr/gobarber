import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';
// extname vai pegar a extensao
export default {
  storage: multer.diskStorage({
    // podem ser CDNs amazons3 ou digital ocean
    destination: resolve(__dirname, '../', '../', 'tmp', 'uploads'), // destino dos nossos arquivos
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        return cb(null, res.toString('hex') + extname(file.originalname)); // caso não haja erro
      });
    }, // como o nome da imagem sera formatado
  }),
};
