module.exports = (sequelize, Sequelize) => {
    const Record = sequelize.define("record", {
      station_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      year: {
        type: Sequelize.INTEGER
      },
      h_month: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.INTEGER
      },
      level: {
        type: Sequelize.FLOAT
      },
      flow: {
        type: Sequelize.INTEGER
      },
      temperature: {
        type: Sequelize.FLOAT
      },
      month: {
        type: Sequelize.INTEGER
      },
      // id: false // Disable automatic 'id' field
    }, {
      tableName: 'hydro_monthly_backup_2023',
      timestamps: false, 
      id: false,
    })
    return Record;
  };

  