# Odin Blog API — Backend

A RESTful blog API(https://odin-blog-api-backend.onrender.com/) built with Node.js, Express, Prisma ORM, and PostgreSQL. Features JWT-based authentication with Passport.js, role-based access control, and full CRUD for posts and comments.

---

## Tech Stack

- **Runtime** — Node.js (ES Modules)
- **Framework** — Express
- **Database** — PostgreSQL (Neon)
- **ORM** — Prisma
- **Auth** — Passport.js (Local + JWT strategies), bcryptjs, jsonwebtoken
- **Other** — cors, dotenv

---

### Installation

```bash
git clone https://github.com/your-username/odin-blog-api-backend.git
cd odin-blog-api-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_long_random_secret
PORT=5001
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run the Server

```bash
npm run dev   # development with nodemon
npm start     # production
```

---

## Database Schema

### User

| Field     | Type     | Notes              |
| --------- | -------- | ------------------ |
| id        | Int      | Auto increment     |
| username  | String   | Unique             |
| email     | String   | Unique             |
| password  | String   | Hashed with bcrypt |
| role      | Enum     | USER or AUTHOR     |
| createdAt | DateTime |                    |
| updatedAt | DateTime |                    |

### Post

| Field     | Type     | Notes                      |
| --------- | -------- | -------------------------- |
| id        | Int      | Auto increment             |
| title     | String   |                            |
| content   | String   |                            |
| status    | Enum     | DRAFT, PUBLISHED, ARCHIVED |
| authorId  | Int      | FK → User                  |
| createdAt | DateTime |                            |
| updatedAt | DateTime |                            |

### Comment

| Field     | Type     | Notes          |
| --------- | -------- | -------------- |
| id        | Int      | Auto increment |
| comment   | String   |                |
| postId    | Int      | FK → Post      |
| authorId  | Int      | FK → User      |
| createdAt | DateTime |                |
| updatedAt | DateTime |                |

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint  | Access | Description           |
| ------ | --------- | ------ | --------------------- |
| POST   | `/signup` | Public | Register a new user   |
| POST   | `/login`  | Public | Login and receive JWT |

#### POST `/api/auth/signup`

```json
{
  "username": "testuser",
  "email": "test@test.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### POST `/api/auth/login`

```json
{
  "email": "test@test.com",
  "password": "password123"
}
```

Returns:

```json
{
  "message": "Login successful",
  "token": "<jwt_token>"
}
```

---

### User Routes — `/api/users`

| Method | Endpoint         | Access    | Description            |
| ------ | ---------------- | --------- | ---------------------- |
| POST   | `/become-author` | Logged in | Upgrade role to AUTHOR |

> Include `Authorization: Bearer <token>` header for protected routes.

---

### Post Routes — `/api/posts`

| Method | Endpoint        | Access      | Description                       |
| ------ | --------------- | ----------- | --------------------------------- |
| GET    | `/`             | Public      | Get all published posts           |
| GET    | `/:id`          | Public      | Get a single post by id           |
| GET    | `/author/posts` | Author only | Get all posts by logged in author |
| POST   | `/`             | Author only | Create a new post                 |
| PUT    | `/:id`          | Author only | Update a post                     |
| PATCH  | `/:id/status`   | Author only | Update post status                |
| DELETE | `/:id`          | Author only | Delete a post                     |

#### POST `/api/posts`

```json
{
  "title": "My first post",
  "content": "Post content here",
  "status": "DRAFT"
}
```

#### PATCH `/api/posts/:id/status`

```json
{
  "status": "PUBLISHED"
}
```

Valid status values: `DRAFT`, `PUBLISHED`, `ARCHIVED`

---

### Comment Routes — `/api/posts/:postId/comments`

| Method | Endpoint | Access                     | Description             |
| ------ | -------- | -------------------------- | ----------------------- |
| POST   | `/`      | Logged in                  | Add a comment to a post |
| PATCH  | `/:id`   | Own comment only           | Edit your comment       |
| DELETE | `/:id`   | Own comment OR post author | Delete a comment        |

#### POST `/api/posts/:postId/comments`

```json
{
  "comment": "Great post!"
}
```

---

## Authentication

This API uses **JWT Bearer token** authentication.

1. Login via `POST /api/auth/login` to receive a token
2. Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_token>
```

Tokens expire after **1 hour**.

---

## Role System

| Role   | Permissions                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| USER   | Read public posts, create/edit/delete own comments                                                         |
| AUTHOR | All USER permissions + create/edit/delete own posts, delete any comment on their posts, manage post status |

Any registered user can upgrade to AUTHOR via `POST /api/users/become-author`.

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Description of the error"
}
```

| Status | Meaning                              |
| ------ | ------------------------------------ |
| 400    | Bad request / validation error       |
| 401    | Unauthorized — not logged in         |
| 403    | Forbidden — insufficient permissions |
| 404    | Resource not found                   |
| 500    | Internal server error                |
