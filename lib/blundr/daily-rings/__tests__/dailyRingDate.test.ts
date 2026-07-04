import assert from "node:assert/strict";

import { addLocalDays, getLocalDateKey, isConsecutiveLocalDate, normalizeLocalDateKey } from "../dailyRingDate";

assert.equal(normalizeLocalDateKey("2026-07-04"), "2026-07-04");
assert.equal(normalizeLocalDateKey(" 2026-07-04 "), "2026-07-04");
assert.equal(normalizeLocalDateKey("07/04/2026"), null);
assert.equal(addLocalDays("2026-07-04", 1), "2026-07-05");
assert.equal(isConsecutiveLocalDate("2026-07-04", "2026-07-05"), true);
assert.equal(isConsecutiveLocalDate("2026-07-04", "2026-07-06"), false);
assert.match(getLocalDateKey(), /^\d{4}-\d{2}-\d{2}$/);

console.log("dailyRingDate.test.ts passed");
