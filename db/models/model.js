const db = require("../connection");
// const { articleData } = require("../data/test-data");

const fetchTopicsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM topics;")
      .then((queryResult) => {
        resolve(queryResult.rows);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

function fetchArticleFromDatabase(articleId) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM articles WHERE article_id=$1;", [articleId])
      .then((queryResult) => {
        if (queryResult.rows.length > 0) {
          resolve(queryResult.rows);
        } else {
          console.log("No article found with articleId:", articleId);
          resolve(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching article:", error);
        reject(error);
      });
  });
}

module.exports = { fetchTopicsFromDatabase, fetchArticleFromDatabase };
