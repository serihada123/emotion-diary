export function readArchive(raw, initialEntries) {
  if (raw === null) return initialEntries;
  const entries = JSON.parse(raw);
  const fields = ["id", "date", "objectType", "objectName", "primaryEmotion", "secondaryEmotion", "diaryText", "characterLine"];
  if (!Array.isArray(entries) || !entries.every((entry) => entry &&
    fields.every((field) => typeof entry[field] === "string") &&
    (entry.oneLine === undefined || typeof entry.oneLine === "string") &&
    (entry.createdAt === undefined || (typeof entry.createdAt === "string" && !Number.isNaN(Date.parse(entry.createdAt)))))) {
    throw new Error("저장된 기록 형식이 올바르지 않습니다");
  }
  return entries;
}

export function getEntryDate(entry) {
  // 기존 기록은 new-<timestamp> ID로 저장되어 있어 실제 저장 날짜를 복원할 수 있다.
  const timestamp = entry.createdAt ?? (/^new-\d+$/.test(entry.id) ? Number(entry.id.slice(4)) : null);
  const date = timestamp === null ? null : new Date(timestamp);
  if (!date || Number.isNaN(date.getTime())) return entry.date;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}
