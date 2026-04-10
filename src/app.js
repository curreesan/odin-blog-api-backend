import "dotenv/config";

import express from "express";
import cors from "cors";
import passport from "./middleware/passport.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);
app.use("/api/users/", userRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Odin Blog API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/signup": "Register a new user",
        "POST /api/auth/login": "Login and receive JWT",
      },
      users: {
        "POST /api/users/become-author":
          "Upgrade role to AUTHOR (auth required)",
      },
      posts: {
        "GET /api/posts": "Get all published posts",
        "GET /api/posts/:id": "Get a single post",
        "GET /api/posts/author/posts": "Get all your posts (author only)",
        "POST /api/posts": "Create a post (author only)",
        "PUT /api/posts/:id": "Update a post (author only)",
        "PATCH /api/posts/:id/status": "Update post status (author only)",
        "DELETE /api/posts/:id": "Delete a post (author only)",
      },
      comments: {
        "POST /api/posts/:postId/comments": "Add a comment (auth required)",
        "PATCH /api/posts/:postId/comments/:id":
          "Edit your comment (auth required)",
        "DELETE /api/posts/:postId/comments/:id":
          "Delete a comment (auth required)",
      },
    },
  });
});

//404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
});
