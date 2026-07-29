import { cp, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public");

await mkdir(output, { recursive: true });
await Promise.all([
  copyFile(resolve(root, "index.html"), resolve(output, "game.html")),
  copyFile(resolve(root, "styles.css"), resolve(output, "styles.css")),
  copyFile(resolve(root, "script.js"), resolve(output, "script.js")),
  cp(resolve(root, "music"), resolve(output, "music"), { recursive: true, force: true }),
  cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true, force: true }),
]);
