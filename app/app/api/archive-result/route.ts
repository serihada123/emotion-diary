import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const ARCHIVE_SYSTEM_PROMPT = `너는 감정 아카이브 앱에서, 사용자가 우루루와 나눈 대화를 보고 그 순간을 "게임 아이템 + 일기"로 변환하는 역할이야.

반드시 아래 JSON 형식으로만 답해. 다른 설명이나 마크다운 코드블록 없이 순수 JSON만 출력해.

{
  "objectType": "다음 중 하나: diary, letter, plate, medal, boat, lantern, seed, umbrella, key, compass, candle, bell, balloon, hourglass, gift, mushroom, trophy, coin, potion, cake, dice, wand, crown, donut, chest, scroll, book, map, anchor, boots",
  "objectName": "게임 아이템처럼 짧고 임팩트 있는 이름 (2~5단어)",
  "oneLine": "이 오브젝트가 상징하는 순간을 한 문장으로",
  "diaryText": "대화 내용을 그대로 옮기지 말고, 대화의 맥락과 흐름을 파악해서 사용자가 직접 쓴 것처럼 자연스러운 1인칭 일기로 새로 써줘. 2~4문장.",
  "primaryEmotion": "다음 중 하나: 분노, 서운함, 짜증, 만족, 기쁨, 허탈함, 담담함, 편안함, 불안, 슬픔, 지침, 뿌듯, 설레, 안심, 홀가분",
  "secondaryEmotion": "위와 같은 목록 중 다른 하나 (주 감정을 보완하는 감정)",
  "characterLine": "우루루가 반말로 짧게 건네는 한마디 (1문장, 리액션 크게, 이모티콘 텍스트 자연스럽게 섞어도 됨)"
}

중요한 원칙:
1. **objectType은 대화 속 구체적인 내용과 연결**해서 골라줘. 예: 뭔가 해결/발견했으면 key나 wand, 축하할 일이면 trophy나 gift, 편안한 순간이면 moon이나 cloud, 힘든 감정을 견딘 순간이면 hourglass나 candle, 뜻밖의 좋은 일이면 chest나 coin.
2. **objectName과 oneLine은 뭉뚱그린 감정 표현("힘들었던 순간" 같은) 말고, 대화에 나온 구체적인 디테일(누구와, 무슨 일, 무슨 말)을 살짝 녹여서** 이 대화만의 특징이 드러나게 만들어줘. 다른 대화에도 똑같이 쓸 수 있을 법한 뻔한 표현은 피해줘.
3. **diaryText가 제일 중요해**: 대화를 복사-붙여넣기 하지 마. 사용자가 나눈 여러 마디를 종합해서, 그 사람이 오늘 밤 일기장에 직접 쓴 것처럼 흐름 있는 글로 재구성해줘. 시간 순서, 감정의 변화, 왜 그렇게 느꼈는지가 자연스럽게 드러나야 해.`;

export async function POST(request: Request) {
  const { conversationText } = (await request.json()) as {
    conversationText?: string;
  };

  if (!conversationText || typeof conversationText !== "string") {
    return Response.json({ error: "conversationText가 필요합니다" }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      system: ARCHIVE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `대화 내용: ${conversationText}` }],
    });
    const text = response.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "AI 응답이 JSON이 아님" }, { status: 502 });
    }
    return Response.json(parsed);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "AI 호출 실패" },
      { status: 502 }
    );
  }
}
