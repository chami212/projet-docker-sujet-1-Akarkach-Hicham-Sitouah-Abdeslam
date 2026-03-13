const express = require("express");
const { Pool } = require("pg");

const PORT = parseInt(process.env.PORT || "5003", 10);
const DB_HOST = process.env.DB_HOST || "orders-db";
const DB_PORT = parseInt(process.env.DB_PORT || "5432", 10);
const DB_NAME = process.env.DB_NAME || "orders";
const DB_USER = process.env.DB_USER || "orders";
const DB_PASSWORD = process.env.DB_PASSWORD || "orders";
const PRODUCTS_URL = process.env.PRODUCTS_URL || "http://products:5002";

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
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_price NUMERIC(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function serializeOrder(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    total_price: Number(row.total_price),
    status: row.status,
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

app.get("/orders", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, user_id, product_id, quantity, total_price, status, created_at FROM orders ORDER BY id"
  );
  res.json(rows.map(serializeOrder));
});

app.get("/orders/:id", async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { rows } = await pool.query(
    "SELECT id, user_id, product_id, quantity, total_price, status, created_at FROM orders WHERE id = $1",
    [orderId]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: "order not found" });
  }
  return res.json(serializeOrder(rows[0]));
});

app.get("/orders/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { rows } = await pool.query(
    "SELECT id, user_id, product_id, quantity, total_price, status, created_at FROM orders WHERE user_id = $1 ORDER BY id",
    [userId]
  );
  res.json(rows.map(serializeOrder));
});

app.post("/orders", async (req, res) => {
  const { user_id, product_id, quantity } = req.body || {};
  if (!user_id || !product_id || !quantity) {
    return res
      .status(400)
      .json({ error: "user_id, product_id, quantity required" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ error: "quantity must be > 0" });
  }

  let product;
  try {
    const productResp = await fetch(`${PRODUCTS_URL}/products/${product_id}`);
    if (!productResp.ok) {
      return res.status(404).json({ error: "product not found" });
    }
    product = await productResp.json();
  } catch (err) {
    return res.status(502).json({ error: "products service unavailable" });
  }

  if (product.stock < quantity) {
    return res.status(409).json({ error: "insufficient stock" });
  }

  const newStock = product.stock - quantity;
  try {
    const updateResp = await fetch(`${PRODUCTS_URL}/products/${product_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });
    if (!updateResp.ok) {
      return res.status(502).json({ error: "failed to update product stock" });
    }
  } catch (err) {
    return res.status(502).json({ error: "products service unavailable" });
  }

  const totalPrice = Number((Number(product.price) * quantity).toFixed(2));

  const { rows } = await pool.query(
    `
      INSERT INTO orders (user_id, product_id, quantity, total_price, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, product_id, quantity, total_price, status, created_at
    `,
    [user_id, product_id, quantity, totalPrice, "created"]
  );

  return res.status(201).json(serializeOrder(rows[0]));
});

async function start() {
  await waitForDb();
  await initDb();
  app.listen(PORT, () => {
    console.log(`orders service listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});