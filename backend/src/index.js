import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean) || "*",
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "merchstore-api" }));

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
