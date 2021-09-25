const { UniqueConstraintError, Model } = require("sequelize");
const bcrypt = require("bcrypt");

class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: DataTypes.STRING,
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        hashed_password: DataTypes.BLOB,
      },
      { sequelize }
    );
  }

  async verify(password) {
    const hashed = this.hashed_password.toString();
    const result = await bcrypt.compare(password, hashed);
    return result;
  }

  static async login(username, password) {
    const user = await User.findOne({
      where: {
        username,
      },
    });

    if (user) {
      const verified = await user.verify(password);
      if (verified) {
        const record = user.get({ plain: true });
        delete record["hashed_password"];
        return record; // All good, return the user object
      } else {
        return false; // Incorrect password
      }
    }

    return false; // Username not found
  }

  static async register(username, name, password) {
    // check password length and strength
    if (password.length < 8) {
      return { error: "Password should be 8 characters or more", user: null };
    }

    const hashed = await User.hash(password);

    try {
      // we are using try clause to catch
      // duplicate username thrown by database
      const user = await User.create({
        username,
        name,
        hashed_password: hashed,
      });

      const record = user.get({ plain: true });

      delete record.hashed_password; // this is deleted so it is not passed down

      return { error: null, user: record };
    } catch (error) {
      // Here we handle duplicate username error
      if (error instanceof UniqueConstraintError) {
        const { path, type, message } = error.errors[0];
        if (path === "username" && type === "unique violation") {
          return { error: `Username ${username} already exists.`, user: null };
        }
        return { error: message, user: null };
      }
      return { error, user: null };
    }
  }

  // Convenient function to hash passwords
  static async hash(pw) {
    const saltRounds = 10;
    return await bcrypt.hash(pw, saltRounds);
  }
}

module.exports = User;
