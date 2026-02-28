import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://169.254.183.18:3000",
    "169.254.183.18",
    "https://169.254.183.18"
  ],
  turbopack: {
    root: __dirname,
  },
};


// #region agent log
void fetch("http://127.0.0.1:7242/ingest/d46131ab-fee2-41f1-a8d7-674b2c480492", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: `log_${Date.now()}`,
    timestamp: Date.now(),
    runId: "build-pre-fix-1",
    hypothesisId: "H3",
    location: "next.config.ts:9",
    message: "Next config loaded for bits-lost-found",
    data: { cwd: process.cwd() },
  }),
}).catch(() => {});
// #endregion agent log

export default nextConfig;
