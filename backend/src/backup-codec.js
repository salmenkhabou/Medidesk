import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
  appendFileSync,
  statSync,
  openSync,
  readSync,
  closeSync,
  rmSync,
} from "node:fs";
import { pipeline } from "node:stream/promises";
const magic = Buffer.from("MDESK01\n");
function key() {
  if (!/^[a-f0-9]{64}$/i.test(process.env.HEALTH_DATA_KEY || ""))
    throw Error("A valid HEALTH_DATA_KEY is required.");
  return Buffer.from(process.env.HEALTH_DATA_KEY, "hex");
}
export async function encryptBackup(source, target) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  writeFileSync(target, Buffer.concat([magic, iv]), {
    mode: 0o600,
    flag: "wx",
  });
  try {
    await pipeline(
      createReadStream(source),
      cipher,
      createWriteStream(target, { flags: "a" }),
    );
    appendFileSync(target, cipher.getAuthTag());
  } catch (error) {
    rmSync(target, { force: true });
    throw error;
  }
  return target;
}
export async function decryptBackup(source, target) {
  const size = statSync(source).size;
  if (size < 36) throw Error("Invalid backup.");
  const fd = openSync(source, "r"),
    header = Buffer.alloc(20),
    tag = Buffer.alloc(16);
  try {
    readSync(fd, header, 0, 20, 0);
    readSync(fd, tag, 0, 16, size - 16);
  } finally {
    closeSync(fd);
  }
  if (!header.subarray(0, 8).equals(magic))
    throw Error("Invalid backup format.");
  const decipher = createDecipheriv("aes-256-gcm", key(), header.subarray(8));
  decipher.setAuthTag(tag);
  try {
    await pipeline(
      createReadStream(source, { start: 20, end: size - 17 }),
      decipher,
      createWriteStream(target, { mode: 0o600, flags: "wx" }),
    );
  } catch (error) {
    rmSync(target, { force: true });
    throw error;
  }
  return target;
}
