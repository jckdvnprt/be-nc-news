const db = require("../connection");
const {
  fetchArticleFromDatabase,
  fetchTopicsFromDatabase,
} = require("../models/model");

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase()
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch((error) => {
      res.status(500).send({ msg: "Internal Server Error" });
    });
};

const getArticle = (req, res) => {
  const articleId = req.params.article_id;
  fetchArticleFromDatabase(articleId)
    .then((article) => {
      if (article) {
        res.status(200).send({ article });
      } else {
        res.status(404).send({ msg: "Article not found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching article:", error);
      res.status(500).send({ msg: "Internal Server Error" });
    });
};

module.exports = { getTopics, getArticle };
