// Custom debug plugin to detect any CSS that still contains `border-border`
const agentDebugBorderBorder = () => ({
  postcssPlugin: "agent-debug-border-border",
  Once(root) {
    try {
      const css = root.toString();
      const hasBorderBorder = css.includes("border-border");

      if (hasBorderBorder) {
        const sourceFile = root.source && root.source.input && root.source.input.file
          ? root.source.input.file
          : "unknown";

        // #region agent log
        // Log evidence that PostCSS is seeing `border-border` in a CSS file
        // Hypotheses: H1 (hidden @apply), H5/H7 (stale or unexpected CSS source)
        // Using global fetch available in Node 18+ runtime
        // eslint-disable-next-line no-void
        void fetch("http://127.0.0.1:7242/ingest/d46131ab-fee2-41f1-a8d7-674b2c480492", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: `log_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            timestamp: Date.now(),
            runId: "build-pre-fix-1",
            hypothesisId: "H1-H7",
            location: "postcss.config.mjs:agent-debug-border-border",
            message: "PostCSS root contains border-border",
            data: {
              sourceFile,
              snippet: css.slice(0, 500),
            },
          }),
        }).catch(() => {});
        // #endregion agent log
      }
    } catch {
      // Swallow any debug errors so they never affect the build
    }
  },
});
agentDebugBorderBorder.postcss = true;

export default {
  plugins: [agentDebugBorderBorder, "@tailwindcss/postcss"],
};
