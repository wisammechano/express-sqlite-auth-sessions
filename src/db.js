const Sequelize = require("sequelize");
const path = require("path");

var DB_PATH = path.resolve(__dirname, "../cache/main.db");

// Import our models here
const User = require("./models/user");

// Instantiate a new sequelize instance to use SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
});

const models = {
  User: User.init(sequelize, Sequelize),
};

// Run `.associate` if it exists,
// ie create relationships in the ORM
Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

const db = {
  ...models,
  sequelize,
};

module.exports = db;
