import express from "express";
import cors from "cors";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import mysql from "mysql2/promise";
import { Connector } from "@google-cloud/cloud-sql-connector";
import "dotenv/config";
import fetch from "node-fetch";
import admin from "firebase-admin";
import "./env.js";
import { getPrisma } from "./db/prisma.js"

const { auth } = admin;

const mimeAllowList = JSON.parse(
  fs.readFileSync(
    new URL("./config/mime-allowlist.json", import.meta.url),
    "utf-8"
  )
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const storage = new Storage();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 mb
  },
});

const prisma = await getPrisma();

// --------------------------------------------------------------
//                  FIREBASE CONNECTION SET UP
// --------------------------------------------------------------

const credentials = JSON.parse(
  fs.readFileSync('./firebase-credentials.json')
);

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// --------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use("/profile-pics", express.static("profile-pics"));
app.use("/assets", express.static(path.join(__dirname, "dist/assets")));
app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get(/^(?!\/api).*/, (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.patch("/api/upload-file", upload.single("file"), async (req, res) => {
  const bucket = storage.bucket("conference-planner");
  const { task_id, file_name } = req.body;
  const file = req.file;

  try {
    if (!mimeAllowList[file.mimetype]) {
      throw new Error("Unsupported file type");
    }

    const extension = mimeAllowList[file.mimetype];
    const base_name = file_name.replace(/\.[^/.]+$/, "");
    const safe_name = base_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + extension;

    const uploadFile = bucket.file(`attachments/${task_id}/${safe_name}`);

    const stream = uploadFile.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    stream.on("error", (err) => {
      res.status(500).json({ error: "Upload failed: " + err.message });
    });

    stream.on("finish", () => {
      res.json({
        file_name: file_name,
        file_url: `https://storage.googleapis.com/conference-planner/attachments/${task_id}/${safe_name}`,
      });
    });

    stream.end(file.buffer);
  } catch (err) {
    console.log(err);
  }
})

// --------------------------------------------------------------
//                         API ENDPOINTS
// --------------------------------------------------------------

// ------------------------ GET REQUESTS ------------------------

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
  // const tasks = await readDatabase("SELECT * FROM task");
});

