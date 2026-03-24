const fs = require("node:fs");
const path = require("node:path");
const { ADD_TEMPLATE_ROOT, APP_TEMPLATE_ROOT } = require("./constants");

function appManagedFile(filePath, templatePath) {
  return {
    path: filePath,
    templatePath,
    templateSource: "app",
  };
}

function addManagedFile(filePath, templatePath) {
  return {
    path: filePath,
    templatePath,
    templateSource: "add",
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeFeatureName(input) {
  return String(input || "").trim().toLowerCase();
}

function toDisplayName(appName) {
  return String(appName || "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n/g, "\n");
}

function readAppDisplayName(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const match = normalizeLineEndings(fs.readFileSync(filePath, "utf8")).match(
    /^VITE_APP_NAME=(.+)$/m,
  );
  const value = match?.[1]?.trim();

  return value || fallback;
}

function renderTemplateContent(template, context) {
  return String(template)
    .replace(/<%=\s*appName\s*%>/g, context.appName)
    .replace(/<%=\s*appDisplayName\s*%>/g, context.appDisplayName);
}

function renderTemplateFile(filePath, context) {
  return renderTemplateContent(fs.readFileSync(filePath, "utf8"), context);
}

function hasPackageDependency(packageJson, dependencyName) {
  return (
    typeof packageJson.dependencies?.[dependencyName] === "string" ||
    typeof packageJson.devDependencies?.[dependencyName] === "string"
  );
}

function resolveTemplateAbsolutePath(templateDefinition) {
  const templateRoot =
    templateDefinition.templateSource === "app" ? APP_TEMPLATE_ROOT : ADD_TEMPLATE_ROOT;

  return path.join(templateRoot, templateDefinition.templatePath);
}

module.exports = {
  addManagedFile,
  appManagedFile,
  hasPackageDependency,
  normalizeFeatureName,
  normalizeLineEndings,
  readAppDisplayName,
  readJson,
  renderTemplateFile,
  resolveTemplateAbsolutePath,
  toDisplayName,
};
