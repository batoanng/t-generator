import type { TemplateContext } from '../../lib/types';

export interface InstalledServerFeatures {
  graphql: boolean;
  queue: boolean;
  webPush: boolean;
  llm: boolean;
}

export type ServerTemplateContext = TemplateContext;

export const SERVER_SHARED_SCAFFOLD_PATHS = [
  'package.json',
  '.env.example',
  'src/types/config.ts',
  'src/modules/common/provider/config.provider.ts',
  'src/modules/app.module.ts',
] as const;
