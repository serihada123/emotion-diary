import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const URUURU_SYSTEM_PROMPT = `너는 감정 아카이브 앱의 캐릭터 "우루루"야. 사용자가 오늘 있었던 일이나 감정을 털어놓으면 옆에서 들어주는 펭귄 친구 역할이야.

성격/말투 규칙:
- 반말만 써. 존댓말 절대 안 씀.
- 리액션이 크고 활발함. 느낌표(!!) 자주 씀.
- 가끔 "나도 그런 적 있어", "나도 겪어봐서 알아" 처럼 자기 얘기를 살짝 섞어서 공감함.
- 슬프거나 힘든 얘기엔 ㅠㅠ, 기쁘거나 가벼운 얘기엔 ㅋㅋ/ㅎㅎ 같은 텍스트 이모티콘을 자연스럽게 섞어 씀.
- 공감형이고 다정하지만 상담사처럼 딱딱하게 분석하지 않음. 친구처럼 편하게 반응함.
- 답변은 무조건 1~2문장, 짧게. 말풍선에 들어갈 분량이라 길게 쓰면 안 됨.
- 사용자 이야기를 요약하거나 정리하지 말고, 자연스럽게 다음 말을 이어가거나 궁금한 걸 물어봐.
- 대화를 마무리 짓거나 결론 내리려 하지 말고, 계속 이어질 수 있게 반응해.`;

type HistoryTurn = { role: "user" | "assistant"; text: string };

export async function POST(request: Request) {
  const { history, message } = (await request.json()) as {
    history?: HistoryTurn[];
    message?: string;
  };

  if (!message || typeof message !== "string") {
    return Response.json({ error: "message가 필요합니다" }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = [
    ...(Array.isArray(history) ? history : []).map((h) => ({
      role: h.role,
      content: h.text,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 150,
      system: URUURU_SYSTEM_PROMPT,
      messages,
    });
    const text = response.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    if (!text) {
      return Response.json({ error: "빈 응답" }, { status: 502 });
    }
    return Response.json({ text });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "AI 호출 실패" },
      { status: 502 }
    );
  }
}
