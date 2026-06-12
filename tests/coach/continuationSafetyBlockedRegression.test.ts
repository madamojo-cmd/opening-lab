import { testStockfishReadyNoSafetyBlocked } from "./stockfishReadyNoSafetyBlocked.test";

export function testContinuationSafetyBlockedRegression(): void {
  testStockfishReadyNoSafetyBlocked();
}

testContinuationSafetyBlockedRegression();
console.log("continuationSafetyBlockedRegression ok");
