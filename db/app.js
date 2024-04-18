const express = require("express");
const app = express();
app.use(express.json());
const {
  getTopics,
  getArticle,
  getUsers,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
  deleteComment,
} = require("./controllers/controller");
const endpoints = require("../endpoints.json");

app.get("/api/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles/", getAllArticles);
app.get("/api/topics/", getTopics);
app.get("/api/users/", getUsers);

app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "500! Internal Server Error" });
});

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

module.exports = app;
