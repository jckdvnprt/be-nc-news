const app = require("../db/app");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const getTopics = require("../db/controllers/controller");
const request = require("supertest");
const seed = require("../db/seeds/seed");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET api/topics", () => {
  test("should respond with 200 OK and array of topics", async () => {
    const response = await request(app).get("/api/topics");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((topic) => {
      console.log(topic);
      expect(topic).toHaveProperty("slug");
      expect(topic).toHaveProperty("description");
    });
  });

  test("should respond with 404 error for invalid pathway", async () => {
    const response = await request(app).get("/api/topicsssss/");
    expect(response.status).toBe(404);
  });
});
