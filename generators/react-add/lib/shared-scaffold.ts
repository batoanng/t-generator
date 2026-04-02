import type { TemplateContext } from '../../lib/types';
import type { InstalledFeatures } from './types';

const SHARED_SCAFFOLD_PATHS = [
  '.env.example',
  'src/vite-env.d.ts',
  'src/shared/config/env.ts',
  'src/app/providers/AppProviders.tsx',
  'src/app/routes/AppRouter.tsx',
  'src/pages/home/ui/HomePage.tsx',
  'src/pages/home/ui/HomePage.test.tsx',
] as const;

type SharedScaffoldPath = (typeof SHARED_SCAFFOLD_PATHS)[number];

export const REACT_SHARED_DEPENDENCIES = {
  zod: '^3.24.2',
} as const;

function indent(value: string, spaces: number): string {
  const padding = ' '.repeat(spaces);

  return value
    .split('\n')
    .map((line) => (line ? `${padding}${line}` : line))
    .join('\n');
}

function renderEnvExample(
  context: TemplateContext,
  features: InstalledFeatures,
): string {
  const lines = [`VITE_APP_NAME=${context.appDisplayName}`];

  if (features.auth) {
    lines.push('VITE_AUTH0_DOMAIN=');
    lines.push('VITE_AUTH0_CLIENT_ID=');
    lines.push('VITE_AUTH0_AUDIENCE=');
  }

  if (features.redux) {
    lines.push('VITE_ENABLE_REDUX_LOGGING=false');
  }

  if (features.reactQuery) {
    lines.push('VITE_API_BASE_URL=/api');
  }

  if (features.apollo) {
    lines.push('VITE_GRAPHQL_URL=/graphql');
  }

  return `${lines.join('\n')}\n`;
}

function renderViteEnv(features: InstalledFeatures): string {
  const lines = ['/// <reference types="vite/client" />', '', 'interface ImportMetaEnv {'];

  lines.push('  readonly VITE_APP_NAME?: string;');

  if (features.auth) {
    lines.push('  readonly VITE_AUTH0_DOMAIN?: string;');
    lines.push('  readonly VITE_AUTH0_CLIENT_ID?: string;');
    lines.push('  readonly VITE_AUTH0_AUDIENCE?: string;');
  }

  if (features.redux) {
    lines.push('  readonly VITE_ENABLE_REDUX_LOGGING?: string;');
  }

  if (features.reactQuery) {
    lines.push('  readonly VITE_API_BASE_URL?: string;');
  }

  if (features.apollo) {
    lines.push('  readonly VITE_GRAPHQL_URL?: string;');
  }

  lines.push('}');
  lines.push('');
  lines.push('interface ImportMeta {');
  lines.push('  readonly env: ImportMetaEnv;');
  lines.push('}');

  return `${lines.join('\n')}\n`;
}

function renderEnvConfig(
  context: TemplateContext,
  features: InstalledFeatures,
): string {
  const lines = [
    "import { z } from 'zod';",
    '',
    `const fallbackAppName = ${JSON.stringify(context.appDisplayName)};`,
  ];

  if (features.auth) {
    lines.push(
      "const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim() || '';",
    );
    lines.push(
      "const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim() || '';",
    );
    lines.push(
      "const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim() || '';",
    );
    lines.push('');
    lines.push('const auth0ConfigSchema = z.object({');
    lines.push('  domain: z.string(),');
    lines.push('  clientId: z.string(),');
    lines.push('  audience: z.string(),');
    lines.push('  isConfigured: z.boolean(),');
    lines.push('});');
  }

  const envSchemaLines = ['appName: z.string().trim().min(1),'];
  const envLines = [
    'appName: import.meta.env.VITE_APP_NAME?.trim() || fallbackAppName,',
  ];

  if (features.redux) {
    envSchemaLines.push('enableReduxLogging: z.boolean(),');
    envLines.push(
      "enableReduxLogging: import.meta.env.VITE_ENABLE_REDUX_LOGGING === 'true',",
    );
  }

  if (features.reactQuery) {
    envSchemaLines.push('apiBaseUrl: z.string().trim().min(1),');
    envLines.push(
      "apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '/api',",
    );
  }

  if (features.apollo) {
    envSchemaLines.push('graphqlUrl: z.string().trim().min(1),');
    envLines.push(
      "graphqlUrl: import.meta.env.VITE_GRAPHQL_URL?.trim() || '/graphql',",
    );
  }

  if (features.auth) {
    envSchemaLines.push('auth0: auth0ConfigSchema,');
    envLines.push('auth0: {');
    envLines.push('  domain: auth0Domain,');
    envLines.push('  clientId: auth0ClientId,');
    envLines.push('  audience: auth0Audience,');
    envLines.push(
      '  isConfigured: Boolean(auth0Domain && auth0ClientId),',
    );
    envLines.push('}),');
  }

  lines.push('');
  lines.push('export const envSchema = z.object({');
  lines.push(indent(envSchemaLines.join('\n'), 2));
  lines.push('});');
  lines.push('');
  lines.push('export type Env = z.infer<typeof envSchema>;');
  lines.push('');
  lines.push('export const env = Object.freeze(');
  lines.push('  envSchema.parse({');
  lines.push(indent(envLines.join('\n'), 4));
  lines.push('  }),');
  lines.push(');');

  return `${lines.join('\n')}\n`;
}

