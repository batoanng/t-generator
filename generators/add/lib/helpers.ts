import fs from "node:fs";
import path from "node:path";

import { ADD_TEMPLATE_ROOT, APP_TEMPLATE_ROOT } from "./constants";

import type { ManagedFile, PackageJson, TemplateContext } from "../../lib/types";

export function appManagedFile(
  filePath: string,
  templatePath: string,
): ManagedFile {
  return {
    path: filePath,
    templatePath,
    templateSource: "app",
  };
}

export function addManagedFile(
  filePath: string,
  templatePath: string,
): ManagedFile {
  return {
    path: filePath,
    templatePath,
    templateSource: "add",
  };
}

export function readJson<T = unknown>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function normalizeFeatureName(input: unknown): string {
  return (typeof input === "string" ? input : "").trim().toLowerCase();
}

export function toDisplayName(appName: unknown): string {
  return (typeof appName === "string" ? appName : "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function normalizeLineEndings(value: string | undefined): string {
  return String(value || "").replace(/\r\n/g, "\n");
}

export function readAppDisplayName(filePath: string, fallback: string): string {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const match = normalizeLineEndings(fs.readFileSync(filePath, "utf8")).match(
    /^VITE_APP_NAME=(.+)$/m,
  );
  const value = match?.[1]?.trim();

  return value || fallback;
}

function renderTemplateContent(
  template: string,
  context: TemplateContext,
): string {
  return String(template)
    .replace(/<%=\s*appName\s*%>/g, context.appName)
    .replace(/<%=\s*appDisplayName\s*%>/g, context.appDisplayName);
}

export function renderTemplateFile(
  filePath: string,
  context: TemplateContext,
): string {
  return renderTemplateContent(fs.readFileSync(filePath, "utf8"), context);
}

export function hasPackageDependency(
  packageJson: PackageJson,
  dependencyName: string,
): boolean {
  return (
    typeof packageJson.dependencies?.[dependencyName] === "string" ||
    typeof packageJson.devDependencies?.[dependencyName] === "string"
  );
}

export function resolveTemplateAbsolutePath(
  templateDefinition: ManagedFile,
): string {
  const templateRoot =
    templateDefinition.templateSource === "app"
      ? APP_TEMPLATE_ROOT
      : ADD_TEMPLATE_ROOT;

  return path.join(templateRoot, templateDefinition.templatePath);
}
