import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import yoAssert from "yeoman-assert";

import {
  addGeneratorPath,
  createYeomanTestHelpers,
  readJson,
  scaffoldBaseApp,
} from "./helpers";

import type { PackageJson } from "../generators/lib/types";

test("adds the bff feature to an existing generated base app", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("starter-app");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["bff"])
    .run();

  const packageJson = readJson<PackageJson>(path.join(projectRoot, "package.json"));
  const serverPackageJson = readJson<PackageJson>(
    path.join(projectRoot, "server/package.json"),
  );

  yoAssert.file([
    path.join(projectRoot, "server/package.json"),
    path.join(projectRoot, "server/server.js"),
    path.join(projectRoot, "server/README.md"),
    path.join(projectRoot, "server/.gitignore"),
    path.join(projectRoot, "server/.env.development"),
    path.join(projectRoot, "server/.env.production"),
  ]);

  assert.equal(packageJson.scripts?.dev, "vite");
  assert.equal(packageJson.scripts?.["dev:client"], "vite");
  assert.equal(
    packageJson.scripts?.["dev:server"],
    "npm --prefix server run start",
  );
  assert.equal(
    packageJson.scripts?.["dev:full"],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
  assert.equal(packageJson.devDependencies?.concurrently, "^9.0.1");

  assert.equal(serverPackageJson.name, "starter-app-server");
  assert.deepEqual(Object.keys(serverPackageJson.dependencies || {}).sort(), [
    "@batoanng/frontend-server",
    "cors",
    "dotenv",
    "express",
    "http-proxy-middleware",
    "url-parse",
  ]);

  yoAssert.fileContent(
    path.join(projectRoot, "server/server.js"),
    'const clientBuildPath = join(executionPath, "../dist");',
  );
  yoAssert.fileContent(
    path.join(projectRoot, "server/README.md"),
    "This Backend for Frontend (BFF) sits between the React app and the upstream API.",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "server/README.md"),
    "npm run dev:full",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "server/.env.development"),
    "CORS_ORIGIN=http://localhost:5173",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "server/.gitignore"),
    "/.env.production",
  );
});

test("prompts for the feature name when add is run without arguments", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("prompted-app");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: "bff" })
    .run();

  yoAssert.file([
    path.join(projectRoot, "server/package.json"),
    path.join(projectRoot, "server/server.js"),
  ]);
});

test("fails when bff is generated outside the t-generator base app", async () => {
  let tmpDir = "";
  const helpers = await createYeomanTestHelpers();

  await assert.rejects(
    async () =>
      helpers
        .run(addGeneratorPath)
        .inTmpDir((directory) => {
          tmpDir = directory;
          fs.writeFileSync(
            path.join(directory, "package.json"),
            JSON.stringify(
              {
                name: "custom-app",
                scripts: {
                  dev: "vite",
                  build: "vite build",
                },
              },
              null,
              2,
            ),
          );
        })
        .withArguments(["bff"])
        .run(),
    /BFF can only be generated inside a t-generator base app/,
  );

  assert.equal(fs.existsSync(path.join(tmpDir, "server")), false);
});

test("fails when bff generation would overwrite existing bff wiring", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("repeatable-app");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["bff"])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(["bff"])
      .run(),
    /already exists/,
  );
});
