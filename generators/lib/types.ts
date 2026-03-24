export interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  type?: string;
  main?: string;
  description?: string;
  files?: string[];
  keywords?: string[];
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface TemplateContext {
  [key: string]: string;
  appName: string;
  appDisplayName: string;
}

export type TemplateSource = "app" | "add";

export interface ManagedFile {
  path: string;
  templatePath: string;
  templateSource: TemplateSource;
}
