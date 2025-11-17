const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// AUTO LOAD ALL ROUTE HANDLERS IN /views
fs.readdirSync(path.join(__dirname, './views'))
  .forEach((file) => {
      if (file.endsWith('.js')) {
          require(`./views/${file}`)(app);
      }
  });

module.exports = app;
