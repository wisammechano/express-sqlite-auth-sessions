var passport = require("passport");
var Local = require("passport-local");
var User = require("./models/user");

module.exports = function () {
  // Configure the local strategy for use by Passport.
  //
  // The local strategy requires a `verify` function which receives the credentials
  // (`username` and `password`) submitted by the user.  The function must verify
  // that the password is correct and then invoke `cb` with a user object, which
  // will be set at `req.user` in route handlers after authentication.
  passport.use(
    new Local(async (username, password, cb) => {
      const user = await User.findOne({
        where: {
          username,
        },
      }).catch((err) => {
        return cb(err);
      });

      if (user) {
        const verified = await user.verify(password);
        if (verified) {
          const { username, name, id } = user;
          return cb(null, { username, name, id }); // All good, return the user object
        } else {
          // Incorrect password
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }
      }

      // Username not found
      return cb(null, false, { message: "Incorrect username or password." });
    })
  );

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.username, name: user.name });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};
