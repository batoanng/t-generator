export const REQUIRED_BASE_SCRIPTS = [
  'postinstall',
  'start',
  'dev',
  'build',
  'test',
  'lint',
  'prisma:generate',
  'prisma:push',
];

export const REQUIRED_BASE_FILES = [
  'src/server.ts',
  'src/modules/app.module.ts',
  'src/types/config.ts',
  'src/modules/common/provider/config.provider.ts',
  'src/modules/auth/auth.module.ts',
];
