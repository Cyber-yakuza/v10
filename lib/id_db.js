const { DataTypes, Sequelize } = require("sequelize");

const sslOptions = {
  require: true,
  rejectUnauthorized: false
};

const dialectOptions = {
  ssl: sslOptions
};

const sequelizeOptions = {
  dialectOptions,
  logging: false
};

const sqliteOptions = {
  dialect: "sqlite",
  storage: "./database/id.db",
  logging: false
};

const DATABASE = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
  : new Sequelize(sqliteOptions);

async function check(tableName) {
  const modelDefinition = {
    num: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      primaryKey: true
    },
    cmd: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  };

  const modelOptions = { timestamps: false };

  const tableModel = DATABASE.define(tableName, modelDefinition, modelOptions);
  await DATABASE.sync();

  const records = await tableModel.findAll();
  return records.length > 0;
}

async function input_data(command, number, tableName) {
  const modelDefinition = {
    num: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      primaryKey: true
    },
    cmd: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  };

  const modelOptions = { timestamps: false };

  const tableModel = DATABASE.define(tableName, modelDefinition, modelOptions);
  await DATABASE.sync();

  const condition = { where: { num: number } };
  const existingRecord = await tableModel.findAll(condition);

  if (existingRecord.length < 1) {
    return await tableModel.create({ num: number, cmd: command });
  } else {
    return await existingRecord[0].update({ num: number, cmd: command });
  }
}

async function get_data(tableName, number) {
  const modelDefinition = {
    num: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      primaryKey: true
    },
    cmd: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  };

  const modelOptions = { timestamps: false };

  const tableModel = DATABASE.define(tableName, modelDefinition, modelOptions);
  await DATABASE.sync();

  const condition = { where: { num: number } };
  const records = await tableModel.findAll(condition);

  return records.length > 0 ? records[0].dataValues : false;
}

module.exports = {
  input_data,
  get_data,
  check
};
