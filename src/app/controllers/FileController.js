import File from '../models/File';

class FileController {
  async store(req, res) {
    // o atributo file do objeto mult part tem diversas informações sobre o file
    // na linha abaixo ainda é alterado o nome da variavel
    // recebe originalname como name
    // E filename como path
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}
export default new FileController();
