const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");
const yoAssert = require("yeoman-assert");

const generatorPath = path.join(__dirname, "../generators/app");
const blockedDependencies = [
  "@apollo/client",
  "@mui/material",
  "@reduxjs/toolkit",
  "@tanstack/react-query",
  "vite-plugin-pwa",
  "notistack",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function createHelpers() {
  const yeomanTest = await import("yeoman-test");

  return yeomanTest.createHelpers();
}

test("generates the base app with the expected project structure", async () => {
  let tmpDir;
  const helpers = await createHelpers();

  await helpers
    .run(generatorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withArguments(["starter-app"]);

  const projectRoot = path.join(tmpDir, "starter-app");
  const packageJson = readJson(path.join(projectRoot, "package.json"));

  yoAssert.file([
    path.join(projectRoot, "package.json"),
    path.join(projectRoot, "index.html"),
    path.join(projectRoot, "tsconfig.json"),
    path.join(projectRoot, "vite.config.ts"),
    path.join(projectRoot, "vitest.config.ts"),
    path.join(projectRoot, "eslint.config.js"),
    path.join(projectRoot, ".prettierrc.json"),
    path.join(projectRoot, ".prettierignore"),
    path.join(projectRoot, ".env.example"),
    path.join(projectRoot, "src/main.tsx"),
    path.join(projectRoot, "src/app/entrypoint/App.tsx"),
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
    path.join(projectRoot, "src/app/routes/AppRouter.tsx"),
    path.join(projectRoot, "src/app/styles/global.css"),
    path.join(projectRoot, "src/pages/home/index.ts"),
    path.join(projectRoot, "src/pages/home/ui/HomePage.tsx"),
    path.join(projectRoot, "src/pages/home/ui/HomePage.test.tsx"),
    path.join(projectRoot, "src/shared/config/env.ts"),
    path.join(projectRoot, "src/test/setup.ts"),
  ]);

  assert.deepEqual(Object.keys(packageJson.scripts), [
    "dev",
    "build",
    "preview",
    "lint",
    "test",
  ]);

  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    "react",
    "react-dom",
    "react-router-dom",
  ]);

  blockedDependencies.forEach((dependencyName) => {
    assert.equal(packageJson.dependencies[dependencyName], undefined);
    assert.equal(packageJson.devDependencies[dependencyName], undefined);
  });

  [
    "src/widgets",
    "src/features",
    "src/entities",
    "src/shared/ui",
    "src/shared/api",
    "src/shared/lib",
  ].forEach((directory) => {
    assert.equal(
      fs.statSync(path.join(projectRoot, directory)).isDirectory(),
      true,
      `${directory} should exist`,
    );
  });

  assert.equal(fs.existsSync(path.join(projectRoot, "server")), false);
  assert.equal(
    fs.existsSync(path.join(projectRoot, "src/features/auth")),
    false,
  );

  yoAssert.fileContent(
    path.join(projectRoot, "src/shared/config/env.ts"),
    "appName: import.meta.env.VITE_APP_NAME?.trim() || fallbackAppName",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/app/routes/AppRouter.tsx"),
    '<Route path="/" element={<HomePage />} />',
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/pages/home/ui/HomePage.test.tsx"),
    "render(<HomePage />);",
  );
});

test("prompts for the app name when one is not provided", async () => {
  let tmpDir;
  const helpers = await createHelpers();

  await helpers
    .run(generatorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withPrompts({ appName: "Prompt Driven App" });

  const projectRoot = path.join(tmpDir, "prompt-driven-app");

  yoAssert.file([
    path.join(projectRoot, "package.json"),
    path.join(projectRoot, "src/pages/home/ui/HomePage.tsx"),
  ]);
  yoAssert.fileContent(
    path.join(projectRoot, ".env.example"),
    "VITE_APP_NAME=Prompt Driven App",
  );
});

test("fails when the target directory already exists and is not empty", async () => {
  let tmpDir;
  const helpers = await createHelpers();

  await assert.rejects(
    helpers
      .run(generatorPath)
      .inTmpDir((directory) => {
        tmpDir = directory;
        const targetDirectory = path.join(directory, "existing-app");

        fs.mkdirSync(targetDirectory, { recursive: true });
        fs.writeFileSync(path.join(targetDirectory, "keep.txt"), "existing");
      })
      .withArguments(["existing-app"]),
    /already exists and is not empty/,
  );

  assert.equal(
    fs.existsSync(path.join(tmpDir, "existing-app", "keep.txt")),
    true,
  );
});
