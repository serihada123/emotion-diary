# 감정일기 (우루루) — 개발 인수인계 문서

이 문서는 `emotion-archive-prototype.jsx` 프로토타입을 실제 웹 서비스로 옮길 때 참고할 인수인계 자료입니다. Claude Code에게 그대로 전달해서 작업을 시작할 수 있습니다.

---

## 1. 프로젝트 한 줄 요약

펭귄 캐릭터 **우루루**와 대화하며 오늘의 감정을 나누면, AI가 그 대화를 읽고 **감정 오브젝트(게임 아이템)**로 변환해 **아카이브에 수집**하는 개인 감정 일기 웹 서비스.

- **타겟**: 개인 사용자, 모바일 브라우저 중심 (데스크톱은 모바일 화면을 중앙에 고정폭으로 띄우는 방식)
- **톤**: 감정 일기 + 게임 아이템 수집을 결합. 3D 글로시 아이템 스타일, 밝고 통통 튀는 느낌
- **비즈니스 모델 참고**: Finch(자기관리 펫 앱) — 핵심 기능은 100% 무료, 코스메틱/프리미엄 콘텐츠만 유료. 자세한 내용은 `reference_apps.md` 참고

---

## 2. 지금 상태 (프로토타입)

`emotion-archive-prototype.jsx` 하나에 전체 화면과 로직이 들어있는 단일 파일 React 컴포넌트입니다. **UI/UX/인터랙션은 이 상태로 충분히 검증됨** — 그대로 옮기면 됩니다.

### 화면 흐름
```
SplashScreen (로고+시작)
  → OnboardingScreen (3단계 소개, 건너뛰기 가능)
    → ChatScreen (우루루와 대화)
      → ProcessingScreen (감정→오브젝트 변환 애니메이션)
        → ResultScreen (결과 확인/수정)
          → ArchiveScreen (수집한 오브젝트 3x3 페이지네이션 그리드)
            → DetailScreen (개별 기록 상세/수정/삭제)
```

### 기술 스택 (프로토타입)
- React 18 (hooks: useState, useRef, useEffect, useId)
- 스타일: 인라인 style 객체 + 하나의 `<style>` 태그 안 CSS keyframes
- 아이콘: 전부 자체 제작 SVG (외부 이미지 라이브러리 없음)
- 폰트: Google Fonts CDN (`Jua`, `Gaegu`)
- 캐릭터 이미지: 실제 3D 렌더 PNG 리소스, base64로 파일 내 임베딩 (여러 포즈 포함: 기본, 두루마리 든 포즈, 느낌표/물음표 리액션 등)

---

## 3. ⚠️ 반드시 실제 서비스용으로 교체해야 하는 부분

프로토타입은 **claude.ai 아티팩트 환경 전용 API**를 써서 임시로 작동시킨 부분이 두 군데 있습니다. 실제 배포 전 **반드시** 교체해야 합니다.

### 3-1. 데이터 저장 (`window.storage`)

**위치**: 파일 내 `useEffect` 훅 2곳 (약 1390~1430번째 줄 부근)
```js
await window.storage.get("emotion-archive-entries", false)
await window.storage.set("emotion-archive-entries", JSON.stringify(archive), false)
```

- `window.storage`는 claude.ai 아티팩트에서만 존재하는 객체입니다. 일반 브라우저에는 없습니다.
- **교체 방안**:
  1. **빠른 임시 방편**: `localStorage`로 교체 (기기 바뀌면 데이터 유실, but 배포는 즉시 가능)
  2. **정식 방안**: Supabase/Firebase 등 실제 DB 연동 (로그인 붙이면 기기 간 동기화 가능)
- 현재 코드에 이미 `try/catch`로 안전하게 감싸져 있어서, `window.storage`가 없어도 앱이 깨지지는 않고 그냥 저장이 안 될 뿐입니다. 이 부분만 실제 저장 로직으로 바꿔주면 됩니다.

### 3-2. AI 호출 (`fetch("https://api.anthropic.com/v1/messages")`)

**위치**: 두 함수, `askUruuru()` (약 1448번째 줄)와 `generateArchiveResult()` (약 1540번째 줄)

- 지금은 브라우저에서 **API 키 없이 직접** Anthropic API를 호출하는 구조입니다 — 이건 claude.ai 아티팩트 환경에서만 자동으로 인증되는 특수한 방식이라, **일반 배포 환경에서는 작동하지 않습니다.**
- **절대 이 fetch 코드를 그대로 배포하면 안 됩니다** (API 키 노출 위험 + 애초에 인증이 안 돼서 작동도 안 함).
- **교체 방안**:
  1. 백엔드(Next.js API Route, Vercel Serverless Function 등)에 엔드포인트를 만들고, 클라이언트는 그 엔드포인트만 호출
  2. 실제 Anthropic API 키는 **서버 환경변수에만** 저장 (`console.anthropic.com`에서 발급, 종량제 결제)
  3. 각 함수 안의 **시스템 프롬프트(`URUURU_SYSTEM_PROMPT`, `ARCHIVE_SYSTEM_PROMPT`)와 모델명(`claude-sonnet-4-6`)은 그대로 재사용 가능** — 호출 방식(클라이언트 직접 호출 → 서버 경유)만 바꾸면 됩니다.
