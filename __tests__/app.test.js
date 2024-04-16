const app = require("../db/app");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const endpoints = require("../endpoints.json");
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
        expect(response.body).toEqual({ msg: "Not Found" });
      });
  });
});

describe("GET /api", () => {
  test("should return a JSON representation of all available endpoints", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        expect(response.status).toBe(200);
        const apiEndpoints = response.body.endpoints;

        Object.values(apiEndpoints).forEach((endpoint) => {
          expect(endpoint.description).toEqual(expect.any(String));

          if (endpoint.hasOwnProperty("queries")) {
            expect(endpoint.queries).toEqual(expect.any(Array));
          }

          if (
            endpoint.description.includes("Serves an array of all articles")
          ) {
            expect(endpoint.queries).toEqual(
              expect.arrayContaining(["author", "topic", "sort_by", "order"])
            );
          } else if (
            endpoint.description.includes("Serves an array of all topics")
          ) {
            expect(endpoint.queries).toEqual(expect.arrayContaining([]));
          } else if (
            endpoint.description.includes("Gets an article by its ID")
          ) {
            expect(endpoint.exampleResponse).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  article_id: expect.any(Number),
                  title: expect.any(String),
                  topic: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(String),
                  votes: expect.any(String),
                  article_img_url: expect.any(String),
                }),
              ])
            );
          } else if (
            endpoint.description.includes("Gets all comments from an article")
          ) {
            expect(endpoint.exampleResponse).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  comment_id: expect.any(Number),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  article_id: expect.any(Number),
                }),
              ])
            );
          }
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should respond with 200 OK and an article object for a valid ID", () => {
    const testArticleId = 2;

    return request(app)
      .get(`/api/articles/${testArticleId}`)
      .then((response) => {
        const article = response.body;
        expect(200);
        expect(article).toMatchObject({
          article_id: testArticleId,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  test("should respond with 404 Not Found for a non-existing article ID", () => {
    const fakeID = 100;
    return request(app)
      .get(`/api/articles/${fakeID}`)
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Article not found" });
      });
  });

  describe("Get /api/articles/:article_id/comments", () => {
    test("Get comments by article id", () => {
      const testArticleId = 1;
      return request(app)
        .get(`/api/articles/${testArticleId}/comments`)
        .then((response) => {
          expect(200);
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: testArticleId,
            });
          });
        });
    });
    test("Comments should be sorted by newest first based on the created_at property", () => {
      const testArticleId = 6;
      return request(app)
        .get(`/api/articles/${testArticleId}/comments`)
        .then((response) => {
          const retrievedComments = response.body;

          expect(200);
          for (let i = 1; i < retrievedComments.length; i++) {
            expect(
              retrievedComments[i].created_at.toBeLessThanOrEqual(
                retrievedComments[i - 1].created_at
              )
            );
          }
        });
      test("Get comments for non-existent article id", () => {
        const nonExistentArticleId = 13;
        return request(app)
          .get(`/api/articles/${nonExistentArticleId}/comments`)
          .then((response) => {
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "Article not found" });
          });
      });
    });

    describe("Get /api/articles", () => {
      test("Get ALL ARTICLES sorted by created by", () => {
        return request(app)
          .get("/api/articles/")
          .then((response) => {
            const retrievedArticles = response.body;
            expect(200);
            expect(new Date(retrievedArticles[0].created_at)).toEqual(
              new Date("2020-11-03T09:12:00.000Z")
            );
            for (let i = 1; i < retrievedArticles.length; i++) {
              expect(
                new Date(retrievedArticles[i].created_at).getTime()
              ).toBeLessThanOrEqual(
                new Date(retrievedArticles[i - 1].created_at).getTime()
              );
            }
          });
      });
      test("Articles should have a comment count property", () => {
        return request(app)
          .get("/api/articles/")
          .then((response) => {
            const retrievedArticles = response.body;
            retrievedArticles.forEach((article) => {
              expect(article).toHaveProperty("comment_count");
              expect(article).toHaveProperty("votes");
              expect(article).toHaveProperty("topic");
              expect(article).toHaveProperty("created_at");
              expect(article).toHaveProperty("article_img_url");
              expect(article).toHaveProperty("article_id");
            });
          });
      });

      test("Articles should NOT have a 'body' property once returned", () => {
        return request(app)
          .get("/api/articles/")
          .then((response) => {
            const retrievedArticles = response.body;
            expect(response.status).toBe(200);
            retrievedArticles.forEach((article) => {
              expect(article.body).toBe(undefined);
            });
          });
      });
    });
  });
});
