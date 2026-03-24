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

test("adds the ui-library feature to an existing generated base app", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("starter-app");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["ui-library"])
    .run();

  const packageJson = readJson<PackageJson>(path.join(projectRoot, "package.json"));

  yoAssert.file([
    path.join(projectRoot, "src/widgets/ui-library-showcase/index.ts"),
    path.join(
      projectRoot,
      "src/widgets/ui-library-showcase/ui/UiLibraryShowcase.tsx",
    ),
  ]);

  assert.equal(packageJson.scripts?.dev, "vite");
  assert.equal(packageJson.scripts?.build, "vite build");
  assert.equal(packageJson.dependencies?.["@batoanng/mui-components"], "^3.0.30");
  assert.equal(packageJson.dependencies?.["@emotion/react"], "^11.13.5");
  assert.equal(packageJson.dependencies?.["@emotion/styled"], "^11.13.5");
  assert.equal(packageJson.dependencies?.["@mui/icons-material"], "6.1.8");
  assert.equal(packageJson.dependencies?.["@mui/material"], "6.1.8");
  assert.equal(packageJson.dependencies?.["@mui/utils"], "^6.1.8");
  assert.equal(packageJson.dependencies?.["@mui/x-date-pickers"], "7.22.2");
  assert.equal(packageJson.dependencies?.["framer-motion"], "^12.23.24");
  assert.equal(packageJson.dependencies?.["react-dropzone"], "^14.2.3");
  assert.equal(packageJson.dependencies?.["react-easy-crop"], "^5.0.2");
  assert.equal(packageJson.dependencies?.["react-hook-form"], "7.44.3");
  assert.equal(packageJson.dependencies?.["react-idle-timer"], "^5.7.2");
  assert.equal(packageJson.scripts?.["dev:full"], undefined);
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
    "ui-library feature wires Material UI theme setup",
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
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withPrompts({ featureName: "ui-library" })
    .run();

  yoAssert.file([
    path.join(projectRoot, "src/widgets/ui-library-showcase/index.ts"),
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
  ]);
});

test("ui-library can be added after bff without re-running bff checks", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("stacked-features");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["bff"])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["ui-library"])
    .run();

  const packageJson = readJson<PackageJson>(path.join(projectRoot, "package.json"));

  yoAssert.file([
    path.join(projectRoot, "server/package.json"),
    path.join(projectRoot, "src/widgets/ui-library-showcase/index.ts"),
  ]);
  assert.equal(
    packageJson.scripts?.["dev:full"],
    'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
  );
  assert.equal(packageJson.dependencies?.["@batoanng/mui-components"], "^3.0.30");
});

test("ui-library can be added after auth without removing auth wiring", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("auth-first-ui");

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["auth"])
    .run();

  await runResult
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["ui-library"])
    .run();

  const packageJson = readJson<PackageJson>(path.join(projectRoot, "package.json"));

  assert.equal(packageJson.dependencies?.["@auth0/auth0-react"], "^2.8.0");
  assert.equal(packageJson.dependencies?.["@batoanng/mui-components"], "^3.0.30");

  yoAssert.fileContent(
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
    "Auth0ProviderWithNavigate",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/app/providers/AppProviders.tsx"),
    "createDefaultTheme({})",
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/app/routes/AppRouter.tsx"),
    'path="/auth"',
  );
  yoAssert.fileContent(
    path.join(projectRoot, "src/pages/home/ui/HomePage.tsx"),
    'to="/auth"',
  );
});

test("fails when ui-library is generated outside the t-generator base app", async () => {
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
        .withArguments(["ui-library"])
        .run(),
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
    .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
    .withArguments(["ui-library"])
    .run();

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(["ui-library"])
      .run(),
    /@batoanng\/mui-components/,
  );
});

test("fails clearly for unknown feature names", async () => {
  const { projectRoot, runResult } = await scaffoldBaseApp("unknown-feature-app");

  await assert.rejects(
    runResult
      .create(addGeneratorPath, { cwd: projectRoot, tmpdir: false }, undefined)
      .withArguments(["theme"])
      .run(),
    /Supported features: bff, ui-library, auth/,
  );
});