function wrapWithProvider(
  openingTag: string,
  closingTag: string,
  children: string[],
): string[] {
  return [openingTag, ...children.map((line) => `  ${line}`), closingTag];
}

function renderAppProviders(features: InstalledFeatures): string {
  const imports = ["import type { PropsWithChildren } from 'react';"];

  if (features.reactQuery) {
    imports.push(
      "import { QueryClientProvider } from '@tanstack/react-query';",
    );
    imports.push(
      "import { ReactQueryDevtools } from '@tanstack/react-query-devtools';",
    );
    imports.push("import { queryClient } from '@/shared/api';");
  }

  if (features.redux) {
    imports.push("import { Provider } from 'react-redux';");
    imports.push("import { store } from '@/app/store';");
  }

  if (features.uiLibrary) {
    imports.push("import { CssBaseline, ThemeProvider } from '@mui/material';");
    imports.push(
      "import { createDefaultTheme } from '@batoanng/mui-components';",
    );
  }

  if (features.auth) {
    imports.push(
      "import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';",
    );
  }

  const lines = [...imports, ''];

  if (features.uiLibrary) {
    lines.push('const appTheme = createDefaultTheme({});');
    lines.push('');
  }

  let bodyLines = ['{children}'];

  if (features.uiLibrary) {
    const themedLines = ['<CssBaseline />', '{children}'];

    if (features.reactQuery) {
      themedLines.push(
        '{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" /> : null}',
      );
    }

    bodyLines = wrapWithProvider(
      '<ThemeProvider theme={appTheme}>',
      '</ThemeProvider>',
      themedLines,
    );
  }

  if (features.redux) {
    bodyLines = wrapWithProvider(
      '<Provider store={store}>',
      '</Provider>',
      bodyLines,
    );
  }

  if (features.auth) {
    bodyLines = wrapWithProvider(
      '<Auth0ProviderWithNavigate>',
      '</Auth0ProviderWithNavigate>',
      bodyLines,
    );
  }

  if (features.reactQuery) {
    const queryLines = [...bodyLines];

    if (!features.uiLibrary) {
      queryLines.push(
        '{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" /> : null}',
      );
    }

    bodyLines = wrapWithProvider(
      '<QueryClientProvider client={queryClient}>',
      '</QueryClientProvider>',
      queryLines,
    );
  }

  lines.push('export function AppProviders({ children }: PropsWithChildren) {');
  lines.push('  return (');
  lines.push(indent(bodyLines.join('\n'), 4));
  lines.push('  );');
  lines.push('}');

  return `${lines.join('\n')}\n`;
}

