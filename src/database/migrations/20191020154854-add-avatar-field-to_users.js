module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // qual tabela
      'avatar_id', // nome da coluna
      {
        // informações sobre essa coluna nova
        type: Sequelize.INTEGER,
        references: {
          // adiciona como foreign key
          model: 'files', // nome da tabela referenciada
          key: 'id', // campo da tabela referenciada
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true,
        },
      }
    );
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
