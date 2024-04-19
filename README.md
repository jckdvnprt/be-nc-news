# Northcoders News Backend

Welcome to Northcoders News! This is a backend project for a news articles database.

## Hosted Version

You can access the hosted version of Northcoders News at (https://nc-news-xd0a.onrender.com/).
There are various endpoints such as
Get all the articles - https://nc-news-xd0a.onrender.com/api/articles
Get all the users - https://nc-news-xd0a.onrender.com/api/users

## But what IS this project?

This project serves as the backend for a news articles database. It provides API endpoints for retrieving users, articles, and specific articles by ID.

## Installation and Setup

To get started with this project, follow these steps:

1. Clone the repository:
   git clone https://github.com/jckdvnprt/be-nc-news.git

2. Install all the dependencies
   npm install

3. Create the necessary `.env` files:

- Create a `.env.development` file with the following content:

  ```
  PGDATABASE=nc_news
  ```

- Create a `.env.test` file with the following content:
  ```
  PGDATABASE=nc_news_test
  ```

4. Set up the local database and seed data:
   npm run setup-dbs
   npm run seed

5. Run tests:
   npm run test

## Environment Variables

Ensure you have the following environment variables set:

- `PGDATABASE`: Specifies the name of the PostgreSQL database. For development, set it to `nc_news`. For testing, set it to `nc_news_test`.

## Requirements

This project requires the following minimum versions:

- Node.js
- PostgreSQL

## Dependencies

- **dotenv**: "^16.0.0"
- **express**: "^4.19.2"
- **pg**: "^8.7.3"

## DevDependencies

- **husky**: "^8.0.2"
- **jest**: "^27.5.1"
- **jest-extended**: "^2.0.0"
- **jest-sorted**: "^1.0.15"
- **pg-format**: "^1.0.4"
- **supertest**: "^6.3.4"
