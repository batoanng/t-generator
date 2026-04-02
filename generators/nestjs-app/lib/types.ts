import type { TemplateContext } from '../../lib/types';

export interface InstalledServerFeatures {
  graphql: boolean;
  queue: boolean;
  cache: boolean;
  llm: boolean;
}

export type ServerTemplateContext = TemplateContext;

export const SERVER_SHARED_SCAFFOLD_PATHS = [
  '.env.example',
  'src/types/config.ts',
  'src/modules/common/provider/config.provider.ts',
  'src/modules/app.module.ts',
  'src/server.ts',
] as const;
