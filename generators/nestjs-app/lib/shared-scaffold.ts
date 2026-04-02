import type { PackageJson } from '../../lib/types';
import type {
  InstalledServerFeatures,
  ServerTemplateContext,
} from './types';

interface ConfigField {
  name: string;
  type: string;
  schema: string;
  sample: string;
  optional?: boolean;
}

const BASE_DEPENDENCIES: Record<string, string> = {
  '@fastify/cors': '^11.2.0',
  '@nestjs/common': '^11.1.6',
  '@nestjs/core': '^11.1.6',
  '@nestjs/passport': '^11.0.5',
  '@nestjs/platform-fastify': '^11.1.6',
  '@nestjs/swagger': '^11.2.0',
  '@nestjs/terminus': '^11.0.0',
  '@prisma/client': '^6.16.2',
  'fastify': '^5.6.0',
  'jwks-rsa': '^3.2.0',
  'passport': '^0.7.0',
  'passport-jwt': '^4.0.1',
  'reflect-metadata': '^0.2.2',
  'rxjs': '^7.8.2',
  'zod': '^4.3.6',
};

const BASE_DEV_DEPENDENCIES: Record<string, string> = {
  '@nestjs/testing': '^11.1.6',
  '@trivago/prettier-plugin-sort-imports': '^6.0.2',
  '@types/node': '^24.9.0',
  '@types/passport-jwt': '^4.0.1',
  '@typescript-eslint/eslint-plugin': '^8.46.2',
  '@typescript-eslint/parser': '^8.46.2',
  'env-cmd': '^11.0.0',
  'eslint': '^8.57.1',
  'nodemon': '^3.1.10',
  'prettier': '^3.8.1',
  'prisma': '^6.15.0',
  'ts-node': '^10.9.2',
  'tsc-alias': '^1.8.16',
  'tsconfig-paths': '^4.2.0',
  'typescript': '^5.9.3',
  'vitest': '^3',
};

const GRAPHQL_DEPENDENCIES: Record<string, string> = {
  '@apollo/server': '^4.12.2',
  '@nestjs/apollo': '^13.0.3',
  '@nestjs/graphql': '^13.1.0',
  graphql: '^16.11.0',
};

const QUEUE_DEPENDENCIES: Record<string, string> = {
  '@nestjs/bullmq': '^11.0.3',
  bullmq: '^5.58.9',
};

const WEB_PUSH_DEPENDENCIES: Record<string, string> = {
  '@keyv/redis': '^5.1.1',
  '@nestjs/cache-manager': '^3.0.1',
  'cache-manager': '^7.2.2',
  'web-push': '^3.6.7',
};

const WEB_PUSH_DEV_DEPENDENCIES: Record<string, string> = {
  '@types/web-push': '^3.6.4',
};

const LLM_DEPENDENCIES: Record<string, string> = {
  '@langchain/core': '^0.3.68',
  '@langchain/deepseek': '^0.1.0',
  '@langchain/openai': '^0.6.9',
  openai: '^4.62.1',
};

const BASE_CONFIG_FIELDS: ConfigField[] = [
  {
    name: 'API_PORT',
    type: 'number',
    schema: 'z.coerce.number().int().positive()',
    sample: '3001',
  },
  {
    name: 'API_VERSION',
    type: 'number',
    schema: 'z.coerce.number().int().positive()',
    sample: '1',
  },
  {
    name: 'SWAGGER_ENABLE',
    type: 'boolean',
    schema: 'booleanFlagSchema',
    sample: '1',
  },
  {
    name: 'DATABASE_URL',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'mongodb://localhost:27017/app-db',
  },
  {
    name: 'HEALTH_TOKEN',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'replace-me',
  },
  {
    name: 'OIDC_AUTHORITY',
    type: 'string',
    schema: 'oidcAuthoritySchema',
    sample: 'https://example.auth0.com',
  },
  {
    name: 'OIDC_AUDIENCE',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'https://api.example.com',
  },
  {
    name: 'CORS_ORIGIN',
    type: 'string[]',
    schema: 'corsOriginSchema',
    sample: 'http://localhost:5173',
    optional: true,
  },
];

