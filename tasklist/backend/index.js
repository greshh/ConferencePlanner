import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
});

app.get("/committees", async (req, res) => {
  const committees = await prisma.committee.findMany();
  res.json(committees);
});

app.listen(3000, () => console.log("Server running on port 3000"));
