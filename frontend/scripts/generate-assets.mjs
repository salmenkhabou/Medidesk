import { chromium } from "playwright";
import { readFile, writeFile, chmod } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const publicDirectory = new URL("../public/", import.meta.url);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE_PATH
    ? {
        executablePath: process.env.BROWSER_EXECUTABLE_PATH,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block}</style>${await readFile(new URL("og-image.svg", publicDirectory), "utf8")}`,
  );
  await page.screenshot({
    path: fileURLToPath(new URL("og-image.png", publicDirectory)),
  });
  const source = await readFile(
    new URL("favicon.svg", publicDirectory),
    "utf8",
  );
  const buffers = [];
  for (const [size, filename] of [
    [16, "favicon-16x16.png"],
    [32, "favicon-32x32.png"],
    [180, "apple-touch-icon.png"],
    [192, "android-chrome-192x192.png"],
    [512, "android-chrome-512x512.png"],
  ]) {
    const data = await page.evaluate(
      async ({ source, size }) => {
        const image = new Image();
        image.src =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        canvas.getContext("2d").drawImage(image, 0, 0, size, size);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { source, size },
    );
    const buffer = Buffer.from(data, "base64");
    await writeFile(new URL(filename, publicDirectory), buffer);
    if (size <= 32) buffers.push({ size, buffer });
  }
  const header = Buffer.alloc(6 + 16 * buffers.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(buffers.length, 4);
  let offset = header.length;
  buffers.forEach(({ size, buffer }, index) => {
    const at = 6 + index * 16;
    header[at] = header[at + 1] = size;
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(buffer.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += buffer.length;
  });
  await writeFile(
    new URL("favicon.ico", publicDirectory),
    Buffer.concat([header, ...buffers.map((item) => item.buffer)]),
  );
  for (const name of [
    "og-image.png",
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
  ])
    await chmod(new URL(name, publicDirectory), 0o644);
  console.log(
    "Generated 1200×630 Open Graph PNG, favicon ICO/PNGs and Apple/Android icons.",
  );
} finally {
  await browser.close();
}
