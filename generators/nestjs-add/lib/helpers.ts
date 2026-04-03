import fs from 'node:fs';

import type { PackageJson } from '../../lib/types';

export function readJson<T = unknown>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export function normalizeFeatureName(input: unknown): string {
  return (typeof input === 'string' ? input : '').trim().toLowerCase();
}

export function toDisplayName(appName: unknown): string {
  return (typeof appName === 'string' ? appName : '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function readServerDisplayName(
  packageJson: PackageJson,
  fallback: string,
): string {
  const description = typeof packageJson.description === 'string'
    ? packageJson.description.trim()
    : '';

  if (description.endsWith(' NestJS server')) {
    const label = description.slice(0, -' NestJS server'.length).trim();

    if (label) {
      return label;
    }
  }

  return fallback;
}

export function normalizeLineEndings(value: string | undefined): string {
  return String(value || '').replace(/\r\n/g, '\n');
}

export function hasPackageDependency(
  packageJson: PackageJson,
  dependencyName: string,
): boolean {
  return (
    typeof packageJson.dependencies?.[dependencyName] === 'string' ||
    typeof packageJson.devDependencies?.[dependencyName] === 'string'
  );
}

export function hasNestJsDependency(packageJson: PackageJson): boolean {
  const dependencyNames = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ];

  return dependencyNames.some((dependencyName) =>
    dependencyName.startsWith('@nestjs/'),
  );
}
