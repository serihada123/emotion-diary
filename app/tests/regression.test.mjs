import test from "node:test";
import assert from "node:assert/strict";
import { readArchive, getEntryDate } from "../lib/archive-storage.mjs";
import { isArchiveResult, isText } from "../app/api/_lib/validation.ts";

test("deleting the last entry survives a reload", () => {
  assert.deepEqual(readArchive("[]", [{ id: "sample" }]), []);
});

test("only an absent archive loads samples; corrupt data is not replaced", () => {
  const samples = [{ id: "sample" }];
  assert.equal(readArchive(null, samples), samples);
  for (const raw of ["{", "null", "{}", "[null]", '[{"id":"bad"}]']) {
    assert.throws(() => readArchive(raw, samples));
  }
});

test("legacy today entries recover their actual saved date", () => {
  const saved = new Date(2025, 0, 2, 12).getTime();
  assert.equal(getEntryDate({ id: `new-${saved}`, date: "오늘" }), "2025년 1월 2일");
  assert.equal(getEntryDate({ id: "a1", date: "8월 7일" }), "8월 7일");
  assert.equal(getEntryDate({ createdAt: new Date(saved).toISOString() }), "2025년 1월 2일");
});

test("AI output rejects removed items, missing fields, and non-text values", () => {
  const result = {
    objectType: "book", objectName: "산책의 책", oneLine: "꽃을 만난 날",
    diaryText: "산책 중에 꽃을 보았다.", primaryEmotion: "기쁨", secondaryEmotion: "편안함",
    characterLine: "좋은 하루였네!",
  };
  assert.equal(isArchiveResult(result), true);
  for (const patch of [{ objectType: "moon" }, { diaryText: {} }, { oneLine: "" }, { secondaryEmotion: "unknown" }]) {
    assert.equal(isArchiveResult({ ...result, ...patch }), false);
  }
  assert.equal(isArchiveResult(null), false);
});

test("request strings must be nonempty and bounded", () => {
  assert.equal(isText(" ", 2000), false);
  assert.equal(isText("a".repeat(2001), 2000), false);
  assert.equal(isText({}, 2000), false);
  assert.equal(isText("오늘 기분이 좋아", 2000), true);
});
