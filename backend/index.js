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

app.get("/assigned/:task_id", async (req, res) => {
  const assigned = await prisma.assignment.findMany({
    where: {
      task_id: parseInt(req.params.task_id),
    },
    select: {
      assignment_id: true,
      member: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  });
  res.json(assigned);
});

app.listen(3000, () => console.log("Server running on port 3000"));
