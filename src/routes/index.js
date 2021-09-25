const passport = require("passport");
const express = require("express");
const router = express.Router();

const { User } = require("../db");

router.get("/", (req, res) => {
  if (req.user) res.render("verified", { name: req.user.name });
  else res.render("index", { error: null, username: null });
});

router.get("/register", (req, res) => {
  if (req.user) res.redirect("/");
  else res.render("register", { error: null, username: null, name: null });
});

router.get("/logout", (req, res) => {
  // Logout the user then
  req.logout();
  res.redirect("/");
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
  })
);

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  const passwordConfirm = req.body.confirmpassword;

  const badRequest = (payload) => {
    res.status(400).render("register", payload);
  };

  // Check user typed correct password
  if (password !== passwordConfirm) {
    badRequest({
      error: "Passwords do not match",
      username,
      name,
    });
    return;
  }

  // check password length and strength
  if (password.length < 8) {
    badRequest({
      error: "Password should be 8 characters or more",
      username,
      name,
    });
    return;
  }

  // Check username exists
  const exists = await User.findOne({
    where: {
      username,
    },
  });

  if (exists) {
    badRequest({
      error: `Username ${username} already exists.`,
      name,
      username: null,
    });
    return;
  }

  // Create user
  const hashed = await User.hash(password);
  const user = await User.create({
    username,
    name,
    hashed_password: hashed,
  });

  // login the user to session
  req.login(user, function (err) {
    res.redirect("/");
  });
});

module.exports = router;
