import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
export function createVault({
  key = process.env.HEALTH_DATA_KEY,
  production = false,
  developmentSecret = "development-only",
} = {}) {
  if (production && !/^[a-f0-9]{64}$/i.test(key || ""))
    throw Error(
      "HEALTH_DATA_KEY must contain 64 hexadecimal characters. Preserve this key with encrypted backups.",
    );
  const material = key
    ? Buffer.from(key, "hex")
    : createHash("sha256").update(developmentSecret).digest();
  if (material.length !== 32)
    throw Error("Invalid health-data encryption key.");
  const prefix = "mdenc:v1:";
  function seal(value) {
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", material, iv);
    const body = Buffer.concat([
      cipher.update(String(value), "utf8"),
      cipher.final(),
    ]);
    return (
      prefix + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64")
    );
  }
  function open(value) {
    if (!String(value).startsWith(prefix)) return String(value || "");
    const bytes = Buffer.from(value.slice(prefix.length), "base64");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      material,
      bytes.subarray(0, 12),
    );
    decipher.setAuthTag(bytes.subarray(12, 28));
    return Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
  }
  return {
    seal,
    open,
    pack: (value) => seal(JSON.stringify(value)),
    unpack: (value) => JSON.parse(open(value || "{}")),
  };
}
