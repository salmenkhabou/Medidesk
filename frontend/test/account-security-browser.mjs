import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const frontend = resolve(fileURLToPath(new URL("..", import.meta.url)));
const backend = resolve(frontend, "../backend");
import { totp } from "../../backend/src/account-security.js";
const folder = mkdtempSync(join(tmpdir(), "medidesk-account-browser-")),
  mail = join(folder, "mail.json");
const children = [];
let browser;
let logs = "";
function start(args, cwd, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (b) => (logs += b));
  return child;
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await pause(100);
  }
  throw Error("Startup failed: " + logs);
}
async function latestMail(count) {
  for (let i = 0; i < 100; i++) {
    if (existsSync(mail)) {
      const data = JSON.parse(readFileSync(mail));
      if (data.length >= count) return data.at(-1);
    }
    await pause(100);
  }
  throw Error("Mail not delivered");
}
try {
  start(
    [
      "--input-type=module",
      "-e",
      `import {createApp} from './src/app.js';import {writeFileSync} from 'node:fs';const sent=[];const app=createApp({securityMailTransport:{sendMail:async m=>{sent.push(m);writeFileSync(process.env.TEST_MAIL,JSON.stringify(sent));}}});app.listen(5091,'127.0.0.1');setInterval(()=>app.locals.accountSecurity.sendEmail(),100);`,
    ],
    backend,
    {
      DB_PATH: join(folder, "data.sqlite"),
      JWT_SECRET: "isolated-browser-account-test-secret-32",
      FRONTEND_URL: "http://127.0.0.1:5191",
      TEST_MAIL: mail,
    },
  );
  start(
    ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5191"],
    frontend,
    { MEDIDESK_API_TARGET: "http://127.0.0.1:5091" },
  );
  await ready("http://127.0.0.1:5091/api/health");
  await ready("http://127.0.0.1:5191");
  const response = await fetch("http://127.0.0.1:5091/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Security Browser",
      email: "browser@example.test",
      password: "Browser1!",
    }),
  });
  assert.equal(response.status, 201);
  browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  async function login(password = "Browser1!") {
    await page.goto("http://127.0.0.1:5191/connexion");
    await page
      .getByLabel("Adresse email", { exact: true })
      .fill("browser@example.test");
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
  }
  async function security() {
    await page
      .locator(".sidebar")
      .getByRole("button", { name: "Paramètres", exact: true })
      .click();
    await page.getByRole("button", { name: "Sécurité", exact: true }).click();
  }
  await login();
  await security();
  await page
    .getByLabel("Mot de passe actuel pour configurer")
    .fill("Browser1!");
  await page
    .getByRole("button", {
      name: "Configurer la double authentification",
      exact: true,
    })
    .click();
  const secret = await page.locator("code.security-secret").innerText();
  await page
    .getByLabel("Code de l’application · 6 chiffres")
    .fill(totp(secret));
  await page
    .getByRole("button", { name: "Activer avec le code", exact: true })
    .click();
  const codes = (await page.locator("pre.security-secret").innerText())
    .trim()
    .split("\n");
  assert.equal(codes.length, 10);
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  await login();
  await page
    .getByRole("heading", { name: "Vérification de sécurité" })
    .waitFor();
  await page.getByLabel("Code de sécurité", { exact: true }).fill(codes[0]);
  await page
    .getByRole("button", { name: "Vérifier et se connecter", exact: true })
    .click();
  await security();
  await page
    .getByLabel("Mot de passe actuel pour désactiver")
    .fill("Browser1!");
  await page.getByLabel("Code Authenticator ou code de secours").fill(codes[1]);
  await page
    .getByRole("button", {
      name: "Désactiver la double authentification",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Configurer la double authentification",
      exact: true,
    })
    .waitFor();
  await page
    .getByRole("button", { name: "Envoyer un code par email", exact: true })
    .click();
  const verify = (await latestMail(1)).text.match(/[a-f0-9]{48}/)[0];
  await page.getByLabel("Code reçu par email", { exact: true }).fill(verify);
  await page
    .getByRole("button", { name: "Vérifier mon adresse", exact: true })
    .click();
  await page
    .getByText("Votre adresse email a été vérifiée.", { exact: true })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  const axe = await new AxeBuilder({ page })
    .include(".account-protection")
    .analyze();
  assert.deepEqual(
    axe.violations.map((v) => v.id),
    [],
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.goto("http://127.0.0.1:5191/connexion");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page
    .getByRole("button", { name: "Mot de passe oublié ?", exact: true })
    .click();
  await page
    .getByLabel("Email du compte à récupérer")
    .fill("browser@example.test");
  await page
    .getByRole("button", {
      name: "Envoyer un code de récupération",
      exact: true,
    })
    .click();
  const reset = (await latestMail(2)).text.match(/[a-f0-9]{48}/)[0];
  await page.getByLabel("Code de récupération reçu par email").fill(reset);
  await page
    .getByLabel("Nouveau mot de passe", { exact: true })
    .fill("Recovered1!");
  await page
    .getByRole("button", {
      name: "Enregistrer le nouveau mot de passe",
      exact: true,
    })
    .click();
  await page
    .getByRole("heading", { name: "Heureux de vous retrouver" })
    .waitFor();
  await login("Recovered1!");
  await page.locator(".mobile-nav").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: browser MFA setup/login/recovery/disable, email verification, password reset/login and mobile accessibility; mocked SMTP only.",
  );
} finally {
  if (browser) await browser.close();
  for (const child of children) child.kill("SIGTERM");
  await pause(150);
  rmSync(folder, { recursive: true, force: true });
}
