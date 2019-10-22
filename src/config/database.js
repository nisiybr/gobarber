require('dotenv/config'); // importa variaveis de ambiente, coloca tudo dentro de process.env)

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true, // prefere criar nome de tabelas separados por _
    underscoredAll: true, // prefere criar nome de tabelas e colunas separados por  _
  },
};
