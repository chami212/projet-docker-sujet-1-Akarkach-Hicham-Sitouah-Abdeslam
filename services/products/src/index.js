const express = require("express");
const { Pool } = require("pg");

const PORT = parseInt(process.env.PORT || "5002", 10);
const DB_HOST = process.env.DB_HOST || "products-db";
const DB_PORT = parseInt(process.env.DB_PORT || "5432", 10);
const DB_NAME = process.env.DB_NAME || "products";
const DB_USER = process.env.DB_USER || "products";
const DB_PASSWORD = process.env.DB_PASSWORD || "products";

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
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      stock INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function serializeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    stock: row.stock,
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

app.get("/products", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, price, stock, created_at FROM products ORDER BY id"
  );
  res.json(rows.map(serializeProduct));
});

app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { rows } = await pool.query(
    "SELECT id, name, price, stock, created_at FROM products WHERE id = $1",
    [productId]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: "product not found" });
  }
  return res.json(serializeProduct(rows[0]));
});

app.post("/products", async (req, res) => {
  const { name, price, stock } = req.body || {};
  if (name === undefined || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "name, price, stock required" });
  }
  const { rows } = await pool.query(
    `
      INSERT INTO products (name, price, stock)
      VALUES ($1, $2, $3)
      RETURNING id, name, price, stock, created_at
    `,
    [name, price, stock]
  );
  return res.status(201).json(serializeProduct(rows[0]));
});

app.put("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { name, price, stock } = req.body || {};
  if (name === undefined && price === undefined && stock === undefined) {
    return res.status(400).json({ error: "no fields to update" });
  }
  const { rows: existingRows } = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [productId]
  );
  const existing = existingRows[0];
  if (!existing) {
    return res.status(404).json({ error: "product not found" });
  }
  const newName = name !== undefined ? name : existing.name;
  const newPrice = price !== undefined ? price : existing.price;
  const newStock = stock !== undefined ? stock : existing.stock;

  const { rows } = await pool.query(
    `
      UPDATE products
      SET name = $1, price = $2, stock = $3
      WHERE id = $4
      RETURNING id, name, price, stock, created_at
    `,
    [newName, newPrice, newStock, productId]
  );
  return res.json(serializeProduct(rows[0]));
});

app.delete("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const result = await pool.query("DELETE FROM products WHERE id = $1", [productId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "product not found" });
  }
  return res.json({ status: "deleted" });
});

async function start() {
  await waitForDb();
  await initDb();
  app.listen(PORT, () => {
    console.log(`products service listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});