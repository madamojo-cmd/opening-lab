import assert from "node:assert/strict";

import { createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { getLocalAccountCurrentUserId, resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "../../persistence/persistenceKeys";
import { buildAccountSettingsSnapshot, signOutBlundrAccount } from "../accountSettingsState";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const previousLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
(globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage();

async function main(): Promise<void> {
  const userId = "settings-user";
  const now = "2026-07-06T11:00:00.000Z";
  resetLocalAccountState(userId);
  setLocalAccountCurrentUserId(userId);
  upsertLocalTrainingProfile(createDefaultTrainingProfile(userId, now));
  const storage = (globalThis as { localStorage?: Storage }).localStorage as Storage;
  storage.setItem(
    "blundr-board-settings",
    JSON.stringify({
      boardThemeId: "blue",
      pieceSetId: "letters",
      showCoordinates: false,
      boardOrientation: "black",
      source: "local_demo",
      updatedAt: now,
    }),
  );

  const snapshot = buildAccountSettingsSnapshot({ storage });
  assert.equal(snapshot.boardPreferences.boardThemeId, "blue");
  assert.equal(snapshot.boardPreferences.pieceSetId, "letters");
  assert.equal(snapshot.accountStatusLabel, "Local demo on this device");

  const result = await signOutBlundrAccount();
  assert.equal(result.ok, true);
  assert.equal(result.switchedToLocalDemo, true);
  assert.equal(getLocalAccountCurrentUserId(), BLUNDR_LOCAL_DEMO_USER_ID);

  console.log("accountSettingsState.test.ts passed");
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
  if (previousLocalStorage) {
    (globalThis as { localStorage?: Storage }).localStorage = previousLocalStorage;
  } else {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  }
  resetLocalAccountState(BLUNDR_LOCAL_DEMO_USER_ID);
});
