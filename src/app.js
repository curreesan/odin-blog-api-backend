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
    message: "API Works :)",
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
