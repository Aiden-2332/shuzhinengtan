import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const reportDirectory = path.join(projectRoot, "report");
const reportEntry = path.join(reportDirectory, "api_server.py");
const tsxEntry = path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
const appPort = process.env.DEPLOY_RUN_PORT ?? process.env.PORT ?? "5000";
const reportPort = process.env.REPORT_PORT ?? "8001";
const children = new Set();
let shuttingDown = false;

function findPython() {
  const candidates = process.platform === "win32"
    ? ["python", "python3", "py"]
    : ["python3", "python"];

  return candidates.find((candidate) => {
    const result = spawnSync(candidate, ["--version"], {
      cwd: projectRoot,
      stdio: "ignore",
      shell: false,
    });
    return result.status === 0;
  });
}

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
    shell: false,
    ...options,
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

function stopChildren(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) child.kill(signal);
  });
}

if (existsSync(reportEntry)) {
  const python = findPython();
  if (python) {
    console.log(`[dev] Starting report backend on port ${reportPort}...`);
    const report = startProcess(python, [reportEntry], {
      cwd: reportDirectory,
      env: { ...process.env, PORT: reportPort },
    });
    report.once("exit", (code) => {
      if (!shuttingDown && code !== 0) {
        console.warn(`[dev] Report backend exited with code ${code}; frontend preview will remain available.`);
      }
    });
  } else {
    console.warn("[dev] Python was not found; starting the frontend without the optional report backend.");
  }
} else {
  console.warn("[dev] report/api_server.py is absent; starting the frontend only.");
}

if (!existsSync(tsxEntry)) {
  console.error("[dev] tsx is not installed. Run `pnpm install` before starting the preview.");
  stopChildren();
  process.exit(1);
}

console.log(`[dev] Starting Next.js preview on http://localhost:${appPort}...`);
const frontend = startProcess(process.execPath, [tsxEntry, "watch", "src/server.ts"], {
  env: { ...process.env, PORT: appPort },
});

frontend.once("exit", (code, signal) => {
  stopChildren();
  if (signal) process.exitCode = 1;
  else process.exitCode = code ?? 0;
});

process.once("SIGINT", () => stopChildren("SIGINT"));
process.once("SIGTERM", () => stopChildren("SIGTERM"));
process.once("exit", () => stopChildren());
