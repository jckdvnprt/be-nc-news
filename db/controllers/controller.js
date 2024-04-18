const db = require("../connection");
const {
  fetchArticleFromDatabase,
  fetchTopicsFromDatabase,
  fetchAllArticlesFromDataBase,
  fetchCommentsFromDatabase,
  postCommentToDatabase,
  checkUsernameExists,
  updateArticleVotes,
  deleteCommentFromDatabase,
  fetchAllUsersFromDatabase,
} = require("../models/model");

const getUsers = (req, res) => {
  fetchAllUsersFromDatabase()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((error) => {
      console.error("Error getting users:", error);
      res.status(500).send({ msg: "Internal server error" });
    });
};

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentFromDatabase(comment_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch((error) => {
      if (error.status === 404) {
        return res.status(404).send({ msg: "Comment not found" });
      }
      if (error.status === 400) {
        return res
          .status(400)
          .send({ msg: "400! Bad Request - Invalid Comment ID" });
      }
      next(error);
    });
};

const patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({ msg: "Request body cannot be empty" });
  }
  if (!Number.isInteger(inc_votes)) {
    return res.status(400).send({ msg: "inc_votes must be an integer" });
  }
  fetchArticleFromDatabase(article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      return updateArticleVotes(article_id, inc_votes);
    })
    .then((updatedArticle) => {
      res.status(200).send(updatedArticle);
    })
    .catch(next);
};

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase().then((topics) => {
    res.status(200).send(topics);
  });
};

const postComment = (req, res, next) => {
  return fetchArticleFromDatabase(req.params.article_id)
    .then((article) => {
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      if (!req.body.username || !req.body.body) {
        return Promise.reject({
          status: 400,
          msg: "Username and body are required",
        });
      }
      return checkUsernameExists(req.body.username);
    })
    .then((usernameExists) => {
      if (!usernameExists) {
        return Promise.reject({ status: 400, msg: "Invalid username" });
      }
      return postCommentToDatabase(
        req.params.article_id,
        req.body.username,
        req.body.body
      );
    })
    .then((insertedComment) => {
      res.status(201).send(insertedComment);
    })
    .catch((err) => {
      console.error(err);
      if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        res.status(400).send({ msg: "Invalid article ID" });
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
  getUsers,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
  deleteComment,
};
