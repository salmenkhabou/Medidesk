import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "medidesk-practice-upgrade-")),
    bin = join(root, "bin"),
    deploy = join(root, "source", "deploy"),
    log = join(root, "calls");
  mkdirSync(bin);
  mkdirSync(deploy, { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  copyFileSync(
    new URL("../update-practice.sh", import.meta.url),
    join(deploy, "update-practice.sh"),
  );
  writeFileSync(
    join(root, ".env"),
    "JWT_SECRET=test-only-not-real\nBACKEND_IMAGE=medidesk-backend:first-version\nFRONTEND_IMAGE=medidesk-frontend:first-version\n",
  );
  const stub = (name, body) =>
    writeFileSync(join(bin, name), body, { mode: 0o755 });
  stub("sudo", '#!/bin/sh\nexec "$@"\n');
  stub("git", '#!/bin/sh\nprintf "aaaaaaaaaaaa\\n"\n');
  for (const name of ["install", "systemctl"])
    stub(name, "#!/bin/sh\nexit 0\n");
  stub(
    "docker",
    `#!/usr/bin/env node
const fs=require('fs'),a=process.argv.slice(2);fs.appendFileSync(process.env.TEST_LOG,JSON.stringify(a)+'\\n');
if(a.includes('ps')){console.log(a.some(x=>x.includes('service=backend'))?'backend-id':'frontend-id');}
if(a.includes('inspect'))console.log(a.some(x=>x.includes('.Mounts'))?'medidesk_backend-data':'sha256:'+'1'.repeat(64));
if(a.includes('build')&&process.env.FAIL_BUILD==='1')process.exit(1);
if(a.includes('up')&&process.env.FAIL_START==='1'){const flag=process.env.TEST_LOG+'.failed';if(!fs.existsSync(flag)){fs.writeFileSync(flag,'1');process.exit(1);}}
if(a.includes('run')&&a.some(x=>x.includes('DatabaseSync'))&&process.env.FAIL_BACKUP==='1')process.exit(1);
if(a.includes('src/restore.js')&&process.env.FAIL_RESTORE==='1')process.exit(1);
`,
  );
  stub(
    "curl",
    `#!/usr/bin/env node
if(process.env.FAIL_HEALTH==='1')process.exit(22);console.log(JSON.stringify({status:'online',database:'connected'}));
`,
  );
  return {
    root,
    run: (extra = {}) =>
      spawnSync("bash", [join(deploy, "update-practice.sh")], {
        encoding: "utf8",
        env: {
          ...process.env,
          MEDIDESK_DEPLOY_ROOT: root,
          PATH: bin + ":" + process.env.PATH,
          TEST_LOG: log,
          ...extra,
        },
      }),
    calls: () =>
      existsSync(log)
        ? readFileSync(log, "utf8")
            .trim()
            .split("\n")
            .filter(Boolean)
            .map(JSON.parse)
        : [],
  };
}
test("practice upgrade builds before maintenance and snapshots before migration without touching another project", (t) => {
  const f = fixture(t),
    r = f.run();
  assert.equal(r.status, 0, r.stderr);
  const c = f.calls(),
    build = c.findIndex((a) => a.includes("build")),
    stop = c.findIndex((a) => a.includes("stop")),
    snapshot = c.findIndex(
      (a) => a.includes("run") && a.some((x) => x.includes("DatabaseSync")),
    ),
    up = c.findIndex((a) => a.includes("up"));
  assert.ok(build < stop && stop < snapshot && snapshot < up);
  assert.ok(!JSON.stringify(c).includes("mtc_"));
  assert.ok(!c.some((a) => a.includes("prune") || a.includes("--volumes")));
  const env = readFileSync(join(f.root, ".env"), "utf8");
  assert.match(env, /HEALTH_DATA_KEY=[a-f0-9]{64}/);
  assert.match(env, /BACKEND_IMAGE=medidesk-backend:practice-aaaaaaaaaaaa/);
});
test("failed build does not stop the running practice", (t) => {
  const f = fixture(t);
  assert.notEqual(f.run({ FAIL_BUILD: "1" }).status, 0);
  assert.ok(!f.calls().some((a) => a.includes("stop") || a.includes("down")));
});
test("snapshot failure restarts prior images without attempting a database replacement", (t) => {
  const f = fixture(t);
  assert.notEqual(f.run({ FAIL_BACKUP: "1" }).status, 0);
  assert.ok(!f.calls().some((a) => a.includes("src/restore.js")));
  assert.ok(f.calls().some((a) => a.includes("up")));
  assert.match(
    readFileSync(join(f.root, ".env"), "utf8"),
    /BACKEND_IMAGE=medidesk-backend:before-practice-/,
  );
});
for (const failure of ["FAIL_START", "FAIL_HEALTH"])
  test(`${failure}: stop the new stack, restore its verified snapshot and restart previous images`, (t) => {
    const f = fixture(t);
    assert.notEqual(f.run({ [failure]: "1" }).status, 0);
    const calls = f.calls(),
      down = calls.findIndex((a) => a.includes("down")),
      restore = calls.findIndex((a) => a.includes("src/restore.js")),
      ups = calls
        .map((a, n) => (a.includes("up") ? n : -1))
        .filter((n) => n >= 0);
    assert.ok(down > ups[0] && restore > down && ups[1] > restore);
    assert.ok(calls[restore].includes("RESTORE_CONFIRMED_BACKEND_STOPPED=YES"));
  });
test("failed snapshot restoration leaves the practice stopped for operator recovery", (t) => {
  const f = fixture(t),
    r = f.run({ FAIL_START: "1", FAIL_RESTORE: "1" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Automatic database restore failed/);
  assert.equal(f.calls().filter((a) => a.includes("up")).length, 1);
});
