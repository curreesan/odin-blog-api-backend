import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API Works :)",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
});
