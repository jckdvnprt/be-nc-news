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
          expect(200);
          expect(response.body).toEqual([]);
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

describe("POST /api/articles/:article_id/comments", () => {
  test("201 - should respond with 201 Created and the newly posted comment", () => {
    const testArticleId = 1;
    const newComment = {
      username: "rogersop",
      body: "This is my very fancy test comment.",
    };

    return request(app)
      .post(`/api/articles/${testArticleId}/comments`)
      .send(newComment)
      .then((response) => {
        expect(201);
        expect(response.body).toHaveProperty("comment_id");
        expect(response.body).toHaveProperty("votes");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("author", newComment.username);
        expect(response.body).toHaveProperty("body", newComment.body);
        expect(response.body).toHaveProperty("article_id", testArticleId);
      });
  });

  describe("POST /api/articles/:article_id/comments", () => {
    test("201 - should respond with 201 Created and the newly posted comment, ignoring unnecessary properties on the request body", () => {
      const testArticleId = 1;
      const newComment = {
        username: "rogersop",
        body: "This is my very fancy test comment.",
        pointlessComment: "This is a pointless comment",
      };

      return request(app)
        .post(`/api/articles/${testArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(201);
          expect(response.body).toHaveProperty("comment_id");
          expect(response.body).toHaveProperty("votes");
          expect(response.body).toHaveProperty("created_at");
          expect(response.body).toHaveProperty("author", newComment.username);
          expect(response.body).toHaveProperty("body", newComment.body);
          expect(response.body).toHaveProperty("article_id", testArticleId);
        });
    });

    test("400 - should respond with 400 Bad Request for missing username", () => {
      const testArticleId = 1;
      const newComment = {
        body: "This is a comment without a username, how very sad.",
      };

      return request(app)
        .post(`/api/articles/${testArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(400);
          expect(response.body).toEqual({
            msg: "Username and body are required",
          });
        });
    });

    test("400 - should respond with 400 Bad Request for missing body", () => {
      const testArticleId = 1;
      const newComment = {
        username: "lurker",
      };
      return request(app)
        .post(`/api/articles/${testArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(400);
          expect(response.body).toEqual({
            msg: "Username and body are required",
          });
        });
    });

    test("400 - should respond with 400 Bad Request for invalid username", () => {
      const testArticleId = 1;
      const newComment = {
        username: "jckdvnprt",
        body: "This is my very fancy test comment.",
      };

      return request(app)
        .post(`/api/articles/${testArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(400);
          expect(response.body).toEqual({
            msg: "Invalid username",
          });
        });
    });

    test("404 - should respond with 404 Not Found for non-existing article ID", () => {
      const invalidArticleId = 123456789;
      const newComment = {
        username: "lurker",
        body: "Test comment that won't be posted anyway because of the error! Oops!",
      };

      return request(app)
        .post(`/api/articles/${invalidArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(404);
          expect(response.body).toEqual({ msg: "Article not found" });
        });
    });

    test("400 - should respond with 400 Bad Request for database error", () => {
      const invalidArticleId = "invalid-article-id";
      const newComment = {
        username: "rogersop",
        body: "This comment won't be posted because of the invalid article ID *sad face emoji*.",
      };

      return request(app)
        .post(`/api/articles/${invalidArticleId}/comments`)
        .send(newComment)
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({ msg: "Invalid article ID" });
        });
    });

    describe("PATCH /api/articles/:article_id", () => {
      test("200 - responds with the updated article when adding new votes", () => {
        const articleId = 1;
        const existingVotes = 100;
        const newVotes = 200;
        return request(app)
          .patch(`/api/articles/${articleId}`)
          .send({ inc_votes: newVotes })
          .expect(200)
          .then((response) => {
            const updatedArticle = response.body;
            expect(updatedArticle).toHaveProperty("article_id", articleId);
            expect(updatedArticle).toHaveProperty(
              "votes",
              newVotes + existingVotes
            );
          });
      });

      test("200 - responds with the updated article when taking votes away", () => {
        const articleId = 1;
        const existingVotes = 100;
        const newVotes = -99;
        return request(app)
          .patch(`/api/articles/${articleId}`)
          .send({ inc_votes: newVotes })
          .expect(200)
          .then((response) => {
            const updatedArticle = response.body;
            expect(updatedArticle).toHaveProperty("article_id", articleId);
            expect(updatedArticle).toHaveProperty(
              "votes",
              newVotes + existingVotes
            );
          });
      });

      test("400 - responds with error for non-integer inc_votes", () => {
        const articleId = 1;
        const existingVotes = 100;
        const newVotes = "invalid_type";
        return request(app)
          .patch(`/api/articles/${articleId}`)
          .send({ inc_votes: newVotes })
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({
              msg: "inc_votes must be an integer",
            });
          });
      });

      test("400 - responds with error for empty request body", () => {
        const articleId = 1;
        const existingVotes = 100;
        const newVotes = 200;
        return request(app)
          .patch(`/api/articles/${articleId}`)
          .send({})
          .expect(400)
          .then((response) => {
            expect(response.body).toEqual({
              msg: "Request body cannot be empty",
            });
          });
      });

      test("404 - responds with error when article is not found", () => {
        const nonExistingArticleId = 23123;
        const existingVotes = 100;
        const newVotes = 200;
        return request(app)
          .patch(`/api/articles/${nonExistingArticleId}`)
          .send({ inc_votes: newVotes })
          .expect(404)
          .then((response) => {
            expect(response.body).toEqual({ msg: "Article not found" });
          });
      });
    });

    describe("DELETE /api/comments/:comment_id", () => {
      test("204 - should respond with 204 No Content for successful deletion", () => {
        const commentIdToDelete = 1;
        return request(app)
          .delete(`/api/comments/${commentIdToDelete}`)
          .then((response) => {
            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
          });
      });
      test("404 - should respond with 404 Not Found for non-existent comment", () => {
        const nonExistentCommentId = 12323;
        return request(app)
          .delete(`/api/comments/${nonExistentCommentId}`)
          .then((response) => {
            expect(404);
            expect(response.body.msg).toBe("Comment not found");
          });
      });
      test("400 - should respond with 400 Bad Request for invalid comment ID", () => {
        const invalidCommentId = "ThisIsNOTAnID";
        return request(app)
          .delete(`/api/comments/${invalidCommentId}`)
          .then((response) => {
            expect(400);
          });
      });
    });
  });
});

describe("GET /api/users", () => {
  test("200 - should respond with an array of users", () => {
    return request(app)
      .get("/api/users")
      .then((response) => {
        expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200 - should respond with articles filtered by topic if topic is provided", () => {
    const testTopic = "cats";
    return request(app)
      .get(`/api/articles?topic=${testTopic}`)
      .then((response) => {
        expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((article) => {
          expect(article.topic).toBe(testTopic);
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: testTopic,
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
      });
  });
  test("404 - should respond with an error message if the requested topic doesn't exist", () => {
    const testTopic = "theFilmsOfJackieChan";
    return request(app)
      .get(`/api/articles?topic=${testTopic}`)
      .then((response) => {
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: "Topic not found" });
      });
  });

  test("200 - should respond with all articles if no topic is provided", () => {
    return request(app)
      .get("/api/articles")
      .then((response) => {
        expect(200);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200 - should respond with 200 OK for a SINGLE article object for a valid ID with comment_count included", () => {
    const testArticleId = 5;
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
          comment_count: expect.any(Number),
        });
      });
  });
});
