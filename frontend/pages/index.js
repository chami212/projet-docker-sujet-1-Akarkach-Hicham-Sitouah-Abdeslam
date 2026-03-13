import { useEffect, useState } from "react";

const apiBase = "/api";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32, padding: 16, border: "1px solid #ddd" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
  });
  const [orderForm, setOrderForm] = useState({
    user_id: "",
    product_id: "",
    quantity: "",
  });

  const loadAll = async () => {
    try {
      const [u, p, o] = await Promise.all([
        fetch(`${apiBase}/users`).then((r) => r.json()),
        fetch(`${apiBase}/products`).then((r) => r.json()),
        fetch(`${apiBase}/orders`).then((r) => r.json()),
      ]);
      setUsers(u);
      setProducts(p);
      setOrders(o);
      setError("");
    } catch (err) {
      setError("failed to load data");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    if (!res.ok) {
      setError("failed to create user");
      return;
    }
    setUserForm({ username: "", email: "", password: "" });
    loadAll();
  };

  const createProduct = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productForm.name,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      }),
    });
    if (!res.ok) {
      setError("failed to create product");
      return;
    }
    setProductForm({ name: "", price: "", stock: "" });
    loadAll();
  };

  const createOrder = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(orderForm.user_id),
        product_id: Number(orderForm.product_id),
        quantity: Number(orderForm.quantity),
      }),
    });
    if (!res.ok) {
      setError("failed to create order");
      return;
    }
    setOrderForm({ user_id: "", product_id: "", quantity: "" });
    loadAll();
  };

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Mini E-commerce</h1>
      <p>Gateway base: {apiBase}</p>
      {error && (
        <div style={{ marginBottom: 16, color: "#b00020" }}>
          {error}
        </div>
      )}

      <Section title="Users">
        <form onSubmit={createUser} style={{ marginBottom: 16 }}>
          <input
            placeholder="username"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
          />{" "}
          <input
            placeholder="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />{" "}
          <input
            placeholder="password"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />{" "}
          <button type="submit">Create user</button>
        </form>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.id} - {u.username} ({u.email})
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Products">
        <form onSubmit={createProduct} style={{ marginBottom: 16 }}>
          <input
            placeholder="name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />{" "}
          <input
            placeholder="price"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          />{" "}
          <input
            placeholder="stock"
            value={productForm.stock}
            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
          />{" "}
          <button type="submit">Create product</button>
        </form>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.id} - {p.name} | {p.price} | stock {p.stock}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Orders">
        <form onSubmit={createOrder} style={{ marginBottom: 16 }}>
          <input
            placeholder="user_id"
            value={orderForm.user_id}
            onChange={(e) => setOrderForm({ ...orderForm, user_id: e.target.value })}
          />{" "}
          <input
            placeholder="product_id"
            value={orderForm.product_id}
            onChange={(e) => setOrderForm({ ...orderForm, product_id: e.target.value })}
          />{" "}
          <input
            placeholder="quantity"
            value={orderForm.quantity}
            onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
          />{" "}
          <button type="submit">Create order</button>
        </form>
        <ul>
          {orders.map((o) => (
            <li key={o.id}>
              order {o.id} - user {o.user_id} - product {o.product_id} - qty {o.quantity} - total {o.total_price}
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}