import assert from "node:assert/strict";
import test from "node:test";
import * as noopSentry from "../noopSentry";

test("local no-telemetry Sentry alias exposes compiler-injected wrappers", () => {
  const component = () => "component";
  for (const name of [
    "wrapServerComponentWithSentry",
    "wrapClientComponentWithSentry",
    "wrapPageComponentWithSentry",
    "wrapGenerationFunctionWithSentry",
    "wrapRouteHandlerWithSentry",
    "wrapApiHandlerWithSentry",
    "wrapMiddlewareWithSentry",
    "wrapGetServerSidePropsWithSentry",
    "wrapGetStaticPropsWithSentry",
    "wrapGetInitialPropsWithSentry",
  ] as const) {
    assert.equal(typeof noopSentry[name], "function", `${name} missing`);
    assert.equal(noopSentry[name](component), component);
  }
});
