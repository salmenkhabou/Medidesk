import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "medidesk-update-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin"),
    deploy = join(root, "source", "deploy"),
    log = join(root, "commands");
  mkdirSync(bin);
  mkdirSync(deploy, { recursive: true });
  copyFileSync(
    new URL("../update-frontend.sh", import.meta.url),
    join(deploy, "update-frontend.sh"),
  );
  writeFileSync(
    join(root, ".env"),
    "FRONTEND_IMAGE=medidesk-frontend:first-version\n",
  );
  writeFileSync(join(bin, "sudo"), '#!/bin/sh\nexec "$@"\n', { mode: 0o755 });
  writeFileSync(
    join(bin, "docker"),
    `#!/usr/bin/env node
const fs=require('fs'),args=process.argv.slice(2);fs.appendFileSync(process.env.TEST_LOG,JSON.stringify(args)+'\\n');
if(args.includes('ps'))console.log('frontend-running');
if(args.includes('inspect'))console.log('sha256:'+ '1'.repeat(64));
if(args.includes('build')&&process.env.FAIL_BUILD==='1')process.exit(1);
if(args.includes('up')&&process.env.FAIL_UP==='1'){const flag=process.env.TEST_LOG+'.failed';if(!fs.existsSync(flag)){fs.writeFileSync(flag,'1');process.exit(1);}}
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, "curl"),
    `#!/usr/bin/env node
if(process.env.FAIL_HEALTH==='1')process.exit(22);console.log(JSON.stringify({status:'online',database:'connected'}));
`,
    { mode: 0o755 },
  );
  const run = (env = {}) =>
    spawnSync("bash", [join(deploy, "update-frontend.sh")], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: bin + ":" + process.env.PATH,
        MEDIDESK_DEPLOY_ROOT: root,
        TEST_LOG: log,
        ...env,
      },
    });
  const calls = () =>
    existsSync(log)
      ? readFileSync(log, "utf8")
          .trim()
          .split("\n")
          .filter(Boolean)
          .map(JSON.parse)
      : [];
  return { root, run, calls };
}
test("frontend update rebuilds and recreates only frontend while retaining a rollback image", (t) => {
  const f = fixture(t),
    r = f.run();
  assert.equal(r.status, 0, r.stderr);
  const calls = f.calls(),
    up = calls.find((a) => a.includes("up")),
    build = calls.find((a) => a.includes("build"));
  assert.ok(up.includes("--no-deps") && up.at(-1) === "frontend");
  assert.equal(build.at(-1), "frontend");
  assert.ok(
    calls.some(
      (a) =>
        a[0] === "tag" && a[2].startsWith("medidesk-frontend:before-update-"),
    ),
  );
  assert.ok(
    !calls.some((a) =>
      a.some((v) =>
        ["down", "prune", "stop", "backend", "gateway", "mtc_nginx"].includes(
          v,
        ),
      ),
    ),
  );
});
test("failed frontend build leaves the running containers untouched", (t) => {
  const f = fixture(t);
  assert.notEqual(f.run({ FAIL_BUILD: "1" }).status, 0);
  assert.ok(!f.calls().some((a) => a.includes("up")));
});
for (const failure of ["FAIL_UP", "FAIL_HEALTH"])
  test(`${failure} restores and restarts only the previous frontend`, (t) => {
    const f = fixture(t);
    assert.notEqual(f.run({ [failure]: "1" }).status, 0);
    assert.ok(
      f
        .calls()
        .some(
          (a) =>
            a[0] === "tag" &&
            a[1] === "sha256:" + "1".repeat(64) &&
            a[2] === "medidesk-frontend:first-version",
        ),
    );
    const updates = f.calls().filter((a) => a.includes("up"));
    assert.equal(updates.length, 2);
    assert.ok(
      updates.every((a) => a.includes("--no-deps") && a.at(-1) === "frontend"),
    );
  });
