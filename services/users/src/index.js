const express = require("express");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const PORT = parseInt(process.env.PORT || "5001", 10);
const DB_HOST = process.env.DB_HOST || "users-db";
const DB_PORT = parseInt(process.env.DB_PORT || "5432", 10);
const DB_NAME = process.env.DB_NAME || "users";
const DB_USER = process.env.DB_USER || "users";
const DB_PASSWORD = process.env.DB_PASSWORD || "users";

const app = express();
app.use(express.json());

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

async function waitForDb() {
  for (let i = 0; i < 15; i += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("database not ready");
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function serializeUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    created_at: row.created_at.toISOString(),
  };
}

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error" });
  }
});

app.get("/users", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, username, email, created_at FROM users ORDER BY id"
  );
  res.json(rows.map(serializeUser));
});

app.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { rows } = await pool.query(
    "SELECT id, username, email, created_at FROM users WHERE id = $1",
    [userId]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.json(serializeUser(rows[0]));
});

app.post("/users", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, password required" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
      `,
      [username, email, passwordHash]
    );
    return res.status(201).json(serializeUser(rows[0]));
  } catch (err) {
    return res.status(409).json({ error: "username or email already exists" });
  }
});

app.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, email, password } = req.body || {};
  if (!username && !email && !password) {
    return res.status(400).json({ error: "no fields to update" });
  }
  const { rows: existingRows } = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );
  const existing = existingRows[0];
  if (!existing) {
    return res.status(404).json({ error: "user not found" });
  }
  const newUsername = username || existing.username;
  const newEmail = email || existing.email;
  const newPasswordHash = password
    ? await bcrypt.hash(password, 10)
    : existing.password_hash;

  try {
    const { rows } = await pool.query(
      `
        UPDATE users
        SET username = $1, email = $2, password_hash = $3
        WHERE id = $4
        RETURNING id, username, email, created_at
      `,
      [newUsername, newEmail, newPasswordHash, userId]
    );
    return res.json(serializeUser(rows[0]));
  } catch (err) {
    return res.status(409).json({ error: "username or email already exists" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.json({ status: "deleted" });
});

app.post("/users/login", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!password || (!username && !email)) {
    return res
      .status(400)
      .json({ error: "username or email and password required" });
  }

  const query = username
    ? "SELECT * FROM users WHERE username = $1"
    : "SELECT * FROM users WHERE email = $1";
  const value = username || email;
  const { rows } = await pool.query(query, [value]);
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  return res.json({ status: "ok", user: serializeUser(user) });
});

async function start() {
  await waitForDb();
  await initDb();
  app.listen(PORT, () => {
    console.log(`users service listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});