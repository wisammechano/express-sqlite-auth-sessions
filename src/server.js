// init project
const express = require("express");
const sessions = require("express-session");
const path = require("path");

const indexRouter = require("./routes");
const { sequelize } = require("./db");

// Init our express app
const app = express();

sequelize.sync();

// Using `public` for static files: http://expressjs.com/en/starter/static-files.html
app.use(express.static(path.resolve(__dirname, "../public")));
app.set("views", path.join(__dirname, "views"));

// Below is where we introduce encrypted sessions
// Make sure your app secret is unique and
// defined by cryptographic random generator.
// It has in-built ability to parse and use cookies
app.use(
  sessions({
    secret: "MY_APP_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // make sure to change this to true on production code
  })
);

// Using urlencoded parser to parse application/x-www-form-urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Set the view engine to ejs template language
app.set("view engine", "ejs");

app.use("/", indexRouter);

var listener = app.listen(5000, function () {
  console.log("Listening on port " + listener.address().port);
});
