const db = require("../connection");
const {
  fetchArticleFromDatabase,
  fetchTopicsFromDatabase,
  fetchAllArticlesFromDataBase,
  fetchCommentsFromDatabase,
} = require("../models/model");

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase().then((topics) => {
    res.status(200).send(topics);
  });
};

const getComments = (req, res, next) => {
  const articleId = req.params.article_id; // Correctly access article_id from req.params

  fetchCommentsFromDatabase(articleId).then((comments) => {
    res.status(200).send(comments);
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

module.exports = { getTopics, getArticle, getAllArticles, getComments };
