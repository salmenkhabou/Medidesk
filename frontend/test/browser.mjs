// All identities and records in this test are temporary fixtures, never application seeds.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import bcrypt from "../../backend/node_modules/bcryptjs/index.js";
import { openDatabase } from "../../backend/src/db/database.js";

const frontend = resolve(fileURLToPath(new URL("..", import.meta.url)));
const root = resolve(frontend, "..");
const folder = mkdtempSync(join(tmpdir(), "medidesk-browser-"));
const filename = join(folder, "browser.sqlite");
const artifacts = process.env.E2E_ARTIFACTS || join(folder, "artifacts");
mkdirSync(artifacts, { recursive: true });
const db = openDatabase(filename);
const password = "Browser-fixture-only-8!";
const hash = await bcrypt.hash(password, 4);
const insert = db.prepare(
  "INSERT INTO users(name,email,password_hash,role,specialty,city,cnom) VALUES (?,?,?,?,?,?,?)",
);
insert.run(
  "Test Administrator",
  "admin@example.test",
  hash,
  "superadmin",
  "",
  "",
  "",
);
insert.run(
  "Test Practitioner",
  "doctor@example.test",
  hash,
  "doctor",
  "Médecine générale",
  "Tunis",
  "TEST-ONLY",
);
insert.run("Test Patient", "patient@example.test", hash, "patient", "", "", "");
db.close();
const children = [];
let logs = "";
function start(args, cwd, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => {
    logs += chunk;
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk;
  });
  children.push(child);
  return child;
}
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    if (children.some((c) => c.exitCode !== null)) throw Error(logs);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw Error(`Service did not start: ${url}\n${logs}`);
}
let browser;
try {
  start(["src/server.js"], join(root, "backend"), {
    PORT: "5009",
    FRONTEND_URL: "http://127.0.0.1:5180",
    DB_PATH: filename,
    JWT_SECRET: "browser-fixture-key-at-least-32-characters",
    NODE_ENV: "test",
  });
  start(
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      "5180",
      "--strictPort",
    ],
    frontend,
    { MEDIDESK_API_TARGET: "http://127.0.0.1:5009" },
  );
  await ready("http://127.0.0.1:5009/api/health");
  await ready("http://127.0.0.1:5180");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE_PATH
      ? {
          executablePath: process.env.BROWSER_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => {
    errors.push(err.message);
    console.log("BROWSER ERROR", err.message);
  });
  const nav = async (label) => {
    const sidebar = page.locator(".sidebar");
    if (await sidebar.evaluate((el) => el.hasAttribute("inert")))
      await page
        .getByRole("button", { name: "Ouvrir la navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("button", { name: label, exact: true })
      .click();
  };
  const login = async (email) => {
    await nav("Connexion");
    await page.getByLabel("Adresse email", { exact: true }).fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
    try {
      await page
        .getByRole("heading", { name: /Bonjour,/ })
        .waitFor({ timeout: 10000 });
    } catch (err) {
      console.log("LOGIN PAGE", await page.locator("body").innerText());
      console.log("SERVER LOGS", logs);
      throw err;
    }
  };
  const audit = async (label) => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `Accessibility: ${label}`,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `Horizontal overflow: ${label}`,
    );
    console.log(`PASS ${label}: accessibility and layout`);
  };
  await page.goto("http://127.0.0.1:5180");
  await page
    .getByRole("heading", { name: "Trouvez votre praticien" })
    .waitFor();
  await audit("directory light");
  const cta = page.getByRole("button", {
    name: "Créer mon compte patient",
    exact: true,
  });
  const ctaBox = await cta.boundingBox();
  assert.ok(
    ctaBox && ctaBox.y + ctaBox.height < 1000,
    "Public CTA above the fold",
  );
  assert.equal(
    await page.title(),
    "Trouvez votre praticien en Tunisie | MediDesk",
  );
  const unknown = await page.goto("http://127.0.0.1:5180/page-inexistante");
  assert.equal(unknown.status(), 404);
  await page
    .getByRole("heading", { name: "Cette page a perdu son chemin" })
    .waitFor();
  await audit("custom 404");
  await page
    .getByRole("button", { name: "Trouver un praticien", exact: true })
    .click();
  assert.equal(new URL(page.url()).pathname, "/");
  await page
    .getByRole("link", { name: "Confidentialité & mesure d’audience" })
    .click();
  await page
    .getByRole("heading", { name: "Politique de confidentialité", exact: true })
    .waitFor();
  assert.equal(new URL(page.url()).pathname, "/confidentialite");
  await page.reload();
  await page
    .getByRole("heading", { name: "Politique de confidentialité", exact: true })
    .waitFor();
  assert.equal(await page.title(), "Politique de confidentialité | MediDesk");
  await audit("privacy policy draft");
  const stats = new DatabaseSync(filename);
  assert.equal(
    stats.prepare("SELECT count(*) AS n FROM analytics_daily").get().n,
    0,
    "No analytics before consent",
  );
  const event = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/analytics/events") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name: "Autoriser la mesure d’audience",
      exact: true,
    })
    .click();
  assert.equal((await event).status(), 204);
  assert.equal(
    stats
      .prepare("SELECT views FROM analytics_daily WHERE page='privacy'")
      .get().views,
    1,
  );
  await page
    .getByRole("button", { name: "Retirer mon accord", exact: true })
    .click();
  await nav("Nos praticiens");
  await page
    .getByRole("heading", { name: "Trouvez votre praticien" })
    .waitFor();
  assert.equal(
    stats.prepare("SELECT sum(views) AS n FROM analytics_daily").get().n,
    1,
    "No analytics after withdrawal",
  );
  stats.close();
  await page.goBack();
  await page
    .getByRole("heading", { name: "Politique de confidentialité", exact: true })
    .waitFor();
  await page.goForward();
  await page
    .getByRole("heading", { name: "Trouvez votre praticien" })
    .waitFor();
  console.log(
    "PASS real URLs, browser history, page metadata, above-fold CTA and consent-based analytics",
  );
  await page.getByRole("button", { name: "Préférences de confort" }).click();
  await page.getByLabel("Apparence", { exact: true }).selectOption("dark");
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page.screenshot({
    path: join(artifacts, "directory-dark.png"),
    fullPage: true,
  });
  await audit("directory dark");
  await page.reload();
  await page
    .getByRole("heading", { name: "Trouvez votre praticien" })
    .waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await login("patient@example.test");
  await audit("patient dashboard dark");
  await nav("Trouver un praticien");
  await page
    .getByRole("button", { name: "Prendre rendez-vous", exact: true })
    .click();
  await page.getByLabel("Date", { exact: true }).fill("2099-04-12");
  await page.getByLabel("Heure · Tunis").fill("09:00");
  await page.getByLabel("Motif · facultatif").fill("Browser integration test");
  await page.getByRole("button", { name: "Confirmer le rendez-vous" }).click();
  await page.getByRole("cell", { name: /Confirmé/ }).waitFor();
  console.log("PASS booking through frontend and API");
  await nav("Suggestions & retours");
  await page
    .getByRole("button", { name: "Partager une suggestion", exact: true })
    .click();
  await page
    .getByLabel("Votre suggestion")
    .fill("Une suggestion créée pendant le test navigateur.");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await page
    .getByText("Une suggestion créée pendant le test navigateur.", {
      exact: true,
    })
    .waitFor();
  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  await login("doctor@example.test");
  await nav("Rendez-vous");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.getByRole("button", { name: "Saisir la consultation" }).click();
  await page
    .getByLabel("Compte rendu", { exact: true })
    .fill("Compte rendu du test de bout en bout.");
  await page
    .getByLabel("Ordonnance · facultative")
    .fill("Ordonnance de test uniquement.");
  await page.getByRole("button", { name: "Enregistrer et terminer" }).click();
  await page.getByRole("cell", { name: "Terminé", exact: true }).waitFor();
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer un règlement" }).click();
  await page.getByLabel("Montant · TND").fill("65.125");
  await page
    .getByRole("button", { name: "Enregistrer le règlement", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await nav("Règlements");
  await page.getByRole("cell", { name: /65,125/ }).waitFor();
  console.log("PASS consultation and payment through frontend and API");
  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  await login("admin@example.test");
  await nav("Suggestions & retours");
  await page.getByRole("button", { name: "Examiner & répondre" }).click();
  await page.getByLabel("Statut", { exact: true }).selectOption("planned");
  await page
    .getByLabel("Réponse à l’auteur")
    .fill("Merci, votre retour a été examiné.");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await page
    .getByText("Merci, votre retour a été examiné.", { exact: true })
    .waitFor();
  await page.screenshot({
    path: join(artifacts, "suggestions-dark.png"),
    fullPage: true,
  });
  await audit("suggestions dark");
  await page.getByRole("button", { name: "Activer le thème clair" }).click();
  await audit("suggestions light");
  await page.screenshot({
    path: join(artifacts, "suggestions-light.png"),
    fullPage: true,
  });
  await nav("Paramètres");
  await page.getByLabel("Taille du texte").selectOption("larger");
  await page.getByLabel("Contraste renforcé").check();
  await page.getByLabel("Réduire les animations").check();
  await page.getByLabel("Espacement").selectOption("compact");
  await audit("comfort largest text high contrast");
  await page.getByLabel("Apparence", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  await audit("system dark high contrast");
  await page.getByRole("button", { name: "Rétablir les préférences" }).click();
  for (const label of [
    "Vue d’ensemble",
    "Rendez-vous",
    "Règlements",
    "Équipe",
    "Demandes de praticiens",
    "Suggestions & retours",
    "Journal d’activité",
    "Statistiques",
    "Paramètres",
  ]) {
    await nav(label);
    await page.locator(".loading").waitFor({ state: "hidden" });
    await audit(`admin ${label}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ouvrir la navigation" }).click();
  await nav("Suggestions & retours");
  await audit("mobile suggestions");
  await page.screenshot({
    path: join(artifacts, "suggestions-mobile.png"),
    fullPage: true,
  });
  await nav("Paramètres");
  await page.getByLabel("Taille du texte").selectOption("larger");
  await audit("mobile comfort largest text");
  await page.getByRole("button", { name: "Rétablir les préférences" }).click();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const label of [
      "Vue d’ensemble",
      "Rendez-vous",
      "Règlements",
      "Équipe",
      "Journal d’activité",
      "Statistiques",
      "Paramètres",
    ]) {
      await nav(label);
      await page.locator(".loading").waitFor({ state: "hidden" });
      await audit(`mobile ${width}px ${label}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ouvrir le menu complet" }).click();
  await page.getByRole("dialog", { name: "Menu de navigation" }).waitFor();
  assert.equal(
    await page.locator("body").evaluate((el) => el.style.overflow),
    "hidden",
  );
  await page.getByRole("button", { name: "Fermer le menu" }).focus();
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page
      .getByRole("button", { name: "Se déconnecter", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
    "Drawer traps keyboard focus",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("dialog", { name: "Menu de navigation" })
    .waitFor({ state: "hidden" });
  assert.equal(
    await page.locator("body").evaluate((el) => el.style.overflow),
    "",
  );
  await page.getByRole("button", { name: "Ouvrir la navigation" }).click();
  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login("patient@example.test");
  await nav("Mon dossier médical");
  await page
    .getByText("Compte rendu du test de bout en bout.", { exact: true })
    .waitFor();
  await audit("patient medical record");
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex, nofollow",
  );
  assert.equal(
    await page.locator("img:not([alt])").count(),
    0,
    "All rendered images have alt attributes",
  );
  await page.route("**/api/doctors", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await nav("Trouver un praticien");
  await page
    .getByRole("status")
    .filter({ hasText: "Chargement des données" })
    .waitFor();
  await page.locator(".loading").waitFor({ state: "hidden" });
  await page.unroute("**/api/doctors");
  console.log("PASS loading state under a delayed API response");
  // Real mobile booking, including a short landscape viewport and readable controls.
  await page.setViewportSize({ width: 390, height: 844 });
  await nav("Trouver un praticien");
  await page
    .getByRole("button", { name: "Prendre rendez-vous", exact: true })
    .click();
  await audit("mobile booking dialog");
  assert.ok(
    await page
      .getByLabel("Date", { exact: true })
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
    "Form controls avoid iOS focus zoom",
  );
  await page.getByLabel("Date", { exact: true }).fill("2099-04-13");
  await page.getByLabel("Heure · Tunis").fill("10:00");
  await page.getByRole("button", { name: "Confirmer le rendez-vous" }).click();
  await page.getByRole("cell", { name: /Confirmé/ }).waitFor();
  await audit("mobile appointment cards");
  await page.screenshot({
    path: join(artifacts, "appointments-phone.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 740, height: 360 });
  await nav("Paramètres");
  await audit("phone landscape settings");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Ouvrir la navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  for (const width of [320, 360, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await nav("Nos praticiens");
    await page.locator(".loading").waitFor({ state: "hidden" });
    await audit(`public phone ${width}px`);
    const box = await page
      .getByRole("button", { name: "Créer mon compte patient", exact: true })
      .boundingBox();
    assert.ok(
      box && box.y + box.height < 700,
      "Mobile primary action is visible without scrolling",
    );
    for (const button of await page.locator(".mobile-nav button").all()) {
      const rect = await button.boundingBox();
      assert.ok(
        rect.width >= 44 && rect.height >= 44,
        "Thumb-friendly navigation targets",
      );
    }
    if (width === 390)
      await page.screenshot({
        path: join(artifacts, "directory-phone.png"),
        fullPage: true,
      });
    await page
      .getByRole("navigation", { name: "Navigation rapide" })
      .getByRole("button", { name: "Connexion", exact: true })
      .click();
    await audit(`login phone ${width}px`);
    if (width === 390)
      await page.screenshot({
        path: join(artifacts, "login-phone.png"),
        fullPage: true,
      });
    await page
      .getByRole("button", { name: "Ouvrir la navigation", exact: true })
      .click();
    await page.getByRole("button", { name: "Fermer le menu" }).focus();
    await page.keyboard.press("Shift+Tab");
    const drawerFocus = await page
      .getByRole("dialog", { name: "Menu de navigation" })
      .evaluate((el) => el.contains(document.activeElement));
    assert.equal(drawerFocus, true, "Public drawer traps focus");
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await nav("Affichage & confort");
  await page.getByLabel("Taille du texte").selectOption("larger");
  await audit("320px largest-text preferences");
  await nav("Nos praticiens");
  await audit("320px largest-text directory");
  console.log(
    "PASS responsive layouts, mobile booking, drawer focus, landscape and touch targets",
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("PASS all browser workflows; artifacts: " + artifacts);
} finally {
  await browser?.close();
  for (const child of children) child.kill("SIGTERM");
  await Promise.all(
    children.map((child) =>
      child.exitCode !== null
        ? Promise.resolve()
        : new Promise((resolve) => child.once("exit", resolve)),
    ),
  );
  rmSync(folder, { recursive: true, force: true });
}
