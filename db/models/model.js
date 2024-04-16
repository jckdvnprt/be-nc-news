const db = require("../connection");

const fetchTopicsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM topics;").then((queryResult) => {
      resolve(queryResult.rows);
    });
  });
};

function fetchAllArticlesFromDataBase() {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles ORDER BY created_at DESC;"
    ).then(async (queryResult) => {
      const articles = queryResult.rows;

      for (const article of articles) {
        const articleId = article.article_id;

        const commentCount = await getCommentCountForArticle(articleId);

        article.comment_count = commentCount;
      }

      resolve(articles);
    });
  });
}
function getCommentCountForArticle(articleId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) AS comment_count FROM comments WHERE article_id = $1;",
      [articleId]
    ).then((queryResult) => {
      const commentCount = queryResult.rows[0].comment_count;
      resolve(commentCount);
    });
  });
}
function fetchArticleFromDatabase(articleId) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM articles WHERE article_id=$1;", [articleId]).then(
      (queryResult) => {
        if (queryResult.rows.length > 0) {
          resolve(queryResult.rows);
        } else {
          console.log("No article found with articleId:", articleId);
          resolve(null);
        }
      }
    );
  });
}

module.exports = {
  fetchTopicsFromDatabase,
  fetchArticleFromDatabase,
  fetchAllArticlesFromDataBase,
};
