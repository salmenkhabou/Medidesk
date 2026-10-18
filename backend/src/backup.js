import "dotenv/config";
import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
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
  await backupDatabase();
  console.log("Private SQLite online backup completed in the data volume.");
}
