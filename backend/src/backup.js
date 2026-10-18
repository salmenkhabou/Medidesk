import { encryptBackup } from "./backup-codec.js";
import "dotenv/config";
import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, chmodSync, rmSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
export async function backupDatabase(
  filename = process.env.DB_PATH || "./data/medidesk.sqlite",
  destination,
) {
  const folder = join(dirname(resolve(filename)), "backups");
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const target =
    destination ||
    join(
      folder,
      `medidesk-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
    );
  const db = new DatabaseSync(filename, { readOnly: true });
  const previousMask = process.umask(0o077);
  try {
    await backup(db, target);
    chmodSync(target, 0o600);
    return target;
  } finally {
    db.close();
    process.umask(previousMask);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const file = await backupDatabase();
  if (process.env.HEALTH_DATA_KEY) {
    try {
      await encryptBackup(file, file + ".enc");
    } finally {
      rmSync(file, { force: true });
    }
    console.log("Authenticated encrypted database backup completed.");
  } else if (process.env.NODE_ENV === "production") {
    rmSync(file);
    throw Error("HEALTH_DATA_KEY is required for production backups.");
  } else
    console.log("Private SQLite online backup completed in the data volume.");
}
