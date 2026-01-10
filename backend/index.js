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

// --------------------------------------------------------------
//      DATABASE CONNECTION SET UP WITH CLOUD SQL CONNECTOR
// --------------------------------------------------------------

var pool;

/* 
  In case the PRIVATE_IP environment variable is defined then we set
  the ipType=PRIVATE for the new connector instance, otherwise defaults
  to public ip type.
*/
const getIpType = () => {
  return process.env.PRIVATE_IP === '1' || process.env.PRIVATE_IP === 'true'
    ? 'PRIVATE'
    : 'PUBLIC';
};

// Initializes a connection pool for a Cloud SQL instance of MySQL using the Cloud SQL Node.js Connector.
const connectWithConnector = async config => {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: getIpType(),
  });
  const dbConfig = {
    ...clientOpts,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD, 
    database: process.env.DATABASE_NAME,
    ...config, 
  };
  // Establish a connection to the database.
  pool = mysql.createPool(dbConfig);
  return pool;
};

const readDatabase = async (query) => {
  const connection = await pool.getConnection();
  console.log("Successfully connected to the database");
  try {
    const [rows] = await connection.execute(query);
    console.log("Query successful. Found: ", rows.length);
    return rows;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
};

const updateDatabase = async (query) => {
  const connection = await pool.getConnection();
  console.log("Successfully connected to the database");
  try {
    const [result] = await connection.execute(query);
    console.log("Query successful. Affected rows: ", result.affectedRows);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
};

const addToDatabase = async (query, attributes) => {
  const connection = await pool.getConnection();
  console.log("Successfully connected to the database");
  try {
    const [result] = await connection.execute(query, attributes);
    console.log("Query successful. Affected rows: ", result.affectedRows);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
};

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
  const bucket = storage.bucket("conference-planner")
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
      contentType: file.mimetype
    });
  
    stream.on("error", (err) => {
      res.status(500).json({ error: "Upload failed: " + err.message });
    });

    stream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/attachments/${task_id}/${safe_name}`;
      res.json({
        file_name: file.originalname,
        file_url: publicUrl,
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
  const tasks = await readDatabase("SELECT * FROM task");
  res.json(tasks);
});

app.get("/api/committees", async (req, res) => {
  const committees = await readDatabase("SELECT * FROM committee");
  res.json(committees);
});

app.get("/api/tasks/get/:task_id", async (req, res) => {
  const task = await readDatabase(`SELECT * FROM task WHERE task_id = ${parseInt(req.params.task_id)}`);
  res.json(task);
});

app.get("/api/members/:member_id", async (req, res) => {
  const member = await readDatabase(`SELECT * FROM member WHERE member_id = ${parseInt(req.params.member_id)}`);
  res.json(member[0]);
});

app.get("/api/assignments/:task_id", async (req, res) => {
  const assigned = await readDatabase(
    `SELECT a.assignment_id, m.member_id, m.first_name, m.last_name 
    FROM assignment a
    JOIN member m ON a.member_id = m.member_id
    WHERE a.task_id = ${parseInt(req.params.task_id)}`
  );
  res.json(assigned);
});

app.get("/api/memberships/:committee_id", async (req, res) => {
  const members = await readDatabase(
    `SELECT m.member_id, m.first_name, m.last_name 
    FROM membership ms
    JOIN member m ON ms.member_id = m.member_id
    WHERE ms.committee_id = ${parseInt(req.params.committee_id)}`
  );
  res.json(members);
});

app.get("/api/task_committees/:task_id", async (req, res) => {
  const assigned_committees = await readDatabase(
    `SELECT tc.task_committee_id, c.committee_id, c.committee_name, c.colour 
    FROM task_committee tc
    JOIN committee c ON tc.committee_id = c.committee_id
    WHERE tc.task_id = ${parseInt(req.params.task_id)}`
  );
  res.json(assigned_committees);
});

app.get("/api/assignments/notes/get/:task_id&:member_id", async (req, res) => {
  const assignment = await readDatabase(
    `SELECT assignment_id, personal_notes FROM assignment 
    WHERE member_id = ${parseInt(req.params.member_id)} 
    AND task_id = ${parseInt(req.params.task_id)}`);
  res.json(assignment);
});

// ----------------------- PATCH REQUESTS -----------------------

app.patch("/api/tasks/patch/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completed, task_name, due_date, description, assigned_members, attachments } = req.body;

  if (typeof id !== "number" || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const query = `UPDATE task SET 
      ${completed !== undefined ? `completed = ${completed},` : ""}
      ${task_name !== undefined ? `task_name = ${task_name},` : ""}
      ${due_date !== undefined ? `due_date = ${new Date(due_date)},` : ""}
      ${description !== undefined ? `description = ${description},` : ""}
      ${assigned_members !== undefined ? `assigned_members = ${assigned_members},` : ""}
      ${attachments !== undefined ? `attachments = ${attachments}` : ""}
      WHERE task_id = ${parseInt(id)}`;
    const updated = await updateDatabase(query);
    res.json(updated);
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/assignments/notes/patch/:assignment_id", async (req, res) => {
  const assignment_id = Number(req.params.id);
  const { personal_notes } = req.body;

  if (typeof assignment_id !== "number" || Number.isNaN(assignment_id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const query = `UPDATE assignment SET 
      personal_notes = ${personal_notes}
      WHERE assignment_id = ${parseInt(assignment_id)}`;
    const updated = await updateDatabase(query);
    res.json(updated);
  } catch (err) {
    console.error("Failed to update notes:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/assignments/patch", async (req, res) => {
  const { task_id, member_id } = req.body;
  try {
    const assignmentRows = await readDatabase(
      `SELECT assignment_id FROM assignment 
      WHERE task_id = ${parseInt(task_id)} 
      AND member_id = ${parseInt(member_id)}`
    );
    const assignment = assignmentRows.length > 0 ? assignmentRows[0] : null;

    // If the member is already assigned, remove the assignment.
    // Otherwise, add the member.
    var response = "";
    if (assignment != null) {
      response = await updateDatabase(`DELETE FROM assignment WHERE assignment_id = ${assignment.assignment_id}`);
    } else {
      response = await updateDatabase(`INSERT INTO assignment (task_id, member_id) VALUES (${parseInt(task_id)}, ${parseInt(member_id)})`);
    }

    res.json(response);
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.patch("/api/task_committee/patch", async (req, res) => {
    const { task_id, committee_id } = req.body;
    try {
      const assignmentRows = await readDatabase(
        `SELECT task_committee_id FROM task_committee 
        WHERE task_id = ${parseInt(task_id)} 
        AND committee_id = ${parseInt(committee_id)}`
      );
      const assignment = assignmentRows.length > 0 ? assignmentRows[0] : null;

      // If the committee is already assigned, remove the assignment.
      // Otherwise, add the committee.
      var response = "";
      if (assignment != null) {
        response = await updateDatabase(`DELETE FROM task_committee WHERE task_committee_id = ${assignment.task_committee_id}`);
      } else {
        response = await updateDatabase(`INSERT INTO task_committee (task_id, committee_id) VALUES (${parseInt(task_id)}, ${parseInt(committee_id)})`);
      }

      res.json(response);
    } catch (err) {
      console.error("Failed to update assignment:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

// ----------------------- DELETE REQUESTS -----------------------

app.delete("/api/tasks/delete/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    updateDatabase(`DELETE FROM assignment WHERE task_id = ${id}`);
    updateDatabase(`DELETE FROM task_committee WHERE task_id = ${id}`);
    updateDatabase(`DELETE FROM workflow_task WHERE task_id = ${id}`);
    const deleted = await updateDatabase(`DELETE FROM task WHERE task_id = ${id}`);
    res.json(deleted);
  } catch (err) {
    console.error("Failed to delete task:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ------------------------ POST REQUESTS ------------------------

app.post("/api/tasks/post", async (req, res) => {
  const { task_name, due_date, description } = req.body;
  try {
    const newTask = await addToDatabase(
      `INSERT INTO task (task_name, due_date, description, completed) 
      VALUES (${task_name}, ${new Date(due_date)}, ${description}, false)`, [task_name, new Date(due_date), description]
    );
    res.json(newTask);
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

const PORT = process.env.PORT || 3000;
await connectWithConnector({});

app.listen(PORT, async () => {
  console.log("Server running on port", PORT);
});
