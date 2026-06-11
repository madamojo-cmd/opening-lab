import assert from "node:assert/strict";

import { validateCopyBundle } from "../../lib/blundr/stage2/validation/validateCopyBundle";

function validCopyBundle(): any {
  return {
    version: "0.1.0",
    locale: "en-US",
    source: "stage2-copy-content-package",
    entries: [
      {
        entryId: "entry-1",
        status: "approved",
        surface: "assisted",
        title: "Play e4",
        body: "Play e4 to occupy central space.",
      },
    ],
  };
}

export function testStage2CopyBundleValidator(): void {
  const good = validateCopyBundle(validCopyBundle());
  assert.equal(good.ok, true);
  assert.equal(good.errors.length, 0);

  const missingVersion = validCopyBundle();
  delete missingVersion.version;
  const missingVersionResult = validateCopyBundle(missingVersion);
  assert.equal(missingVersionResult.ok, false);
  assert.equal(missingVersionResult.errors.some((e) => e.code === "invalid_version"), true);

  const wrongSource = validCopyBundle();
  wrongSource.source = "wrong-source";
  const wrongSourceResult = validateCopyBundle(wrongSource);
  assert.equal(wrongSourceResult.ok, false);
  assert.equal(wrongSourceResult.errors.some((e) => e.code === "invalid_source"), true);

  const duplicateEntryId = validCopyBundle();
  duplicateEntryId.entries.push({ entryId: "entry-1", status: "draft" });
  const duplicateEntryIdResult = validateCopyBundle(duplicateEntryId);
  assert.equal(duplicateEntryIdResult.ok, false);
  assert.equal(duplicateEntryIdResult.errors.some((e) => e.code === "duplicate_entry_id"), true);

  const approvedNoText = validCopyBundle();
  approvedNoText.entries = [{ entryId: "entry-a", status: "approved" }];
  const approvedNoTextResult = validateCopyBundle(approvedNoText);
  assert.equal(approvedNoTextResult.ok, false);
  assert.equal(approvedNoTextResult.errors.some((e) => e.code === "approved_entry_missing_visible_text"), true);

  const disabledNoText = validCopyBundle();
  disabledNoText.entries = [{ entryId: "entry-d", status: "disabled" }];
  const disabledNoTextResult = validateCopyBundle(disabledNoText);
  assert.equal(disabledNoTextResult.ok, true);

  const placeholder = validCopyBundle();
  placeholder.entries[0].body = "TODO copy goes here";
  const placeholderResult = validateCopyBundle(placeholder);
  assert.equal(placeholderResult.ok, false);
  assert.equal(placeholderResult.errors.some((e) => e.code === "placeholder_text"), true);

  const internalLabel = validCopyBundle();
  internalLabel.entries[0].title = "Active Piece Development";
  const internalLabelResult = validateCopyBundle(internalLabel);
  assert.equal(internalLabelResult.ok, false);
  assert.equal(internalLabelResult.errors.some((e) => e.code === "internal_label_text"), true);

  const invalidMoveUci = validCopyBundle();
  invalidMoveUci.entries[0].moveUci = "baduci";
  const invalidMoveUciResult = validateCopyBundle(invalidMoveUci);
  assert.equal(invalidMoveUciResult.ok, false);
  assert.equal(invalidMoveUciResult.errors.some((e) => e.code === "invalid_move_uci"), true);

  const unknownField = validCopyBundle();
  unknownField.entries[0].unknownField = "x";
  const unknownFieldResult = validateCopyBundle(unknownField);
  assert.equal(unknownFieldResult.ok, true);
  assert.equal(unknownFieldResult.warnings.some((w) => w.code === "unknown_field"), true);

  const chessLanguageAllowed = validCopyBundle();
  chessLanguageAllowed.entries[0].body = "This knight move improves piece coordination in the center.";
  const chessLanguageAllowedResult = validateCopyBundle(chessLanguageAllowed);
  assert.equal(chessLanguageAllowedResult.ok, true);

  const withEvidenceIds = validCopyBundle();
  withEvidenceIds.entries[0].evidenceIds = ["ev-1", "ev-2"];
  withEvidenceIds.entries[0].body = "This move is strongest in this position.";
  const withEvidenceIdsResult = validateCopyBundle(withEvidenceIds);
  assert.equal(withEvidenceIdsResult.ok, true);
}

testStage2CopyBundleValidator();
console.log("stage2CopyBundleValidator ok");
