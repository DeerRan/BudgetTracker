const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const path = require('path')

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true, 
  useFindAndModify: false
});

// routes
app
  .use(express.static(path.join(__dirname, 'public')))
  .use(require(path.join(__dirname, "/routes/api.js")));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});