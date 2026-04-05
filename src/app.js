import "dotenv/config";

import express from "express";
import cors from "cors";

import prisma from "./lib/prisma.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Works :)",
  });
});

async function testDB() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to DB successfully");

    await prisma.$disconnect();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
}

testDB();

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
});
