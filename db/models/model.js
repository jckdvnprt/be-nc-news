const db = require("../connection");
const { articleData } = require("../data/test-data");
const users = require("../data/test-data/users");

const fetchTopicsFromDatabase = () => {
  return db.query("SELECT * FROM topics;").then((queryResult) => {
    return queryResult.rows;
  });
};

const fetchAllUsersFromDatabase = () => {
  return db
    .query("SELECT username, name, avatar_url FROM users;")
    .then((queryResult) => {
      return queryResult.rows;
    })
    .catch((error) => {
      throw error;
    });
};

const checkUsernameExists = (username) => {
  return users.some((user) => user.username === username);
};

const updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      "UPDATE articles SET votes = Votes+$1 WHERE article_id = $2 RETURNING *;",
      [inc_votes, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

const postCommentToDatabase = (article_id, author, body) => {
  return fetchArticleFromDatabase(article_id).then((article) => {
    if (!article) {
      return { msg: "Article not found" };
    }
    const insertCommentQuery = {
      text: "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;",
      values: [article_id, author, body],
    };
    return db
      .query(insertCommentQuery)
      .then((insertedComment) => insertedComment.rows[0]);
  });
};

function fetchAllArticlesFromDataBase() {
  return db
    .query(
      "SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles ORDER BY created_at DESC;"
    )
    .then((queryResult) => {
      const articles = queryResult.rows;
      if (articles.length === 0) {
        throw { status: 404, msg: "No articles found" };
      }
      const promises = articles.map((article) => {
        const articleId = article.article_id;
        return getCommentCountForArticle(articleId).then((commentCount) => {
          article.comment_count = commentCount;
          return article;
        });
      });
      return Promise.all(promises);
    })
    .catch((error) => {
      console.error(error);
      if (error.status && error.msg) {
        throw error;
      } else {
        throw new Error("Error fetching articles from the database");
      }
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
      return queryResult.rows || [];
    })
    .catch((err) => {
      console.error("Error fetching comments:", err);
      throw err;
    });
}

function deleteCommentFromDatabase(comment_id) {
  return db
    .query("DELETE FROM comments WHERE comment_id=$1", [comment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        const error = new Error("Comment not found");
        error.status = 404;
        throw error;
      }
      return { msg: "Comment deleted successfully" };
    })
    .catch((err) => {
      console.error("Error deleting comment:", err);
      throw err;
    });
}

module.exports = {
  checkUsernameExists,
  deleteCommentFromDatabase,
  fetchTopicsFromDatabase,
  fetchArticleFromDatabase,
  fetchAllArticlesFromDataBase,
  fetchAllUsersFromDatabase,
  fetchCommentsFromDatabase,
  postCommentToDatabase,
  updateArticleVotes,
};
