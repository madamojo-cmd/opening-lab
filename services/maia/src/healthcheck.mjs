const port = Number(process.env.PORT ?? 8080);
const response = await fetch(`http://127.0.0.1:${port}/ready`, {
  signal: AbortSignal.timeout(1_500),
});
const body = await response.json();
if (!response.ok || body?.ready !== true) process.exit(1);
