export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { NodeTracerProvider } = await import(
      "@opentelemetry/sdk-trace-node"
    );
    const { LangfuseSpanProcessor } = await import("@langfuse/otel");

    const tracerProvider = new NodeTracerProvider({
      spanProcessors: [new LangfuseSpanProcessor()],
    });

    tracerProvider.register();
  }
}
