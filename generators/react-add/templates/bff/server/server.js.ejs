import { buildServer } from "@batoanng/frontend-server";
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const env = process.env.NODE_ENV?.toLowerCase() ?? "development";
const executionPath = dirname(fileURLToPath(import.meta.url));
const clientBuildPath = join(executionPath, "../dist");

config({ path: join(executionPath, `.env.${env}`) });

const {
  APP_API_TARGET_SERVER: targetServerUrl,
  PORT: port = 3000,
  APP_BASE_URL,
  CORS_ORIGIN,
  NR_APP_ID,
} = process.env;

const allowedOrigins = Array.from(
  new Set([APP_BASE_URL, CORS_ORIGIN].filter(Boolean)),
);

const newRelic = NR_APP_ID ? { applicationId: NR_APP_ID } : undefined;

const { server } = buildServer({
  nodeEnv: env,
  targetServerUrl,
  clientBuildPath,
  cspOptions: {
    services: ["google-fonts", "google-analytics", "newrelic"],
    connectSrcElements: ["https://*.auth0.com"],
    styleSrcElements: ["'unsafe-inline'"],
  },
  newRelic,
  corsOptions: { allowedOrigins },
});

server.listen(port, () => {
  console.info(`App Server is running on port ${port}`);
});
