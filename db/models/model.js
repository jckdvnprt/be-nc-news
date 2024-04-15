const db = require("../connection");

const fetchTopicsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM topics;").then((queryResult) => {
      resolve(queryResult.rows);
    });
  });
};

module.exports = fetchTopicsFromDatabase;
