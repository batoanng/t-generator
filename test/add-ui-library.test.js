const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");
const yoAssert = require("yeoman-assert");

const baseGeneratorPath = path.join(__dirname, "../generators/app");
const addGeneratorPath = path.join(__dirname, "../generators/add");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function createHelpers() {
  const yeomanTest = await import("yeoman-test");

  return yeomanTest.createHelpers();
}

async function scaffoldBaseApp(appName) {
  let tmpDir;
  const helpers = await createHelpers();

  const runResult = await helpers
    .run(baseGeneratorPath)
    .inTmpDir((directory) => {
      tmpDir = directory;
    })
    .withArguments([appName]);

  return {
    runResult,
    projectRoot: path.join(tmpDir, appName),
    tmpDir,
  };
}

test("adds the ui-library feature to an existing generated base app", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("starter-app");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false })
    .withArguments(["ui-library"])
    .run();

  const packageJson = readJson(path.join(projectRoot, "package.json"));

  yoAssert.file([
    path.join(projectRoot, "src/widgets/ui-library-showcase/index.ts"),
    path.join(
      projectRoot,
      "src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx",
    ),
  ]);

  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.dependencies["@batoanng/mui-components"], "^3.0.30");
  assert.equal(packageJson.dependencies["@emotion/react"], "^11.13.5");
  assert.equal(packageJson.dependencies["@emotion/styled"], "^11.13.5");
  assert.equal(packageJson.dependencies["@mui/icons-material"], "6.1.8");
  assert.equal(packageJson.dependencies["@mui/material"], "6.1.8");
  assert.equal(packageJson.scripts["dev:full"], undefined);
  assert.equal(packageJson.devDependencies?.concurrently, undefined);

  yoAssert.fileContent(
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
    "createDefaultTheme({})",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
    "<CssBaseline />",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/pages/home/ui/HomePage.tsx"),
    "Material UI and",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/pages/home/ui/HomePage.tsx"),
    "@batoanng/mui-components",
  );
  yoAssert.fileContent(
    path.join(
      projectRoot,
      "src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx",
    ),
    "Launch feature work",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/pages/home/ui/HomePage.test.tsx"),
    "<AppProviders>",
  );
});

test("prompt-based add can select the ui-library feature", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("prompted-ui");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false })
    .withPrompts({ featureName: "ui-library" })
    .run();

  yoAssert.file([
    path.join(projectRoot, "src/widgets/ui-library-showcase/index.ts"),
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
  ]);
});

test("fails when ui-library is generated outside the t-generator base app", async () => {
  let tmpDir;
  const helpers = await createHelpers();

  await assert.rejects(
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
                preview: "vite preview",
                lint: "eslint src",
                test: "vitest run",
              },
            },
            null,
            2,
          ),
        );
      })
      .withArguments(["ui-library"]),
    /UI library can only be generated inside a t-generator base app/,
  );

  assert.equal(
    fs.existsSync(path.join(tmpDir, "src/widgets/ui-library-showcase")),
    false,
  );
});

test("fails when ui-library generation would overwrite existing ui-library wiring", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("repeatable-ui");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false })
    .withArguments(["ui-library"])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false })
      .withArguments(["ui-library"])
      .run(),
    /@batoanng\/mui-components/,
  );
});

test("fails clearly for unknown feature names", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("unknown-feature-app");

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false })
      .withArguments(["theme"])
      .run(),
    /Supported features: bff, ui-library/,
  );
});
