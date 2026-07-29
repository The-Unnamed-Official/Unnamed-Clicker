import { cp, copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public");

await mkdir(output, { recursive: true });
const tracks = (await readdir(resolve(root, "music"), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  .map((name) => `./music/${name.replaceAll("\\", "/")}`);

const musicLibrary = `window.BUTTON_REACTOR_TRACKS = Object.freeze(${JSON.stringify(tracks, null, 2)});\n`;
await writeFile(resolve(root, "music-library.js"), musicLibrary, "utf8");
await Promise.all([
  copyFile(resolve(root, "index.html"), resolve(output, "game.html")),
  copyFile(resolve(root, "styles.css"), resolve(output, "styles.css")),
  copyFile(resolve(root, "script.js"), resolve(output, "script.js")),
  writeFile(resolve(output, "music-library.js"), musicLibrary, "utf8"),
  cp(resolve(root, "music"), resolve(output, "music"), { recursive: true, force: true }),
  cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true, force: true }),
]);
