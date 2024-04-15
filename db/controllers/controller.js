const db = require("../connection");

const fetchTopicsFromDatabase = async () => {
  try {
    const queryResult = await db.query("SELECT * FROM topics;");
    return queryResult.rows;
  } catch (error) {
    throw new Error("Error getting topics: " + error.message);
  }
};

const getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopicsFromDatabase();
    if (topics.length === 0) {
      res.status(404).send({ error: "No topics found" });
    } else {
      res.json(topics);
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { fetchTopicsFromDatabase, getTopics };
