import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  symlinkSync,
  readlinkSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const newRevision = "a".repeat(40),
  oldRevision = "b".repeat(40);
function fixture(t, { previous = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "medidesk-release-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  mkdirSync(bin);
  const log = join(root, "calls.log");
  writeFileSync(
    join(bin, "docker"),
    `#!/usr/bin/env node
const fs=require('fs');const args=process.argv.slice(2);fs.appendFileSync(process.env.TEST_LOG,JSON.stringify(args)+'\\n');
const isCandidate=args.some(a=>a.includes(process.env.TEST_REVISION));
if(args.includes('ps')&&process.env.UNMANAGED==='1')process.stdout.write('existing-container');
if(args.includes('pull')&&process.env.FAIL_PULL==='1')process.exit(1);
if(args.includes('up')&&isCandidate&&process.env.FAIL_DEPLOY==='1')process.exit(1);
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, "curl"),
    `#!/usr/bin/env node
if(process.env.FAIL_HEALTH==='1')process.exit(22);
console.log(JSON.stringify({status:'online',database:'connected'}));
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(root, ".env"),
    "JWT_SECRET=unit-test-fixture-not-real\n",
    { mode: 0o600 },
  );
  function release(revision) {
    const dir = join(root, "releases", revision);
    mkdirSync(join(dir, "deploy"), { recursive: true });
    for (const name of ["release.sh", "compose.yml", "nginx.conf.template"])
      copyFileSync(
        new URL("../" + name, import.meta.url),
        join(dir, "deploy", name),
      );
    writeFileSync(
      join(dir, "images.env"),
      `RELEASE_SHA=${revision}\nSITE_URL=https://example.test:8443\nSITE_HOST=example.test\nBACKEND_IMAGE=ghcr.io/example/api@sha256:${"1".repeat(64)}\nFRONTEND_IMAGE=ghcr.io/example/web@sha256:${"2".repeat(64)}\n`,
    );
    return dir;
  }
  const candidate = release(newRevision);
  let old;
  if (previous) {
    old = release(oldRevision);
    symlinkSync(old, join(root, "current"));
  }
  const run = (env = {}) =>
    spawnSync("bash", [join(candidate, "deploy", "release.sh"), newRevision], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: bin + ":" + process.env.PATH,
        MEDIDESK_DEPLOY_ROOT: root,
        TEST_LOG: log,
        TEST_REVISION: newRevision,
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
  return { root, candidate, old, run, calls };
}
test("successful first release switches current only after health checks and never prunes data", (t) => {
  const f = fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readlinkSync(join(f.root, "current")), f.candidate);
  assert.ok(f.calls().some((a) => a.includes("up") && a.includes("--wait")));
  assert.ok(
    !f
      .calls()
      .some(
        (a) =>
          a.includes("prune") || a.includes("--volumes") || a.includes("-v"),
      ),
  );
});
test("failed upgrade backs up SQLite, restores prior images and keeps the old release link", (t) => {
  const f = fixture(t, { previous: true });
  const result = f.run({ FAIL_DEPLOY: "1" });
  assert.notEqual(result.status, 0);
  assert.equal(readlinkSync(join(f.root, "current")), f.old);
  assert.ok(
    f.calls().some((a) => a.includes("exec") && a.includes("src/backup.js")),
  );
  assert.equal(f.calls().filter((a) => a.includes("up")).length, 2);
  assert.ok(!f.calls().some((a) => a.includes("down")));
});
test("HTTPS failure rolls back an upgrade instead of advertising an unverified release", (t) => {
  const f = fixture(t, { previous: true });
  assert.notEqual(f.run({ FAIL_HEALTH: "1" }).status, 0);
  assert.equal(readlinkSync(join(f.root, "current")), f.old);
  assert.equal(f.calls().filter((a) => a.includes("up")).length, 2);
});
test("failed first release retains volumes and never creates a current link", (t) => {
  const f = fixture(t);
  assert.notEqual(f.run({ FAIL_DEPLOY: "1" }).status, 0);
  assert.equal(existsSync(join(f.root, "current")), false);
  const down = f.calls().find((a) => a.includes("down"));
  assert.ok(down);
  assert.ok(!down.includes("-v") && !down.includes("--volumes"));
});
test("registry failure leaves existing deployment untouched; unmanaged stacks are not adopted silently", (t) => {
  const f = fixture(t, { previous: true });
  assert.notEqual(f.run({ FAIL_PULL: "1" }).status, 0);
  assert.equal(readlinkSync(join(f.root, "current")), f.old);
  assert.ok(!f.calls().some((a) => a.includes("up")));
  const fresh = fixture(t);
  assert.notEqual(fresh.run({ UNMANAGED: "1" }).status, 0);
  assert.ok(!fresh.calls().some((a) => a.includes("up") || a.includes("down")));
});
test("mutable image tags are rejected before deployment commands run", (t) => {
  const f = fixture(t);
  const file = join(f.candidate, "images.env");
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      /BACKEND_IMAGE=.*/,
      "BACKEND_IMAGE=ghcr.io/example/api:latest",
    ),
  );
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(f.calls(), []);
});
