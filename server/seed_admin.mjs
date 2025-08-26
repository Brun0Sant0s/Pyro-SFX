import dotenv from "dotenv";
// carrega SEMPRE o .env do root do projeto
dotenv.config({ path: new URL("../.env", import.meta.url) });

import bcrypt from "bcrypt";
import { pool } from "./db.js";

const username = process.argv[2];
const pass     = process.argv[3];

if (!username || !pass) {
  console.error("Uso: node server/seed_admin.mjs <username> <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(pass, 12);

await pool.execute(
  `INSERT INTO admins (username, password_hash, is_active)
   VALUES (:username, :hash, 1)
   ON DUPLICATE KEY UPDATE
     password_hash = VALUES(password_hash),
     is_active = 1`,
  { username, hash }
);

console.log("Admin criado/atualizado:", username);
process.exit(0);
