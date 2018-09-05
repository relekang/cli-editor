// @flow
import { promisify } from "util";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import yaml from "js-yaml";
import omit from "lodash.omit";

const mkdirpAsync = promisify(mkdirp);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const tmpFolder = path.join("/", "tmp", "cli-editor");

function getEditor() {
  return process.env.EDITOR || "vim";
}

function randomInt(max = 1000) {
  return Math.floor(Math.random() * Math.floor(max));
}

function stringifyMeta(item, contentKey) {
  return yaml.safeDump(omit(item, contentKey), {
    sortKeys: true
  });
}

function parseTmpFile(file, contentKey) {
  const [_empty, meta, content] = file.split("---");
  const output = yaml.safeLoad(meta);
  if (contentKey) {
    return { ...output, [contentKey]: content.replace(/^\s+|\s+$/g, "") };
  }
  return output;
}

type EditOptions<Item> = {
  fetch: Function,
  save: Function,
  getContentKey?: (item: Item) => string
};

export async function edit<Item>({
  fetch,
  save,
  getContentKey
}: EditOptions<Item>) {
  await mkdirpAsync(tmpFolder);
  const tmpPath = path.join(tmpFolder, randomInt().toString() + ".yml");

  const item = await fetch();
  const contentKey = getContentKey ? getContentKey(item) : null;
  await writeFile(
    tmpPath,
    `---\n${stringifyMeta(item, contentKey)}\n---${
      contentKey ? `\n${item[contentKey] || ""}` : ""
    }`
  );

  const editor = spawn(getEditor(), [tmpPath], { stdio: "inherit" });

  return new Promise((resolve, reject) => {
    editor.on("exit", async () => {
      try {
        const newItem = parseTmpFile(
          (await readFile(tmpPath)).toString(),
          contentKey
        );
        const response = await save(newItem);
        await unlink(tmpPath);
        resolve(response);
      } catch (error) {
        error.pathToFile = tmpPath;
        reject(error);
      }
    });
  });
}
