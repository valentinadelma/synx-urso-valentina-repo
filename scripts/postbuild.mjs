import { copyFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_CLIENT = resolve(__dirname, "..", "dist", "client");
const SHELL_PATH = join(DIST_CLIENT, "_shell.html");
const INDEX_PATH = join(DIST_CLIENT, "index.html");

if (existsSync(SHELL_PATH)) {
  copyFileSync(SHELL_PATH, INDEX_PATH);
  console.log("Post-build: _shell.html copied to index.html");
} else if (existsSync(INDEX_PATH)) {
  console.log("Post-build: index.html already exists, skipping copy.");
} else {
  console.warn("Post-build warning: Neither _shell.html nor index.html found in dist/client.");
}
