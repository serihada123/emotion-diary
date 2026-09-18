export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export const OBJECT_TYPES = [
  "diary", "letter", "plate", "medal", "boat", "lantern", "seed", "umbrella", "key",
  "compass", "candle", "bell", "balloon", "hourglass", "gift", "mushroom", "trophy",
  "coin", "potion", "cake", "dice", "wand", "crown", "donut", "chest", "scroll",
  "book", "map", "anchor", "boots",
];
export const EMOTIONS = ["분노", "서운함", "짜증", "만족", "기쁨", "허탈함", "담담함", "편안함", "불안", "슬픔", "지침", "뿌듯", "설레", "안심", "홀가분"];

export function isArchiveResult(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.objectType === "string" && OBJECT_TYPES.includes(value.objectType)
    && typeof value.primaryEmotion === "string" && EMOTIONS.includes(value.primaryEmotion)
    && typeof value.secondaryEmotion === "string" && EMOTIONS.includes(value.secondaryEmotion)
    && isText(value.objectName, 100) && isText(value.oneLine, 500)
    && isText(value.diaryText, 4000) && isText(value.characterLine, 500);
}
