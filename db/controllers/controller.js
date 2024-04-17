const db = require("../connection");
const {
  fetchArticleFromDatabase,
  fetchTopicsFromDatabase,
  fetchAllArticlesFromDataBase,
  fetchCommentsFromDatabase,
  postCommentToDatabase,
  checkArticleExists,
  checkUsernameExists,
} = require("../models/model");

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase().then((topics) => {
    res.status(200).send(topics);
  });
};

const postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  checkArticleExists(article_id)
    .then((exists) => {
      if (!exists) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      if (!username || !body) {
        return Promise.reject({
          status: 400,
          msg: "Username and body are required",
        });
      }
      return checkUsernameExists(username);
    })
    .then((usernameExists) => {
      if (!usernameExists) {
        return Promise.reject({ status: 400, msg: "Invalid username" });
      }
      return fetchArticleFromDatabase(article_id);
    })
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      return postCommentToDatabase(article_id, username, body);
    })
    .then((insertedComment) => {
      res.status(201).send(insertedComment);
    })
    .catch((err) => {
      console.error(err);
      if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        res.status(500).send({ msg: "Internal Server Error" });
      }
    });
};

const getComments = (req, res, next) => {
  const articleId = req.params.article_id;
  fetchArticleFromDatabase(articleId).then((article) => {
    if (article) {
      return fetchCommentsFromDatabase(articleId).then((comments) => {
        res.status(200).send(comments);
      });
    } else {
      res.status(404).send({ msg: "Article not found" });
    }
  });
};

const getAllArticles = (req, res) => {
  fetchAllArticlesFromDataBase().then((articles) => {
    res.status(200).send(articles);
  });
};

const getArticle = (req, res) => {
  const articleId = req.params.article_id;
  fetchArticleFromDatabase(articleId).then((article) => {
    if (article) {
      const articleToSend = article[0];
      res.status(200).send(articleToSend);
    } else {
      res.status(404).send({ msg: "Article not found" });
    }
  });
};

module.exports = {
  getTopics,
  getArticle,
  getAllArticles,
  getComments,
  postComment,
};
