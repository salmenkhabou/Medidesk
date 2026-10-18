import "dotenv/config";
import { openDatabase } from "./db/database.js";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
const db = openDatabase();
if (db.prepare("SELECT id FROM users WHERE role='superadmin'").get())
  throw Error(
    "An administrator already exists. Create additional accounts from the application.",
  );
const prompt = createInterface({ input: stdin, output: stdout });
try {
  const name = (
    process.env.ADMIN_NAME || (await prompt.question("Administrator name: "))
  ).trim();
  const email = (
    process.env.ADMIN_EMAIL || (await prompt.question("Administrator email: "))
  )
    .trim()
    .toLowerCase();
  // Supply a real password through the process environment; never commit it or use a shared default.
  const password = process.env.ADMIN_PASSWORD;
  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password) > 72
  )
    throw Error(
      "Provide a valid name/email and ADMIN_PASSWORD (12+ characters, at most 72 bytes).",
    );
  db.prepare(
    "INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,'superadmin')",
  ).run(name, email, await bcrypt.hash(password, 12));
  console.log("Administrator created. No demo accounts were added.");
} finally {
  prompt.close();
  db.close();
}
