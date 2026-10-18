import "dotenv/config";
import { DatabaseSync } from "node:sqlite";
import { resolve, dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync, renameSync, rmSync } from "node:fs";
import { decryptBackup } from "./backup-codec.js";
const source = process.argv[2];
if (!source) throw Error("Usage: node src/restore.js BACKUP.enc [--restore]");
const target = resolve(process.env.DB_PATH || "./data/medidesk.sqlite"),
  temporary = join(dirname(target), `.restore-${randomUUID()}.sqlite`);
try {
  await decryptBackup(source, temporary);
  const db = new DatabaseSync(temporary, { readOnly: true });
  try {
    if (db.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
      throw Error("Backup integrity check failed.");
  } finally {
    db.close();
  }
  if (process.argv.includes("--restore")) {
    if (process.env.RESTORE_CONFIRMED_BACKEND_STOPPED !== "YES")
      throw Error(
        "Stop the backend first and explicitly confirm RESTORE_CONFIRMED_BACKEND_STOPPED=YES.",
      );
    const suffix = ".pre-restore-" + Date.now();
    for (const file of [target, target + "-wal", target + "-shm"])
      if (existsSync(file)) renameSync(file, file + suffix);
    renameSync(temporary, target);
    console.log("Verified backup restored; previous database files retained.");
  } else
    console.log(
      "Backup authentication and SQLite integrity verified. No database replaced.",
    );
} finally {
  rmSync(temporary, { force: true });
}
