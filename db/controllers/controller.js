const db = require("../connection");
const fetchTopicsFromDatabase = require("../models/model");

const getTopics = (req, res, next) => {
  fetchTopicsFromDatabase()
    .then((topics) => {
      res.status(200);
      res.send(topics);
    })
    .catch((error) => {
      res.status(500).send({ msg: "Internal Server Error" });
    });
};

module.exports = getTopics;
