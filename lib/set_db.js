const { DataTypes, Sequelize } = require("sequelize");

// Configuration for SSL
const sslConfig = {
  require: true,
  rejectUnauthorized: false,
};

// Sequelize connection options for production or local environment
const productionOptions = {
  dialectOptions: { ssl: sslConfig },
  logging: false,
};

const localOptions = {
  dialect: "sqlite",
  storage: "./database/settings.db",
  logging: false,
};

// Initialize Sequelize instance based on environment
const DATABASE = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, productionOptions)
  : new Sequelize(localOptions);

// Retrieve or set data in the "settings" table
async function get_set(key) {
  // Define the "settings" model
  const Settings = DATABASE.define(
    "settings",
    { json: { type: DataTypes.TEXT, allowNull: false } },
    { timestamps: false }
  );

  await DATABASE.sync();

  // Fetch all records from the "settings" table
  const records = await Settings.findAll();

  if (records.length < 1) {
    return {}; // Return an empty object if no records exist
  } else {
    const data = JSON.parse(records[0].dataValues.json);

    if (key === "all") {
      return data; // Return all settings
    }

    return data[key] || false; // Return the specific key or false if not found
  }
}

// Insert or update data in the "settings" table
async function input_set(key, value) {
  // Define the "settings" model
  const Settings = DATABASE.define(
    "settings",
    { json: { type: DataTypes.TEXT, allowNull: false } },
    { timestamps: false }
  );

  await DATABASE.sync();

  // Fetch all records from the "settings" table
  const records = await Settings.findAll();

  if (records.length < 1) {
    // Create a new record if none exist
    const data = {};
    data[key] = value;
    return await Settings.create({ json: JSON.stringify(data) });
  } else {
    // Update the existing record
    const data = JSON.parse(records[0].dataValues.json);
    data[key] = value;
    return await records[0].update({ json: JSON.stringify(data) });
  }
}

// Export the functions
module.exports = {
  get_set,
  input_set,
};