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

app.get("/task/:task_id", async (req, res) => {
  const task = await prisma.task.findUnique({
    where: {
      task_id: parseInt(req.params.task_id),
    }
  });
  res.json(task);
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
          member_id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
  res.json(assigned);
});

app.get("/committee-members/:committee_id", async (req, res) => {
  const members = await prisma.membership.findMany({
    where: {
      committee_id: parseInt(req.params.committee_id),
    },
    select: {
      member: {
        select: {
          member_id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
  res.json(members);
});

app.get("/committee-heads/:committee_id", async (req, res) => {
  const committee_heads = await prisma.committee_head.findMany({
    where: {
      committee_id: parseInt(req.params.committee_id),
    },
    select: {
      committee_head_id: true,
      first_name: true,
      last_name: true,
    },
  });
  res.json(committee_heads);
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
          committee_id: true,
          committee_name: true,
        },
      },
    },
  });
  res.json(assigned_committees);
});

app.patch("/update-task/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completed, task_name, due_date, description, assigned_members } = req.body;

  if (typeof id !== "number" || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const updated = await prisma.task.update({
      where: { task_id: id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(task_name !== undefined && { task_name }),
        ...(due_date !== undefined && { due_date: new Date(due_date) }),
        ...(description !== undefined && { description }),
        ...(assigned_members !== undefined && { assigned_members }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.delete("/delete-task/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.assignment.deleteMany({
      where: { task_id: id },
    });
    await prisma.task_committee.deleteMany({
      where: { task_id: id },
    });
    await prisma.workflow_task.deleteMany({
      where: { task_id: id },
    });
    const deleted = await prisma.task.delete({
      where: { task_id: id },
    });
    res.json(deleted);
  } catch (err) {
    console.error("Failed to delete task:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/update-assignment", async (req, res) => {
  const { task_id, member_id } = req.body;
  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        task_id,
        member_id,
      },
    });
    if (assignment != null) {
      await prisma.assignment.delete({
        where: {
          assignment_id: assignment.assignment_id,
        },
      });
    } else {
      await prisma.assignment.create({
        data: {
          task_id,  
          member_id,
        },
      });
    }
    res.json(assignment);
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});


app.listen(3000, () => console.log("Server running on port 3000"));