function renderAppRouter(features: InstalledFeatures): string {
  const imports = [
    "import { Navigate, Route, Routes } from 'react-router-dom';",
  ];

  if (features.auth) {
    imports.push("import { AuthPage } from '@/pages/auth';");
  }

  imports.push("import { HomePage } from '@/pages/home';");

  if (features.redux) {
    imports.push("import { ReduxPage } from '@/pages/redux';");
  }

  if (features.reactQuery) {
    imports.push("import { ReactQueryPage } from '@/pages/react-query';");
  }

  if (features.apollo) {
    imports.push("import { ApolloPage } from '@/pages/apollo';");
    imports.push("import { ApolloWithAuthProvider } from '@/shared/apollo';");
  }

  if (features.pwa) {
    imports.push("import { PwaPage } from '@/pages/pwa';");
  }

  const routeLines = ['<Route path="/" element={<HomePage />} />'];

  if (features.auth) {
    routeLines.push('<Route path="/auth" element={<AuthPage />} />');
  }

  if (features.redux) {
    routeLines.push('<Route path="/redux" element={<ReduxPage />} />');
  }

  if (features.reactQuery) {
    routeLines.push(
      '<Route path="/react-query" element={<ReactQueryPage />} />',
    );
  }

  if (features.apollo) {
    routeLines.push('<Route path="/apollo" element={<ApolloPage />} />');
  }

  if (features.pwa) {
    routeLines.push('<Route path="/pwa" element={<PwaPage />} />');
  }

  routeLines.push('<Route path="*" element={<Navigate replace to="/" />} />');

  let routerLines = ['<Routes>', ...routeLines, '</Routes>'];

  if (features.apollo) {
    routerLines = wrapWithProvider(
      '<ApolloWithAuthProvider>',
      '</ApolloWithAuthProvider>',
      routerLines,
    );
  }

  return `${imports.join('\n')}\n\nexport function AppRouter() {\n  return (\n${indent(
    routerLines.join('\n'),
    4,
  )}\n  );\n}\n`;
}

function renderBaseHomePageParagraphs(features: InstalledFeatures): string[] {
  const paragraphs = [
    `        <p>
          React + TypeScript + Vite starter with routing, testing, aliases, and a
          Feature-Sliced Design foundation.
        </p>`,
  ];

  if (features.auth) {
    paragraphs.push(
      `        <p>
          Auth0 scaffolding is ready for this project, including provider wiring and
          a dedicated authentication example route.
        </p>`,
    );
  }

  if (features.redux) {
    paragraphs.push(
      `        <p>
          Redux scaffolding is ready for this project, including a persisted store,
          typed hooks, and an example route based on the repo&apos;s example app.
        </p>`,
    );
  }

  if (features.reactQuery) {
    paragraphs.push(
      `        <p>
          React Query scaffolding is ready for this project, including a shared
          QueryClient, Axios-based query helpers, and a dedicated setup example
          route.
        </p>`,
    );
  }

  if (features.apollo) {
    paragraphs.push(
      `        <p>
          Apollo scaffolding is ready for this project, including a shared
          GraphQL client, route-level provider wiring, and a live example query
          route.
        </p>`,
    );
  }

  if (features.pwa) {
    paragraphs.push(
      `        <p>
          PWA scaffolding is ready for this project, including plugin-managed
          manifest generation, install and update prompts, and a dedicated guide
          route.
        </p>`,
    );
  }

  return paragraphs;
}

function renderBaseHomePageLinks(features: InstalledFeatures): string[] {
  const links: string[] = [];

  if (features.auth) {
    links.push(
      `        <p>
          <Link to="/auth">Open the authentication example</Link>
        </p>`,
    );
  }

  if (features.redux) {
    links.push(
      `        <p>
          <Link to="/redux">Open the Redux example</Link>
        </p>`,
    );
  }

  if (features.reactQuery) {
    links.push(
      `        <p>
          <Link to="/react-query">Open the React Query example</Link>
        </p>`,
    );
  }

  if (features.apollo) {
    links.push(
      `        <p>
          <Link to="/apollo">Open the Apollo example</Link>
        </p>`,
    );
  }

  if (features.pwa) {
    links.push(
      `        <p>
          <Link to="/pwa">Open the PWA example</Link>
        </p>`,
    );
  }

  return links;
}

function renderBaseHomePage(
  _context: TemplateContext,
  features: InstalledFeatures,
): string {
  const contentLines = [
    'import { env } from \'@/shared/config\';',
  ];

  if (
    features.auth ||
    features.redux ||
    features.reactQuery ||
    features.apollo ||
    features.pwa
  ) {
    contentLines.unshift("import { Link } from 'react-router-dom';");
  }

  const paragraphs = renderBaseHomePageParagraphs(features);
  const links = renderBaseHomePageLinks(features);

  return `${contentLines.join('\n')}\n\nexport function HomePage() {\n  return (\n    <main className="page">\n      <section className="hero">\n        <p className="eyebrow">Base application</p>\n        <h1>{env.appName}</h1>\n${paragraphs.join(
    '\n',
  )}\n${links.join('\n')}\n      </section>\n    </main>\n  );\n}\n`;
}

