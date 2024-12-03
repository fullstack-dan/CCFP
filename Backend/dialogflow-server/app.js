const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dialogflowRoute = require("./routes/dialogflow");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/api/dialogflow", dialogflowRoute);

module.exports = app;
