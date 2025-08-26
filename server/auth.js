import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "./db.js";
import cookieParser from "cookie-parser";

const COOKIE_NAME = process.env.COOKIE_NAME || "SESSION";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// helper para assinar JWT
function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// middleware para rotas protegidas
export function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

// login
export async function loginHandler(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "missing" });

  const [[admin]] = await pool.query(
    `SELECT id, username, password_hash, is_active 
       FROM admins 
      WHERE username = :username 
      LIMIT 1`,
    { username }
  );

  if (!admin || !admin.is_active) return res.status(401).json({ error: "invalid" });

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid" });

  const token = sign({ sub: admin.id, username: admin.username, role: "admin" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/", // <- MUITO IMPORTANTE
  });
  res.json({ ok: true });
}

// logout
export function logoutHandler(req, res) {
  console.log("[logout] clearing cookie for", req.cookies?.[COOKIE_NAME] ? "HAS_COOKIE" : "NO_COOKIE");
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
  }).json({ ok: true });
}


// devolve info do utilizador
export function meHandler(req, res) {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  res.json({ user: req.user });
}
