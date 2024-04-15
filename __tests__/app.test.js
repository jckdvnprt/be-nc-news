const app = require("../db/app");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const seed = require("../db/seeds/seed");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET api/topics/", () => {
  test("should respond with 200 OK and array of topics", () => {
    return request(app)
      .get("/api/topics/")
      .then((response) => {
        expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(typeof topic.slug).toBe("string");
          expect(topic).toHaveProperty("description");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("Bad URL pathways", () => {
  test("should respond with 404 error for invalid pathway", () => {
    return request(app)
      .get("/api/topicsssss/")
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "No topics found" });
      });
  });
});
describe("GET /api", () => {
  it("should return a JSON representation of all available endpoints", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        expect(response.status).toBe(200);
        const apiEndpoints = response.body.endpoints;

        Object.values(apiEndpoints).forEach((endpoint) => {
          expect(endpoint).toEqual(
            expect.objectContaining({
              description: expect.any(String),

              queries: expect.any(Array),
            })
          );

          if (endpoint.description.includes("articles")) {
            expect(endpoint.queries).toEqual(
              expect.arrayContaining(["author", "topic", "sort_by", "order"])
            );
          } else if (endpoint.description.includes("topics")) {
            expect(endpoint.queries).toEqual(expect.arrayContaining([]));
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });
});
