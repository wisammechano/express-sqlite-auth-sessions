var express = require("express");
var router = express.Router();

const { User } = require("../db");

router.get("/", (req, res) => {
  if (req.session.user) res.render("verified", { name: req.session.user.name });
  else res.render("index", { error: null, username: null });
});

router.get("/register", (req, res) => {
  if (req.session.user) res.redirect("/");
  else res.render("register", { error: null, username: null, name: null });
});

router.get("/logout", (req, res) => {
  // Logout the user then
  if (req.session.user) {
    req.session.destroy();
  }
  res.redirect("/");
});

router.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.login(username, password);

  if (user) {
    req.session.user = user;
    res.status(200).render("verified", { name: user.name });
  } else {
    res
      .status(404)
      .render("index", { error: "Invalid username or password", username });
  }
});

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  const passwordConfirm = req.body.confirmpassword;

  if (password !== passwordConfirm) {
    res.status(400).render("register", {
      error: "Passwords do not match",
      username,
      name,
    });
    return;
  }

  // Create user
  const { error, user } = await User.register(username, name, password);
  if (error) {
    res.status(400).render("register", {
      error,
      username,
      name,
    });
  } else {
    req.session.user = user;
    res.status(201).redirect("/");
  }
});

module.exports = router;
