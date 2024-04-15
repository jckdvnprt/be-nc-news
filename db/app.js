const express = require("express");
const app = express();
const getTopics = require("./controllers/controller");
const endpoints = require("../endpoints.json");

app.get("/api", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics/", getTopics);

app.all("/api/*", (req, res) => {
  res.status(404).send({ msg: "No topics found" });
});

module.exports = app;