app.get("/api/tasks/:member_id", async (req, res) => {
  const member_id = parseInt(req.params.member_id);
  // const tasks = await readDatabase(
  //   `SELECT t.* FROM task t JOIN assignment a ON t.task_id = a.task_id WHERE a.member_id = ${member_id}`
  // );
  // res.json(tasks);

  try {
    const tasks = await prisma.assignment.findMany({
      where: {
        member_id: member_id,
      },
      select: {
        task: true,
      },
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/committees", async (req, res) => {
  // const committees = await readDatabase("SELECT * FROM committee");
  // res.json(committees);

  try {
    const committees = await prisma.committee.findMany();
    res.json(committees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/tasks/get/:task_id", async (req, res) => {
  const task_id = parseInt(req.params.task_id);
  // const task = await readDatabase(`SELECT * FROM task WHERE task_id = ${parseInt(req.params.task_id)}`);
  // res.json(task);

  try {
    const task = await prisma.task.findUnique({
      where: {
        task_id: task_id,
      },
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/members/:member_id", async (req, res) => {
  // const member = await readDatabase(`SELECT * FROM member WHERE member_id = ${parseInt(req.params.member_id)}`);
  // res.json(member[0]);

  const member_id = parseInt(req.params.member_id);

  try {
    const member = await prisma.member.findUnique({
      where: {
        member_id: member_id,
      },
    });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/assignments/:task_id", async (req, res) => {
  // const assigned = await readDatabase(
  //   `SELECT a.assignment_id, m.member_id, m.first_name, m.last_name 
  //   FROM assignment a
  //   JOIN member m ON a.member_id = m.member_id
  //   WHERE a.task_id = ${parseInt(req.params.task_id)}`
  // );
  // res.json(assigned);

  const task_id = parseInt(req.params.task_id);

  try {
    const assigned = await prisma.assignment.findMany({
      where: {
        task_id: task_id,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/memberships/:committee_id", async (req, res) => {
  // const members = await readDatabase(
  //   `SELECT m.member_id, m.first_name, m.last_name 
  //   FROM membership ms
  //   JOIN member m ON ms.member_id = m.member_id
  //   WHERE ms.committee_id = ${parseInt(req.params.committee_id)}`
  // );
  // res.json(members);

  const committee_id = parseInt(req.params.committee_id);

  try {
    const members = await prisma.membership.findMany({
      where: {
        committee_id: committee_id,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/task_committees/:task_id", async (req, res) => {
  // const assigned_committees = await readDatabase(
  //   `SELECT tc.task_committee_id, c.committee_id, c.committee_name, c.colour 
  //   FROM task_committee tc
  //   JOIN committee c ON tc.committee_id = c.committee_id
  //   WHERE tc.task_id = ${parseInt(req.params.task_id)}`
  // );
  // res.json(assigned_committees);

  const task_id = parseInt(req.params.task_id);

  try {
    const assigned_committees = await prisma.task_committee.findMany({
      where: {
        task_id: task_id,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/api/assignments/notes/get/:task_id&:member_id", async (req, res) => {
  // const assignment = await readDatabase(
  //   `SELECT assignment_id, personal_notes FROM assignment 
  //   WHERE member_id = ${parseInt(req.params.member_id)} 
  //   AND task_id = ${parseInt(req.params.task_id)}`);
  // res.json(assignment);

  const task_id = parseInt(req.params.task_id);
  const member_id = parseInt(req.params.member_id);

  try {
    const assignment = await prisma.assignment.findMany({
      where: {
        task_id: task_id,
        member_id: member_id,
      },
      select: {
        assignment_id: true,
        personal_notes: true,
      },
    });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ----------------------- PATCH REQUESTS -----------------------

app.patch("/api/tasks/patch/:id", async (req, res) => {
  const task_id = parseInt(req.params.id);
  const { completed, task_name, due_date, description, assigned_members, attachments } = req.body;

  // try {
  //   console.log(`UPDATE task SET completed = ${completed == "true" ? 1 : 0} WHERE task_id = ${id}`);
  //   if (completed != null) await updateDatabase(`UPDATE task SET completed = ${completed == true ? 1 : 0} WHERE task_id = ${id}`, null);
  //   if (task_name) await updateDatabase(`UPDATE task SET task_name = ? WHERE task_id = ?`, [task_name, id]);
  //   if (due_date) await updateDatabase(`UPDATE task SET due_date = '${due_date}' WHERE task_id = ${id}`, null);
  //   if (description) await updateDatabase(`UPDATE task SET description = ? WHERE task_id = ?`, [description, id]);
  //   if (assigned_members) await updateDatabase(`UPDATE task SET assigned_members = ${assigned_members} WHERE task_id = ${id}`, null);
  //   if (attachments) await updateDatabase(`UPDATE task SET attachments = '${JSON.stringify(attachments)}' WHERE task_id = ${id}`, null);
  //   res.sendStatus(200);
  // } catch (err) {
  //   console.error("Failed to update task:", err);
  //   res.status(500).json({ error: err.message || String(err) });
  // }

  try {
    // Completed
    if (completed != null) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          completed: completed,
        },
      });
    }
    // Task Name
    if (task_name) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          task_name: task_name,
        },
      });
    }
    // Due Date
    if (due_date) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          due_date: due_date,
        },
      });
    }
    // Description
    if (description) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          description: description,
        },
      });
    }
    // Assigned members
    if (assigned_members) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          assigned_members: assigned_members,
        },
      });
    }
    // Attachments
    if (attachments) {
      await prisma.task.update({
        where: {
          task_id: task_id,
        },
        data: {
          attachments: attachments,
        },
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/assignments/notes/patch/:assignment_id", async (req, res) => {
  const assignment_id = parseInt(req.params.assignment_id);
  const { personal_notes } = req.body;

  // try {
  //   const query = `UPDATE assignment SET personal_notes = ? WHERE assignment_id = ${parseInt(assignment_id)}`;
  //   const updated = await updateDatabase(query, [personal_notes]);
  //   res.json(updated);
  // } catch (err) {
  //   console.error("Failed to update notes:", err);
  //   res.status(500).json({ error: err.message || String(err) });
  // }

  try {
    const updated = await prisma.assignment.update({
      where: {
        assignment_id: assignment_id,
      },
      data: {
        personal_notes: personal_notes,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/assignments/patch", async (req, res) => {
  const { task_id, member_id } = req.body;

  try {
    var assignment = null;
    if (task_id != null) {
      // const assignmentRows = await readDatabase(
      //   `SELECT assignment_id FROM assignment WHERE task_id = ${parseInt(task_id)} AND member_id = ${parseInt(member_id)}`
      // );
      // assignment = assignmentRows.length > 0 ? assignmentRows[0] : null;
      const assignment_rows = await prisma.assignment.findMany({
        where: {
          task_id: parseInt(task_id),
          member_id: parseInt(member_id),
        },
        select: {
          assignment_id: true,
        },
      });
      assignment = assignment_rows.length > 0 ? assignment_rows[0] : null;
    }

    // If the member is already assigned, remove the assignment.
    // Otherwise, add the member.
    var response = "";
    if (assignment != null) {
      // response = await updateDatabase(`DELETE FROM assignment WHERE assignment_id = ${assignment.assignment_id}`, null);
      response = await prisma.assignment.delete({
        where: {
          assignment_id: assignment.assignment_id,
        },
      })
    } else {
      // response = await updateDatabase(`INSERT INTO assignment (task_id, member_id) VALUES (${parseInt(task_id)}, ${parseInt(member_id)})`, null);
      response = await prisma.assignment.create({
        data: {
          task_id: parseInt(task_id),
          member_id: parseInt(member_id),
        },
      });
    }
    res.json(response);
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/task_committees/patch", async (req, res) => {
    const { task_id, committee_id } = req.body;
    try {
      // const assignmentRows = await readDatabase(
      //   `SELECT task_committee_id FROM task_committee 
      //   WHERE task_id = ${parseInt(task_id)} 
      //   AND committee_id = ${parseInt(committee_id)}`
      // );
      const assignment_rows = await prisma.task_committee.findMany({
        where: {
          task_id: parseInt(task_id),
          committee_id: parseInt(committee_id),
        },
        select: {
          task_committee_id: true,
        },
      });
      const assignment = assignment_rows.length > 0 ? assignment_rows[0] : null;

      // If the committee is already assigned, remove the assignment.
      // Otherwise, add the committee.
      var response = "";
      if (assignment != null) {
        // response = await updateDatabase(`DELETE FROM task_committee WHERE task_committee_id = ${assignment.task_committee_id}`, null);
        response = await prisma.task_committee.delete({
          where: {
            task_committee_id: assignment.task_committee_id,
          },
        });
      } else {
        // response = await updateDatabase(`INSERT INTO task_committee (task_id, committee_id) VALUES (${parseInt(task_id)}, ${parseInt(committee_id)})`, null);
        response = await prisma.task_committee.create({
          data: {
            task_id: parseInt(task_id),
            committee_id: parseInt(committee_id),
          },
        });
      }

      res.json(response);
    } catch (err) {
      console.error("Failed to update assignment:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

// ----------------------- DELETE REQUESTS -----------------------

app.delete("/api/tasks/delete/:id", async (req, res) => {
  const task_id = parseInt(req.params.id);
  try {
    // updateDatabase(`DELETE FROM assignment WHERE task_id = ${id}`, null);
    // updateDatabase(`DELETE FROM task_committee WHERE task_id = ${id}`, null);
    // updateDatabase(`DELETE FROM workflow_task WHERE task_id = ${id}`, null);
    // const deleted = await updateDatabase(`DELETE FROM task WHERE task_id = ${id}`, null);

    const deleteAssignment = prisma.assignment.deleteMany({
      where: {
        task_id: task_id,
      },
    });
    const deleteTaskCommittee = prisma.task_committee.deleteMany({
      where: {
        task_id: task_id,
      },
    });
    const deleteWorkflowTask = prisma.workflow_task.deleteMany({
      where: {
        task_id: task_id,
      },
    });
    const deleteTask = prisma.task.delete({
      where: {
        task_id: task_id,
      },
    });

    const transaction = await prisma.$transaction([deleteAssignment, deleteTaskCommittee, deleteWorkflowTask, deleteTask]);

    res.json(transaction);
  } catch (err) {
    console.error("Failed to delete task:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.delete("/api/tasks/attachments/delete/:task_id&:attachment_index", async (req, res) => {
  const task_id = parseInt(req.params.task_id);
  const attachment_index = parseInt(req.params.attachment_index);
  try {
    // const attachmentRows = await readDatabase(`SELECT attachments from task WHERE task_id = ${task_id}`, null);

    const attachment_rows = await prisma.task.findUnique({
      where: {
        task_id: task_id,
      },
      select: {
        attachments: true,
      },
    });

    const attachments = attachment_rows.attachments;
    const selectedAttachment = attachments[attachment_index];

    // Removing the attachment from the attachments array.
    const newAttachments = [];
    attachments.forEach(element => {
      if (element !== selectedAttachment) {
        newAttachments.push(element);
      }
    });
    
    // const deleted = await updateDatabase(`UPDATE task SET attachments = ? WHERE task_id = ${task_id}`, [JSON.stringify(newAttachments)]);

    const attachment = await prisma.task.update({
      where: {
        task_id: task_id,
      },
      data: {
        attachments: newAttachments,
      },
    });
    res.json(attachment);
  } catch (err) {
    console.error("Failed to delete attachment:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ------------------------ POST REQUESTS ------------------------

app.post("/api/tasks/post", async (req, res) => {
  const { task_name, due_date, description } = req.body;
  try {
    // const newTask = await addToDatabase(
    //   `INSERT INTO task (task_name, due_date, description, completed) 
    //   VALUES (?, ?, ?, ?)`, [task_name, new Date(due_date), description, false]
    // );

    const new_task = await prisma.task.create({
      data: {
        task_name: task_name,
        due_date: new Date(due_date),
        description: description,
        completed: false,
      },
    });
    
    res.json(new_task);
  } catch (err) {
    console.error("Failed to create task:", err);
    res.status(500).json({ error: err.message || String(err) });
  } 
});

app.post("/api/url", async (req, res) => {
  try {
    const { url } = req.body;
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const response = await fetch(fullUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    if (!response.url) return res.status(500).json({ error: "Incorrect URL" });
    const resolvedUrl = response.url;
    res.json({ resolvedUrl: resolvedUrl });
  } catch (err) {
    console.error(err);
    if (err instanceof TypeError) return res.status(400).json({ error: "Invalid or unreachable URL" });
    res.status(500).json({ error: "Unable to resolve URL" });
  }
});

app.post("/api/members/assigned", async (req, res) => {
  try {
    const { committee_id, task_id } = req.body;

    // const members = await readDatabase(
    //   `SELECT * FROM member m JOIN membership me ON me.member_id = m.member_id JOIN committee c ON c.committee_id = me.committee_id JOIN assignment a ON a.member_id = m.member_id JOIN conference.task t ON t.task_id = a.task_id WHERE c.committee_id = ${parseInt(committee_id)} AND t.task_id = ${parseInt(task_id)}`);

    // const members = await prisma.task_committee.findMany({
    //   where: {
    //     committee_id: parseInt(committee_id),
    //     task_id: parseInt(task_id),
    //   },
    // })

    const members = await prisma.member.findMany({
      where: {
        // assignment: {
        //   some: {
        //     task_id: parseInt(task_id),
        //     task: {
        //       assignment: {
        //         some: {
        //           member: {
        //             membership: {
        //               some: {
        //                 committee_id: parseInt(committee_id),
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
        membership: {
          some: {
            committee_id: parseInt(committee_id),
          },
        },
        assignment: {
          some: {
            task_id: parseInt(task_id),
          }
        }
      },
    });    

    res.json(members);
  } catch (err) {
    console.error("Failed to fetch assigned members:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post("/api/members/login", async (req, res) => {
  try {
    const { uid } = req.body;
    // const member = await readDatabase(`SELECT member_id FROM member WHERE firebase_uid = ?`, [uid]);

    const member = await prisma.member.findMany({
      where: {
        firebase_uid: uid,
      },
      select: {
        member_id: true,
      },
    });

    if (member.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    const memberId = member[0].member_id;
    res.json({ memberId: memberId });
  } catch (err) {
    console.error("Failed to log in member:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log("Server running on port", PORT);
});