const REDIS_CONFIG_FIELDS: ConfigField[] = [
  {
    name: 'REDIS_HOST',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'localhost',
  },
  {
    name: 'REDIS_PORT',
    type: 'number',
    schema: 'z.coerce.number().int().positive()',
    sample: '6379',
  },
  {
    name: 'REDIS_USERNAME',
    type: 'string',
    schema: 'optionalStringSchema',
    sample: 'default',
    optional: true,
  },
  {
    name: 'REDIS_PASSWORD',
    type: 'string',
    schema: 'optionalStringSchema',
    sample: 'change-me',
    optional: true,
  },
];

const WEB_PUSH_CONFIG_FIELDS: ConfigField[] = [
  {
    name: 'WEB_PUSH_CONTACT',
    type: 'string',
    schema: 'urlStringSchema',
    sample: 'mailto:hello@example.com',
  },
  {
    name: 'WEB_PUSH_PUBLIC_KEY',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'public-key',
  },
  {
    name: 'WEB_PUSH_PRIVATE_KEY',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'private-key',
  },
];

const LLM_CONFIG_FIELDS: ConfigField[] = [
  {
    name: 'OPENAI_API_KEY',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'sk-proj-...',
  },
  {
    name: 'OPENAI_MODEL',
    type: 'string',
    schema: 'z.string().min(1)',
    sample: 'gpt-5.1',
  },
  {
    name: 'DEEPSEEK_API_KEY',
    type: 'string',
    schema: 'optionalStringSchema',
    sample: 'deepseek-key',
    optional: true,
  },
];

