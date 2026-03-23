const fs = require("node:fs");
const path = require("node:path");
const GeneratorModule = require("yeoman-generator");

const Generator = GeneratorModule.default || GeneratorModule;

function normalizeAppName(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDisplayName(input, fallback) {
  const trimmed = String(input || "").trim();

  if (trimmed) {
    return trimmed;
  }

  return fallback
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

module.exports = class AppGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("appName", {
      type: String,
      required: false,
      description: "Name of the application directory to generate.",
    });

    this.rawAppName = this.options.appName;
  }

  async prompting() {
    if (this.options.appName) {
      return;
    }

    const answers = await this.prompt([
      {
        type: "input",
        name: "appName",
        message: "Application name",
        default: "my-app",
        validate: (value) => {
          if (!normalizeAppName(value)) {
            return "Enter a valid application name.";
          }

          return true;
        },
      },
    ]);

    this.rawAppName = answers.appName;
    this.options.appName = answers.appName;
  }

  configuring() {
    const providedName = this.rawAppName || this.options.appName;
    const normalizedAppName = normalizeAppName(providedName);

    if (!normalizedAppName) {
      throw new Error("A valid application name is required.");
    }

    const projectRoot = path.resolve(this.destinationRoot(), normalizedAppName);

    if (fs.existsSync(projectRoot) && fs.readdirSync(projectRoot).length > 0) {
      throw new Error(
        `Target directory "${normalizedAppName}" already exists and is not empty.`,
      );
    }

    this.appName = normalizedAppName;
    this.displayName = toDisplayName(providedName, normalizedAppName);
    this.projectRoot = projectRoot;
    this.destinationRoot(projectRoot);
  }

  writing() {
    const templateContext = {
      appName: this.appName,
      appDisplayName: this.displayName,
    };

    const templateFiles = [
      ["package.json.ejs", "package.json"],
      ["README.md.ejs", "README.md"],
      ["index.html.ejs", "index.html"],
      ["tsconfig.json.ejs", "tsconfig.json"],
      ["vite.config.ts.ejs", "vite.config.ts"],
      ["vitest.config.ts.ejs", "vitest.config.ts"],
      ["eslint.config.js.ejs", "eslint.config.js"],
      ["_gitignore.ejs", ".gitignore"],
      ["_prettierrc.json.ejs", ".prettierrc.json"],
      ["_prettierignore.ejs", ".prettierignore"],
      ["_env.example.ejs", ".env.example"],
      ["src/main.tsx.ejs", "src/main.tsx"],
      ["src/vite-env.d.ts.ejs", "src/vite-env.d.ts"],
      ["src/test/setup.ts.ejs", "src/test/setup.ts"],
      ["src/app/entrypoint/App.tsx.ejs", "src/app/entrypoint/App.tsx"],
      ["src/app/entrypoint/index.ts.ejs", "src/app/entrypoint/index.ts"],
      [
        "src/app/providers/AppProviders.tsx.ejs",
        "src/app/providers/AppProviders.tsx",
      ],
      ["src/app/providers/index.ts.ejs", "src/app/providers/index.ts"],
      ["src/app/routes/AppRouter.tsx.ejs", "src/app/routes/AppRouter.tsx"],
      ["src/app/routes/index.ts.ejs", "src/app/routes/index.ts"],
      ["src/app/styles/global.css.ejs", "src/app/styles/global.css"],
      ["src/pages/home/index.ts.ejs", "src/pages/home/index.ts"],
      ["src/pages/home/ui/HomePage.tsx.ejs", "src/pages/home/ui/HomePage.tsx"],
      [
        "src/pages/home/ui/HomePage.test.tsx.ejs",
        "src/pages/home/ui/HomePage.test.tsx",
      ],
      ["src/shared/config/env.ts.ejs", "src/shared/config/env.ts"],
      ["src/shared/config/index.ts.ejs", "src/shared/config/index.ts"],
      ["src/shared/ui/index.ts.ejs", "src/shared/ui/index.ts"],
      ["src/shared/api/index.ts.ejs", "src/shared/api/index.ts"],
      ["src/shared/lib/index.ts.ejs", "src/shared/lib/index.ts"],
    ];

    templateFiles.forEach(([from, to]) => {
      this.fs.copyTpl(
        this.templatePath(from),
        this.destinationPath(to),
        templateContext,
      );
    });

    ["src/widgets", "src/features", "src/entities"].forEach((directory) => {
      fs.mkdirSync(this.destinationPath(directory), { recursive: true });
    });
  }

  end() {
    this.log("");
    this.log(`Base app scaffolded in ./${this.appName}`);
    this.log("Next steps:");
    this.log(`  cd ${this.appName}`);
    this.log("  npm install");
    this.log("  npm run dev");
  }
};
