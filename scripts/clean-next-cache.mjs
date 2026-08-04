import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const nextDirectory = path.join(projectRoot, ".next");
const relativeTarget = path.relative(projectRoot, nextDirectory);

if (relativeTarget !== ".next" || relativeTarget.startsWith("..")) {
  throw new Error(`Refusing to remove unexpected cache path: ${nextDirectory}`);
}

await rm(nextDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
console.log(`[clean:next] Removed generated Next.js cache: ${nextDirectory}`);
