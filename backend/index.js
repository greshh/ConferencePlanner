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

app.get("/member/:member_id", async (req, res) => {
  const member = await prisma.member.findUnique({
    where: {
      member_id: parseInt(req.params.member_id),
    },
  });
  res.json(member);
});

app.get("/notes/:task_id/:member_id", async (req, res) => {
  const assignment = await prisma.assignment.findMany({
    where: {
      member_id: parseInt(req.params.member_id),
      task_id: parseInt(req.params.task_id),
    },
    select: {
      assignment_id: true,
      personal_notes: true,
    }
  });
  res.json(assignment);
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
          colour: true,
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

app.patch("/update-notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { personal_notes } = req.body;

  if (typeof id !== "number" || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const updated = await prisma.assignment.update({
      where: { assignment_id: id },
      data: {
        ...(personal_notes !== undefined && { personal_notes }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Failed to update notes:", err);
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

app.patch("/update-member-assignment", async (req, res) => {
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

app.patch("/update-committee-assignment", async (req, res) => {
  const { task_id, committee_id } = req.body;
  try {
    const assignment = await prisma.task_committee.findFirst({
      where: {
        task_id,
        committee_id,
      },
    });
    if (assignment != null) {
      await prisma.task_committee.delete({
        where: {
          task_committee_id: assignment.task_committee_id,
        },
      });
    } else {
      await prisma.task_committee.create({
        data: {
          task_id,
          committee_id,
        },
      });
    }
    res.json(assignment);
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post("/create-task", async (req, res) => {
  const { task_name, due_date, description } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        task_name,
        due_date: new Date(due_date),
        description,
        completed: false,
      },
    });
    res.json(newTask);
  } catch (err) {
    console.error("Failed to create task:", err);
    res.status(500).json({ error: err.message || String(err) });
  } 
});


app.listen(3000, () => console.log("Server running on port 3000"));
