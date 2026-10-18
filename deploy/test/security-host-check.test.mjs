import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
function run(t, mode = "valid") {
  const root = mkdtempSync(join(tmpdir(), "medidesk-security-host-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(
    join(root, ".env"),
    "JWT_SECRET=never-print-this-test-secret\n",
    { mode: 0o600 },
  );
  const stub = (name, body) =>
    writeFileSync(join(bin, name), "#!/usr/bin/env python3\n" + body, {
      mode: 0o755,
    });
  stub("sudo", "import os,sys\nos.execvp(sys.argv[1],sys.argv[1:])\n");
  stub(
    "curl",
    `import sys,os,json\nfrom pathlib import Path\na=sys.argv[1:]\nheaders='content-security-policy: default-src self\\nx-content-type-options: nosniff\\nx-frame-options: deny\\nreferrer-policy: same-origin\\ncache-control: no-store\\n'\nif os.environ.get('CHECK_MODE')=='missing-header': headers=''\nPath(a[a.index('-D')+1]).write_text(headers)\noutput=a[a.index('-o')+1]\nif output!='/dev/null': Path(output).write_text(json.dumps({'status':'online','database':'connected'}))\n`,
  );
  stub(
    "docker",
    `import sys,os,json\na=sys.argv[1:]\nwith open(os.environ['CHECK_LOG'],'a') as f:f.write(' '.join(a)+'\\n')\nif a[0]=='ps':print('fixture-container' if '--format' in a and a[a.index('--format')+1]=='{{.ID}}' else 'MediDesk healthy')\nelif a[0]=='inspect': print(json.dumps({'5000/tcp':[{'HostPort':'5000'}]} if os.environ.get('CHECK_MODE')=='published-api' else {}))\nelse: raise SystemExit('Mutation forbidden')\n`,
  );
  stub("systemctl", "raise SystemExit(0)\n");
  const result = spawnSync(
    "bash",
    [new URL("../security-check-host.sh", import.meta.url).pathname],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: bin + ":" + process.env.PATH,
        MEDIDESK_DEPLOY_ROOT: root,
        CHECK_MODE: mode,
        CHECK_LOG: join(root, "commands"),
      },
    },
  );
  const output = result.stdout + result.stderr;
  assert.ok(!output.includes("never-print-this-test-secret"));
  const log = readFileSync(join(root, "commands"), {
    encoding: "utf8",
    flag: "a+",
  });
  assert.ok(!/\b(?:up|down|restart|stop|rm|prune|exec)\b/.test(log));
  assert.ok(!log.includes("mtc_"));
  return { result, output };
}
test("host security check passes valid isolated deployment without mutations or secret output", (t) =>
  assert.equal(run(t).result.status, 0));
test("host security check fails when public security headers are missing", (t) =>
  assert.notEqual(run(t, "missing-header").result.status, 0));
test("host security check fails when an internal API port is published", (t) =>
  assert.notEqual(run(t, "published-api").result.status, 0));