function renderUiLibraryDescriptionParagraphs(
  features: InstalledFeatures,
): string[] {
  const paragraphs = [
    `            <Typography color="text.secondary" maxWidth={720}>
              The ui-library feature wires Material UI theme setup,
              {' '}@batoanng/mui-components, and shared app-wide styling into the
              generated shell from the start.
            </Typography>`,
  ];

  if (features.auth) {
    paragraphs.push(
      `            <Typography color="text.secondary" maxWidth={720}>
              Auth0 scaffolding is also connected, so the generated shell already
              exposes the authentication example route and provider wiring.
            </Typography>`,
    );
  }

  if (features.redux) {
    paragraphs.push(
      `            <Typography color="text.secondary" maxWidth={720}>
              Redux scaffolding adds a persisted Redux Toolkit store and typed hooks
              without disrupting the UI shell.
            </Typography>`,
    );
  }

  if (features.reactQuery) {
    paragraphs.push(
      `            <Typography color="text.secondary" maxWidth={720}>
          React Query scaffolding adds a shared QueryClient, devtools, and
          Axios-based wrappers for feature-level data hooks.
        </Typography>`,
    );
  }

  if (features.apollo) {
    paragraphs.push(
      `            <Typography color="text.secondary" maxWidth={720}>
              Apollo scaffolding adds a route-level GraphQL provider, a shared
              client setup, and a live <code>__typename</code> example route.
            </Typography>`,
    );
  }

  if (features.pwa) {
    paragraphs.push(
      `            <Typography color="text.secondary" maxWidth={720}>
              PWA scaffolding adds install and update status UI, plugin-managed
              manifest generation, and a dedicated guide route for offline
              behavior.
            </Typography>`,
    );
  }

  return paragraphs;
}

function buildHomePageButtons(features: InstalledFeatures): string[] {
  const buttons: Array<{ label: string; to: string }> = [];

  if (features.auth) {
    buttons.push({
      label: 'Open the authentication example',
      to: '/auth',
    });
  }

  if (features.redux) {
    buttons.push({
      label: 'Open the Redux example',
      to: '/redux',
    });
  }

  if (features.reactQuery) {
    buttons.push({
      label: 'Open the React Query example',
      to: '/react-query',
    });
  }

  if (features.apollo) {
    buttons.push({
      label: 'Open the Apollo example',
      to: '/apollo',
    });
  }

  if (features.pwa) {
    buttons.push({
      label: 'Open the PWA example',
      to: '/pwa',
    });
  }

  return buttons.map(({ label, to }, index) => {
    const variant = index === 0 ? 'contained' : 'outlined';

    return `              <Button component={RouterLink} to="${to}" variant="${variant}">
                ${label}
              </Button>`;
  });
}

function renderUiLibraryHomePage(
  _context: TemplateContext,
  features: InstalledFeatures,
): string {
  const imports = ['import { Chip, Container, Stack, Typography } from \'@mui/material\';'];

  if (
    features.auth ||
    features.redux ||
    features.reactQuery ||
    features.apollo ||
    features.pwa
  ) {
    imports[0] =
      "import { Button, Chip, Container, Stack, Typography } from '@mui/material';";
    imports.push("import { Link as RouterLink } from 'react-router-dom';");
  }

  imports.push("import { env } from '@/shared/config';");
  imports.push("import { UiLibraryShowcase } from '@/widgets/ui-library-showcase';");

  const descriptionParagraphs = renderUiLibraryDescriptionParagraphs(features);
  const buttons = buildHomePageButtons(features);

  const buttonBlock =
    buttons.length > 0
      ? `\n            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>\n${buttons.join(
          '\n',
        )}\n            </Stack>`
      : '';

  return `${imports.join('\n')}\n\nexport function HomePage() {\n  return (\n    <main className="page">\n      <Container maxWidth="lg" className="page__content">\n        <Stack spacing={{ xs: 4, md: 6 }}>\n          <Stack component="section" spacing={2}>\n            <Chip\n              label="Base application"\n              color="primary"\n              variant="outlined"\n              sx={{ alignSelf: 'flex-start' }}\n            />\n            <Typography component="h1" variant="h1">\n              {env.appName}\n            </Typography>\n            <Typography variant="h5" color="text.secondary" maxWidth={720}>\n              React + TypeScript + Vite starter with routing, testing, aliases, and a\n              Feature-Sliced Design foundation.\n            </Typography>\n${descriptionParagraphs.join(
    '\n',
  )}${buttonBlock}\n          </Stack>\n          <UiLibraryShowcase />\n        </Stack>\n      </Container>\n    </main>\n  );\n}\n`;
}

