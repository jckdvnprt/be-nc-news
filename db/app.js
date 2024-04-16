const express = require("express");
const app = express();
const {
  getTopics,
  getArticle,
  getAllArticles,
  getComments,
} = require("./controllers/controller");
const endpoints = require("../endpoints.json");

app.get("/api/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles/", getAllArticles);
app.get("/api/topics/", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "500! Internal Server Error" });
});

module.exports = app;
