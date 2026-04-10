import "dotenv/config";

import express from "express";
import cors from "cors";
import passport from "./middleware/passport.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API Works :)",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
});
