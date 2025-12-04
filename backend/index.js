import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/profile-pics", express.static("profile-pics"));

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
          profile_pic: true,
        },
      },
    },
  });
  res.json(assigned);
});

app.get("/assigned-committees/:task_id", async (req, res) => {
  const assigned_committees = await prisma.task_committee.findMany({
    where: {
      task_id: parseInt(req.params.task_id),
    },
    select: {
      task_committee_id: true,
      committee: {
        select: {
          committee_name: true,
        },
      },
    },
  });
  res.json(assigned_committees);
});

app.patch("/update-task/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;

  if (typeof id !== "number" || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid 'completed' boolean" });
  }

  try {
    const updated = await prisma.task.update({
      where: { task_id: id },
      data: { completed },
    });
    res.json(updated);
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
