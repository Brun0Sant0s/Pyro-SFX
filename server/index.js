import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { pool } from "./db.js";
import { authMiddleware, loginHandler, logoutHandler, meHandler } from "./auth.js";

dotenv.config();

const app = express();
const allowed = ["http://localhost:4173", "http://localhost:5173"];

/* ---- Middlewares globais ---- */
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

/* ---- Auth ---- */
app.post("/api/auth/login", loginHandler);
app.post("/api/auth/logout", logoutHandler);
app.get("/api/auth/me", authMiddleware, meHandler);
app.get("/api/admin/ping", authMiddleware, (_req, res) => res.json({ ok: true }));

/* ---- Healthcheck ---- */
app.get("/api/health", async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ ok: true });
  } catch (e) {
    console.error("DB ping falhou:", e.message);
    res.status(500).json({ ok: false, error: "db" });
  }
});

/* ---- SERVICES ---- */
app.get("/api/services", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, image_url AS imageUrl
         FROM services
        WHERE is_active = 1
        ORDER BY sort_order, title`
    );
    res.json(rows);
  } catch (e) {
    console.error("Erro /api/services:", e);
    res.status(500).json({ error: "Falha a obter serviços", code: e.code, msg: e.message });
  }
});

app.post("/api/services", authMiddleware, async (req, res) => {
  try {
    const { title, imageUrl } = req.body || {};
    if (!title) return res.status(400).json({ error: "title obrigatório" });
    if (!imageUrl) return res.status(400).json({ error: "imageUrl obrigatório" });

    const [r] = await pool.query(
      "INSERT INTO services (title, image_url, is_active) VALUES (:title, :img, 1)",
      { title, img: imageUrl }
    );
    res.json({ id: r.insertId, title, imageUrl });
  } catch (e) {
    console.error("POST /api/services falhou:", e);
    res.status(500).json({ error: "db", code: e.code, msg: e.message });
  }
});

app.put("/api/services/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, imageUrl } = req.body || {};
  try {
    await pool.query(
      "UPDATE services SET title=:title, image_url=:img WHERE id=:id",
      { title, img: imageUrl, id }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/services/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM services WHERE id=:id", { id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- EXTRAS ---- */
app.get("/api/extras", async (req, res) => {
  const { service_id, locale = "pt" } = req.query;
  if (!service_id) return res.status(400).json({ error: "service_id obrigatório" });
  try {
    const [rows] = await pool.query(
      `SELECT id, service_id AS serviceId, title, image_url AS imageUrl, view_id AS viewId, locale
         FROM service_extras
        WHERE service_id = :sid AND locale = :loc AND is_active = 1
        ORDER BY sort_order, title`,
      { sid: service_id, loc: locale }
    );
    res.json(rows);
  } catch (e) {
    console.error("Erro /api/extras:", e);
    res.status(500).json({ error: "Falha a obter extras" });
  }
});

app.post("/api/extras", authMiddleware, async (req, res) => {
  const { serviceId, title, imageUrl, viewId, locale = "pt" } = req.body || {};
  if (!serviceId || !title || !imageUrl || !viewId)
    return res.status(400).json({ error: "campos obrigatórios" });
  try {
    const [r] = await pool.query(
      `INSERT INTO service_extras (service_id, title, image_url, view_id, locale, is_active)
       VALUES (:sid, :title, :img, :vid, :loc, 1)`,
      { sid: serviceId, title, img: imageUrl, vid: viewId, loc: locale }
    );
    res.json({ id: r.insertId });
  } catch (e) {
    console.error("POST /api/extras:", e);
    res.status(500).json({ error: "db" });
  }
});

app.put("/api/extras/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, imageUrl, viewId, locale = "pt", isActive = 1 } = req.body || {};
  try {
    await pool.query(
      `UPDATE service_extras
          SET title=:title, image_url=:img, view_id=:vid, locale=:loc, is_active=:act
        WHERE id=:id`,
      { title, img: imageUrl, vid: viewId, loc: locale, act: isActive ? 1 : 0, id }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/extras/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM service_extras WHERE id=:id`, { id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- DETAILS ---- */
app.get("/api/details", async (req, res) => {
  const { view_id, locale = "pt" } = req.query;
  if (!view_id) return res.status(400).json({ error: "view_id obrigatório" });
  try {
    const [rows] = await pool.query(
      `SELECT description, gallery_urls AS galleryUrls, highlights
         FROM service_details
        WHERE view_id = :vid AND locale IN (:loc, 'pt')
        ORDER BY (locale = :loc) DESC
        LIMIT 1`,
      { vid: view_id, loc: locale }
    );
    if (!rows.length) return res.status(404).json({ error: "não encontrado" });

    const row = rows[0];
    row.galleryUrls = typeof row.galleryUrls === "string" ? JSON.parse(row.galleryUrls) : row.galleryUrls;
    row.highlights  = typeof row.highlights  === "string" ? JSON.parse(row.highlights)  : row.highlights;
    res.json(row);
  } catch (e) {
    console.error("Erro /api/details:", e);
    res.status(500).json({ error: "Falha a obter detalhe" });
  }
});

app.post("/api/details", authMiddleware, async (req, res) => {
  const { viewId, locale = "pt", description = "", galleryUrls = [], highlights = [] } = req.body || {};
  if (!viewId) return res.status(400).json({ error: "viewId obrigatório" });
  try {
    await pool.query(
      `INSERT INTO service_details (view_id, locale, description, gallery_urls, highlights)
       VALUES (:vid, :loc, :desc, :gal, :high)
       ON DUPLICATE KEY UPDATE description=VALUES(description),
                               gallery_urls=VALUES(gallery_urls),
                               highlights=VALUES(highlights)`,
      { vid: viewId, loc: locale, desc: description, gal: JSON.stringify(galleryUrls), high: JSON.stringify(highlights) }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/details:", e);
    res.status(500).json({ error: "db" });
  }
});

app.delete("/api/details", authMiddleware, async (req, res) => {
  const { view_id, locale } = req.query;
  if (!view_id) return res.status(400).json({ error: "view_id obrigatório" });
  try {
    if (locale) {
      await pool.query(`DELETE FROM service_details WHERE view_id=:vid AND locale=:loc`, { vid: view_id, loc: locale });
    } else {
      await pool.query(`DELETE FROM service_details WHERE view_id=:vid`, { vid: view_id });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- Start ---- */
process.on("unhandledRejection", (e) => console.error("UnhandledRejection:", e));

const port = Number(process.env.PORT || 5175);
app.listen(port, "0.0.0.0", () => {
  console.log(`API on http://localhost:${port}`);
  console.log("CORS origin:", process.env.CORS_ORIGIN ?? "(any)");
});
