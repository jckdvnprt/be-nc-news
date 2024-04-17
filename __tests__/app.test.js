const app = require("../db/app");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const toBeSortedBy = require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET api/topics/", () => {
  test("200 - should respond with 200 OK and array of topics", () => {
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
  test("404 - should respond with 404 error for invalid pathway", () => {
    return request(app)
      .get("/api/topicsssss/")
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Not Found" });
      });
  });
});

describe("GET /api", () => {
  test("200 - should return a JSON representation of all available endpoints and match data", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200 - should respond with 200 OK and an article object for a valid ID", () => {
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
  test("404 - should respond with 404 Not Found for a non-existing article ID", () => {
    const fakeID = 100;
    return request(app)
      .get(`/api/articles/${fakeID}`)
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Article not found" });
      });
  });

  describe("Get /api/articles/:article_id/comments", () => {
    test("200 - Get comments by article id", () => {
      const testArticleId = 1;
      return request(app)
        .get(`/api/articles/${testArticleId}/comments`)
        .then((response) => {
          expect(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
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
    test("200 - Comments should be sorted by newest first based on the created_at property", () => {
      const testArticleId = 6;
      return request(app)
        .get(`/api/articles/${testArticleId}/comments`)
        .then((response) => {
          const retrievedComments = response.body;
          expect(200);
          expect(retrievedComments).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("200 - valid article with no comments", () => {
      const validArticleId = 2;
      return request(app)
        .get(`/api/articles/${validArticleId}/comments`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({});
        });
    });
    test("404 - Get comments with invalid numeric ID", () => {
      const invalidArticleId = 12345;
      return request(app)
        .get(`/api/articles/${invalidArticleId}/comments`)
        .then((response) => {
          expect(response.status).toBe(404);
          expect(response.body).toEqual({ msg: "Article not found" });
        });
    });

    describe("Get /api/articles", () => {
      test("200 - Get ALL ARTICLES sorted by created by", () => {
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
      test("200 - Articles should have a comment count property", () => {
        return request(app)
          .get("/api/articles/")
          .then((response) => {
            expect(200);
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
      test("200 - Articles should NOT have a 'body' property once returned", () => {
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