function sortRecord(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function mergeRecords(
  ...records: Array<Record<string, string>>
): Record<string, string> {
  const mergedRecord: Record<string, string> = {};

  records.forEach((record) => {
    Object.entries(record).forEach(([key, value]) => {
      mergedRecord[key] = value;
    });
  });

  return sortRecord(mergedRecord);
}

function getConfigFields(
  features: InstalledServerFeatures,
): ConfigField[] {
  const fields = [...BASE_CONFIG_FIELDS];

  if (features.queue || features.webPush) {
    fields.push(...REDIS_CONFIG_FIELDS);
  }

  if (features.webPush) {
    fields.push(...WEB_PUSH_CONFIG_FIELDS);
  }

  if (features.llm) {
    fields.push(...LLM_CONFIG_FIELDS);
  }

  return fields;
}

function renderPackageJson(
  context: ServerTemplateContext,
  features: InstalledServerFeatures,
): string {
  const dependencies = [BASE_DEPENDENCIES];
  const devDependencies = [BASE_DEV_DEPENDENCIES];

  if (features.graphql) {
    dependencies.push(GRAPHQL_DEPENDENCIES);
  }

  if (features.queue) {
    dependencies.push(QUEUE_DEPENDENCIES);
  }

  if (features.webPush) {
    dependencies.push(WEB_PUSH_DEPENDENCIES);
    devDependencies.push(WEB_PUSH_DEV_DEPENDENCIES);
  }

  if (features.llm) {
    dependencies.push(LLM_DEPENDENCIES);
  }

  const packageJson: PackageJson = {
    name: context.appName,
    version: '0.1.0',
    private: true,
    description: `${context.appDisplayName} NestJS server`,
    type: 'commonjs',
    main: 'dist/server.js',
    scripts: {
      postinstall: 'prisma generate',
      start: 'node dist/server.js',
      dev: 'env-cmd -f .env nodemon',
      build: 'tsc -p tsconfig.json && tsc-alias -p tsconfig.json',
      test: 'vitest run',
      lint: "eslint -c .eslintrc.cjs --ext .ts 'src/**/*.ts'",
      'prisma:generate': 'prisma generate',
      'prisma:push': 'prisma db push',
    },
    dependencies: mergeRecords(...dependencies),
    devDependencies: mergeRecords(...devDependencies),
  };

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function renderEnvExample(
  context: ServerTemplateContext,
  features: InstalledServerFeatures,
): string {
  const fields = getConfigFields(features).map((field) => {
    if (field.name === 'DATABASE_URL') {
      return `${field.name}=mongodb://localhost:27017/${context.appName}`;
    }

    return `${field.name}=${field.sample}`;
  });

  return `${fields.join('\n')}\n`;
}

function renderConfigType(features: InstalledServerFeatures): string {
  const lines = [
    "import { z } from 'zod';",
    '',
    'function trimString(value: unknown): unknown {',
    "  return typeof value === 'string' ? value.trim() : value;",
    '}',
    '',
    'function toOptionalTrimmedString(value: unknown): unknown {',
    "  if (typeof value !== 'string') {",
    '    return value;',
    '  }',
    '',
    '  const trimmed = value.trim();',
    '',
    '  return trimmed.length > 0 ? trimmed : undefined;',
    '}',
    '',
    'function toBooleanFlag(value: unknown): unknown {',
    "  if (typeof value === 'boolean') {",
    '    return value;',
    '  }',
    '',
    "  if (typeof value === 'number') {",
    '    return value !== 0;',
    '  }',
    '',
    "  if (typeof value === 'string') {",
    "    const normalized = value.trim().toLowerCase();",
    '',
    "    if (normalized === '1' || normalized === 'true') {",
    '      return true;',
    '    }',
    '',
    "    if (normalized === '0' || normalized === 'false') {",
    '      return false;',
    '    }',
    '  }',
    '',
    '  return value;',
    '}',
    '',
    'function toOriginList(value: unknown): unknown {',
    "  if (typeof value !== 'string') {",
    '    return value;',
    '  }',
    '',
    '  const origins = value',
    "    .split(',')",
    '    .map((entry) => entry.trim())',
    '    .filter(Boolean);',
    '',
    '  return origins.length > 0 ? origins : undefined;',
    '}',
    '',
    'function stripTrailingSlash(value: string): string {',
    "  return value.replace(/\\/+$/, '');",
    '}',
    '',
    'const stringSchema = z.preprocess(trimString, z.string().min(1));',
    'const optionalStringSchema = z.preprocess(',
    '  toOptionalTrimmedString,',
    '  z.string().min(1).optional(),',
    ');',
    'const urlStringSchema = z.preprocess(trimString, z.string().url());',
    'const booleanFlagSchema = z.preprocess(toBooleanFlag, z.boolean());',
    'const corsOriginSchema = z.preprocess(',
    '  toOriginList,',
    '  z.array(z.string().min(1)).optional(),',
    ');',
    'const oidcAuthoritySchema = urlStringSchema.transform(stripTrailingSlash);',
    '',
    'export const configSchema = z.object({',
  ];

  getConfigFields(features).forEach((field) => {
    lines.push(`  ${field.name}: ${field.schema},`);
  });

  lines.push('});');
  lines.push('');
  lines.push('export type Config = z.infer<typeof configSchema>;');
  lines.push('');
  lines.push('let cachedConfig: Config | undefined;');
  lines.push('');
  lines.push('function formatConfigError(error: z.ZodError): string {');
  lines.push('  const fieldErrors = error.flatten().fieldErrors;');
  lines.push(
    "  return `Configuration not valid:\\n${JSON.stringify(fieldErrors, null, 2)}`;",
  );
  lines.push('}');
  lines.push('');
  lines.push('export function getConfig(): Config {');
  lines.push('  if (cachedConfig) {');
  lines.push('    return cachedConfig;');
  lines.push('  }');
  lines.push('');
  lines.push('  const result = configSchema.safeParse(process.env);');
  lines.push('');
  lines.push('  if (!result.success) {');
  lines.push('    throw new Error(formatConfigError(result.error));');
  lines.push('  }');
  lines.push('');
  lines.push('  cachedConfig = Object.freeze(result.data);');
  lines.push('');
  lines.push('  return cachedConfig;');
  lines.push('}');
  lines.push('');
  lines.push('export const config = getConfig();');

  return `${lines.join('\n')}\n`;
}

function renderConfigProvider(_features: InstalledServerFeatures): string {
  const lines = [
    "import { getConfig } from '../../../types/config';",
    "import { Service } from '../../tokens';",
    '',
    'export const configProvider = {',
    '  provide: Service.CONFIG,',
    '  useFactory: getConfig,',
  ];

  lines.push('};');

  return `${lines.join('\n')}\n`;
}

function renderGraphqlImportBlock(): string[] {
  return [
    "import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';",
    "import { GraphQLModule } from '@nestjs/graphql';",
  ];
}

function renderQueueImportBlock(): string[] {
  return ["import { BullModule } from '@nestjs/bullmq';"];
}

function renderWebPushImportBlock(): string[] {
  return [
    "import { createKeyv } from '@keyv/redis';",
    "import { CacheModule } from '@nestjs/cache-manager';",
  ];
}

function renderAppModule(features: InstalledServerFeatures): string {
  const imports = ["import { Module } from '@nestjs/common';"];

  if (features.graphql) {
    imports.push(...renderGraphqlImportBlock());
  }

  if (features.queue) {
    imports.push(...renderQueueImportBlock());
  }

  if (features.webPush) {
    imports.push(...renderWebPushImportBlock());
  }

  imports.push(
    "import { AuthModule } from './auth/auth.module';",
    "import { CommonModule } from './common';",
  );

  if (features.queue || features.webPush) {
    imports.push("import { config } from '../types/config';");
  }

  const lines = [...imports, ''];

  if (features.webPush) {
    lines.push('function toRedisUrl(): string {');
    lines.push('  const username = config.REDIS_USERNAME;');
    lines.push('  const password = config.REDIS_PASSWORD;');
    lines.push(
      '  const auth = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : \'\';',
    );
    lines.push('');
    lines.push(
      '  return `redis://${auth}${config.REDIS_HOST}:${config.REDIS_PORT}`;',
    );
    lines.push('}');
    lines.push('');
  }

  lines.push('@Module({');
  lines.push('  imports: [');
  lines.push('    CommonModule,');
  lines.push('    AuthModule,');

  if (features.graphql) {
    lines.push('    GraphQLModule.forRoot<ApolloDriverConfig>({');
    lines.push('      driver: ApolloDriver,');
    lines.push('      autoSchemaFile: true,');
    lines.push("      path: '/api/graphql',");
    lines.push('      context: (req: { raw?: { headers?: Record<string, unknown> } }) => {');
    lines.push('        const raw = req?.raw ?? req;');
    lines.push('        const headers = raw?.headers ?? {};');
    lines.push('');
    lines.push('        return {');
    lines.push('          req: raw,');
    lines.push('          headers,');
    lines.push("          guestUserId: headers['x-guest-user-id'] ?? null,");
    lines.push('        };');
    lines.push('      },');
    lines.push('    }),');
  }

  if (features.queue) {
    lines.push('    BullModule.forRoot({');
    lines.push('      connection: {');
    lines.push('        host: config.REDIS_HOST,');
    lines.push('        port: config.REDIS_PORT,');
    lines.push('        username: config.REDIS_USERNAME,');
    lines.push('        password: config.REDIS_PASSWORD,');
    lines.push('      },');
    lines.push('    }),');
  }

  if (features.webPush) {
    lines.push('    CacheModule.registerAsync({');
    lines.push('      isGlobal: true,');
    lines.push('      useFactory: async () => {');
    lines.push('        const keyv = createKeyv(toRedisUrl());');
    lines.push('');
    lines.push('        return {');
    lines.push('          stores: [keyv],');
    lines.push('        };');
    lines.push('      },');
    lines.push('    }),');
  }

  lines.push('  ],');
  lines.push('})');
  lines.push('export class ApplicationModule {}');

  return `${lines.join('\n')}\n`;
}

export function buildServerSharedScaffold(
  context: ServerTemplateContext,
  features: InstalledServerFeatures,
): Record<string, string> {
  return {
    'package.json': renderPackageJson(context, features),
    '.env.example': renderEnvExample(context, features),
    'src/types/config.ts': renderConfigType(features),
    'src/modules/common/provider/config.provider.ts': renderConfigProvider(
      features,
    ),
    'src/modules/app.module.ts': renderAppModule(features),
  };
}
