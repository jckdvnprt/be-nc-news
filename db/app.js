const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
const {
  getArticle,
  getUsers,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
  deleteComment,
  getArticlesByTopic,
  getSingleComment,
} = require("./controllers/controller");
const endpoints = require("../endpoints.json");
const topics = require("../db/data/development-data/topics");
app.use(cors());
app.get("/api/", (req, res, next) => {
  res.status(200).send({ endpoints });
});
app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/articles/:article_id/comments/:comment_id", getSingleComment);
app.get("/api/comments/:comment_id", getSingleComment);

app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles/", (req, res) => {
  const { topic } = req.query;
  if (topic) {
    const topicExists = topics.some((topics) => topics.slug === topic);
    if (topicExists) {
      getArticlesByTopic(req, res);
    } else {
      res.status(404).send({ error: "Topic not found" });
    }
  } else {
    getAllArticles(req, res);
  }
});
app.get("/api/topics/", (req, res) => {
  res.status(200).send(topics);
});
app.get("/api/users/", getUsers);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/article/:article_id/comments/:comment_id", deleteComment);
app.delete("/api/comments/:comment_id", deleteComment);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "500! Internal Server Error" });
});
app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

module.exports = app;