function renderHomePage(
  context: TemplateContext,
  features: InstalledFeatures,
): string {
  if (features.uiLibrary) {
    return renderUiLibraryHomePage(context, features);
  }

  return renderBaseHomePage(context, features);
}

function renderHomePageTest(
  context: TemplateContext,
  features: InstalledFeatures,
): string {
  const assertions = [
    `    expect(
      screen.getByRole('heading', { name: '${context.appDisplayName}' }),
    ).toBeInTheDocument();`,
    `    expect(
      screen.getByText(/Feature-Sliced Design foundation/i),
    ).toBeInTheDocument();`,
  ];

  if (features.uiLibrary) {
    assertions.push(
      `    expect(
      screen.getByRole('heading', { name: /Shared UI, ready to extend/i }),
    ).toBeInTheDocument();`,
    );
  }

  if (features.auth) {
    assertions.push(
      `    expect(
      screen.getByRole('link', { name: /Open the authentication example/i }),
    ).toHaveAttribute('href', '/auth');`,
    );
  }

  if (features.redux) {
    assertions.push(
      `    expect(
      screen.getByRole('link', { name: /Open the Redux example/i }),
    ).toHaveAttribute('href', '/redux');`,
    );
  }

  if (features.reactQuery) {
    assertions.push(
      `    expect(
      screen.getByRole('link', { name: /Open the React Query example/i }),
    ).toHaveAttribute('href', '/react-query');`,
    );
  }

  if (features.apollo) {
    assertions.push(
      `    expect(
      screen.getByRole('link', { name: /Open the Apollo example/i }),
    ).toHaveAttribute('href', '/apollo');`,
    );
  }

  if (features.pwa) {
    assertions.push(
      `    expect(
      screen.getByRole('link', { name: /Open the PWA example/i }),
    ).toHaveAttribute('href', '/pwa');`,
    );
  }

  return `import { render, screen } from '@testing-library/react';\nimport { MemoryRouter } from 'react-router-dom';\nimport { describe, expect, it } from 'vitest';\nimport { AppProviders } from '@/app/providers';\nimport { HomePage } from './HomePage';\n\ndescribe('HomePage', () => {\n  it('renders the generated home page content', () => {\n    render(\n      <MemoryRouter>\n        <AppProviders>\n          <HomePage />\n        </AppProviders>\n      </MemoryRouter>,\n    );\n\n${assertions.join('\n\n')}\n  });\n});\n`;
}

function renderSharedScaffoldFile(
  filePath: SharedScaffoldPath,
  context: TemplateContext,
  features: InstalledFeatures,
): string {
  switch (filePath) {
    case '.env.example':
      return renderEnvExample(context, features);
    case 'src/vite-env.d.ts':
      return renderViteEnv(features);
    case 'src/shared/config/env.ts':
      return renderEnvConfig(context, features);
    case 'src/app/providers/AppProviders.tsx':
      return renderAppProviders(features);
    case 'src/app/routes/AppRouter.tsx':
      return renderAppRouter(features);
    case 'src/pages/home/ui/HomePage.tsx':
      return renderHomePage(context, features);
    case 'src/pages/home/ui/HomePage.test.tsx':
      return renderHomePageTest(context, features);
    default:
      return '';
  }
}

export function buildSharedScaffold(
  context: TemplateContext,
  features: InstalledFeatures,
): Record<SharedScaffoldPath, string> {
  return SHARED_SCAFFOLD_PATHS.reduce(
    (accumulator, filePath) => ({
      ...accumulator,
      [filePath]: renderSharedScaffoldFile(filePath, context, features),
    }),
    {} as Record<SharedScaffoldPath, string>,
  );
}
