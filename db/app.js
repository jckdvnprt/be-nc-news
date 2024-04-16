const express = require("express");
const app = express();
const { getTopics, getArticle } = require("./controllers/controller");
const endpoints = require("../endpoints.json");

app.get("/api/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/articles/:article_id", getArticle);
app.get("/api/topics/", getTopics);

app.use((req, res) => {
  res.status(404).send({ msg: "404! Not Found!" });
});

module.exports = app;
