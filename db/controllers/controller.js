const db = require("../connection");
const {
  fetchArticleFromDatabase,
  fetchTopicsFromDatabase,
  fetchAllArticlesFromDataBase,
} = require("../models/model");

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase().then((topics) => {
    res.status(200).send(topics);
  });
};

const getAllArticles = (req, res) => {
  fetchAllArticlesFromDataBase().then((articles) => {
    res.status(200).send(articles);
  });
};

const getArticle = (req, res) => {
  const articleId = req.params.article_id;
  console.log(articleId);
  fetchArticleFromDatabase(articleId).then((article) => {
    if (article) {
      const articleToSend = article[0];
      res.status(200).send(articleToSend);
    } else {
      res.status(404).send({ msg: "Article not found" });
    }
  });
};

module.exports = { getTopics, getArticle, getAllArticles };