- 두 함수 모두 **AI 실패 시 예전 템플릿 방식으로 자동 폴백**하도록 이미 구현되어 있으니, 이 폴백 로직(`buildResult`, `CASUAL_REPLIES` 등)은 그대로 안전망으로 유지하는 걸 권장합니다.

---

## 4. 데이터 모델

```ts
type ArchiveEntry = {
  id: string;
  date: string;               // 표시용 날짜 문자열 (예: "8월 7일")
  objectType: string;         // 아래 30종 중 하나
  objectName: string;         // AI가 생성한 아이템 이름
  oneLine: string;            // 한 줄 요약
  primaryEmotion: string;     // 아래 15종 중 하나
  secondaryEmotion: string;   // 아래 15종 중 하나
  diaryText: string;          // AI가 대화 맥락을 재구성해 쓴 일기
  characterLine: string;      // 우루루의 한마디
};
```

**objectType 유효값 (30종)**:
`diary, letter, plate, medal, boat, lantern, seed, umbrella, key, compass, candle, bell, balloon, hourglass, gift, mushroom, trophy, coin, potion, cake, dice, wand, crown, donut, chest, scroll, book, map, anchor, boots`

**감정 유효값 (15종)**:
`분노, 서운함, 짜증, 만족, 기쁨, 허탈함, 담담함, 편안함, 불안, 슬픔, 지침, 뿌듯, 설레, 안심, 홀가분`

> 각 오브젝트 타입마다 대응하는 SVG 아이콘이 `ObjectIcon` 컴포넌트에 이미 구현되어 있습니다 (그라데이션+하이라이트+그림자로 3D 글로시 느낌). 새 타입을 추가하려면 이 컴포넌트의 `icons` 객체에 SVG를 추가하고, 위 유효값 목록(AI 프롬프트 내 2곳 + `validTypes` 배열)에도 추가해야 합니다.

---

## 5. 디자인 톤 가이드

### 색상 팔레트
```js
{
  bg: "#C5E4EF",        // 기본 하늘색 배경
  archiveBg: "#F4F1E9",
  navy: "#1B3A5C",      // 캐릭터 몸통색, 강조 텍스트
  cream: "#FAEEDA",
  amber: "#EF9F27",     // 포인트 컬러 (버튼, 강조)
  ink: "#1A1A1A",       // 기본 텍스트(검정)
  textSecondary: "#3A4A52",
  textMuted: "#8B8578",
  white: "#FFFFFF",
}
```

### 원칙
- 앰버(주황빛 골드)는 **포인트로만** 사용, 본문 텍스트는 검정(ink) 또는 남색(navy)
- 아이템 아이콘은 **평면 아이콘이 아니라 "3D 클레이 렌더" 느낌** — 방사형/선형 그라데이션, 스페큘러 하이라이트, 접지 그림자를 항상 같이 사용
- 등장 애니메이션은 통통 튀는 오버슛(overshoot) 이징 사용 (`cubic-bezier(0.34,1.56,0.64,1)`), 등장 후에도 미세하게 계속 움직이는 idle 애니메이션 유지
- 캐릭터는 실제 3D 렌더 리소스 이미지 사용 (자체 제작 SVG 아님) — 여러 포즈 리소스 이미 확보되어 있음

---

## 6. 권장 작업 순서

1. **정적 이관**: JSX 파일을 프로젝트(Next.js 권장)로 그대로 이식, 화면 흐름/스타일 깨지지 않는지 확인
2. **저장소 교체**: `window.storage` → `localStorage`로 우선 교체 (빠른 배포 우선, DB는 다음 단계)
3. **AI 호출 프록시화**: 서버리스 함수 경유로 API 호출 이관, API 키는 서버 환경변수로
4. **배포**: Vercel/Netlify에 배포, PWA 매니페스트 추가 (홈 화면 추가 시 앱처럼 보이게)
5. **지인 테스트**: 링크 공유해서 실사용 반응 수집
6. **(이후) 정식 DB + 로그인 연동**: 반응 좋으면 Supabase 등으로 데이터 영속성 강화

---

## 7. 참고 자료

- `reference_apps.md`: 경쟁 앱 목록 및 Finch 수익 모델 상세
- `emotion-archive-prototype.jsx`: 소스 코드 원본 (이 문서와 함께 전달)
