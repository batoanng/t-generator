const path = require("node:path");

const APP_TEMPLATE_ROOT = path.join(__dirname, "../../app/templates");
const ADD_TEMPLATE_ROOT = path.join(__dirname, "../templates");
const REQUIRED_BASE_SCRIPTS = ["dev", "build", "preview", "lint", "test"];
const REQUIRED_BASE_FILES = [
  "src/app/entrypoint/App.tsx",
  "src/app/providers/AppProviders.tsx",
  "src/app/routes/AppRouter.tsx",
  "src/shared/config/env.ts",
];
const FEATURE_STATES = {
  base: "base",
  auth: "auth",
  uiLibrary: "ui-library",
  uiLibraryAuth: "ui-library-auth",
};

module.exports = {
  ADD_TEMPLATE_ROOT,
  APP_TEMPLATE_ROOT,
  FEATURE_STATES,
  REQUIRED_BASE_FILES,
  REQUIRED_BASE_SCRIPTS,
};
