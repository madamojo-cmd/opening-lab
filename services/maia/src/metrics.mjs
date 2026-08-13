const METRIC_NAME = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;

function labelsText(labels) {
  const entries = Object.entries(labels ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (!entries.length) return "";
  const pairs = entries.map(([key, value]) => {
    const escaped = String(value)
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"');
    return `${key}="${escaped}"`;
  });
  return `{${pairs.join(",")}}`;
}

function keyFor(name, labels) {
  return `${name}${labelsText(labels)}`;
}

export class Metrics {
  #counters = new Map();
  #gauges = new Map();

  increment(name, labels = {}, value = 1) {
    if (!METRIC_NAME.test(name)) throw new Error("metric_name_invalid");
    const key = keyFor(name, labels);
    this.#counters.set(key, (this.#counters.get(key) ?? 0) + value);
  }

  set(name, value, labels = {}) {
    if (!METRIC_NAME.test(name)) throw new Error("metric_name_invalid");
    this.#gauges.set(keyFor(name, labels), Number(value));
  }

  render() {
    const lines = [
      "# HELP blundr_maia_build_info Static build identity.",
      "# TYPE blundr_maia_build_info gauge",
      'blundr_maia_build_info{service_version="1.0.0"} 1',
    ];
    for (const [key, value] of [...this.#counters].sort())
      lines.push(`${key} ${value}`);
    for (const [key, value] of [...this.#gauges].sort())
      lines.push(`${key} ${value}`);
    return `${lines.join("\n")}\n`;
  }
}
