const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });

function safeFields(fields) {
  return Object.fromEntries(
    Object.entries(fields ?? {})
      .filter(([key]) => /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key))
      .slice(0, 24)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, 160)
          : typeof value === "number" && Number.isFinite(value)
            ? value
            : typeof value === "boolean" || value === null
              ? value
              : undefined,
      ])
      .filter(([, value]) => value !== undefined),
  );
}

export function createLogger(level = "info", sink = console) {
  const threshold = LEVELS[level] ?? LEVELS.info;
  function write(kind, event, fields) {
    if ((LEVELS[kind] ?? LEVELS.info) < threshold) return;
    const record = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: kind,
      event,
      ...safeFields(fields),
    });
    const method = kind === "debug" ? "debug" : kind;
    (sink[method] ?? sink.log).call(sink, record);
  }
  return Object.freeze({
    debug: (event, fields) => write("debug", event, fields),
    info: (event, fields) => write("info", event, fields),
    warn: (event, fields) => write("warn", event, fields),
    error: (event, fields) => write("error", event, fields),
  });
}
