const db = require("../connection");

const fetchTopicsFromDatabase = () => {
  return db.query("SELECT * FROM topics;").then((queryResult) => {
    return queryResult.rows;
  });
};

function fetchAllArticlesFromDataBase() {
  return db
    .query(
      "SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles ORDER BY created_at DESC;"
    )
    .then((queryResult) => {
      const articles = queryResult.rows;
      const promises = articles.map((article) => {
        const articleId = article.article_id;
        return getCommentCountForArticle(articleId).then((commentCount) => {
          article.comment_count = commentCount;
          return article;
        });
      });
      return Promise.all(promises);
    });
}

function getCommentCountForArticle(articleId) {
  return db
    .query(
      "SELECT COUNT(*) AS comment_count FROM comments WHERE article_id = $1;",
      [articleId]
    )
    .then((queryResult) => {
      const commentCount = queryResult.rows[0].comment_count;
      return commentCount;
    });
}

function fetchArticleFromDatabase(articleId) {
  return db
    .query("SELECT * FROM articles WHERE article_id=$1;", [articleId])
    .then((queryResult) => {
      if (queryResult.rows.length > 0) {
        return queryResult.rows;
      } else {
        console.log("No article found with articleId:", articleId);
        return null;
      }
    });
}

function fetchCommentsFromDatabase(articleId) {
  return db
    .query(
      "SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id=$1 ORDER BY created_at DESC;",
      [articleId]
    )
    .then((queryResult) => {
      if (queryResult.rows.length > 0) {
        return queryResult.rows;
      } else {
        console.log("No article found with articleId:", articleId);
        return null;
      }
    });
}

module.exports = {
  fetchTopicsFromDatabase,
  fetchArticleFromDatabase,
  fetchAllArticlesFromDataBase,
  fetchCommentsFromDatabase,
};
