const fs = require("node:fs");

const BFF_MANAGED_SCRIPTS = ["dev:client", "dev:server", "dev:full"];

module.exports = {
  name: "bff",
  label: "BFF",
  validate(generator) {
    if (fs.existsSync(generator.destinationPath("server"))) {
      throw new Error(
        'BFF generation aborted because "server/" already exists.',
      );
    }

    const existingManagedScripts = BFF_MANAGED_SCRIPTS.filter(
      (scriptName) =>
        typeof generator.rootPackageJson.scripts?.[scriptName] === "string",
    );

    if (existingManagedScripts.length > 0) {
      throw new Error(
        `BFF generation aborted because package.json already defines: ${existingManagedScripts.join(", ")}.`,
      );
    }
  },
  write(generator) {
    const templateFiles = [
      ["bff/server/package.json.ejs", "server/package.json"],
      ["bff/server/server.js.ejs", "server/server.js"],
      ["bff/server/README.md.ejs", "server/README.md"],
      ["bff/server/_gitignore.ejs", "server/.gitignore"],
      ["bff/server/_env.development.ejs", "server/.env.development"],
      ["bff/server/_env.production.ejs", "server/.env.production"],
    ];

    templateFiles.forEach(([from, to]) => {
      generator.fs.copyTpl(
        generator.templatePath(from),
        generator.destinationPath(to),
        generator.templateContext,
      );
    });

    const updatedPackageJson = {
      ...generator.rootPackageJson,
      scripts: {
        ...generator.rootPackageJson.scripts,
        "dev:client": generator.rootPackageJson.scripts.dev,
        "dev:server": "npm --prefix server run start",
        "dev:full":
          'concurrently -k -n client,server "npm run dev:client" "npm run dev:server"',
      },
      devDependencies: {
        ...generator.rootPackageJson.devDependencies,
        concurrently:
          generator.rootPackageJson.devDependencies?.concurrently || "^9.0.1",
      },
    };

    generator.fs.write(
      generator.packageJsonPath,
      `${JSON.stringify(updatedPackageJson, null, 2)}\n`,
    );
  },
  end(generator) {
    generator.log('BFF feature scaffolded in "./server".');
    generator.log("Next steps:");
    generator.log("  npm install");
    generator.log("  npm --prefix server install");
    generator.log("  npm run dev:full");
  },
};
