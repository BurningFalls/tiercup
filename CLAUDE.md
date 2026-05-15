# CLAUDE.md

> 코딩 행동 지침: `.claude/rules/coding-guidelines.md` 참조  
> 설계 문서: `docs/` — PRD, ROADMAP, feature-design, api-design, database-design, algorithm-design

---

## 0. 프로젝트 개요 및 아키텍처

**TierCup** — 로그인 없이 1:1 비교로 S~F 티어를 자동 생성하는 플랫폼  
**기술 스택**: Next.js 15 (App Router) · TypeScript · React 19 · TailwindCSS v4 · shadcn/ui · Supabase · Vercel

### 핵심 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm test             # 단위/컴포넌트 테스트 (Vitest)
npm run test:e2e     # E2E 테스트 (Playwright)
npm run lint         # ESLint
npm run format       # Prettier
```

### 디렉토리 구조

```
app/                 # Next.js App Router 페이지
  create/            # 티어컵 생성 플로우
  play/[playCode]/   # 1:1 비교 플레이
  result/            # 결과 확인
  manage/            # 티어컵 관리
  explore/           # 티어컵 탐색
  stats/             # 통계
components/          # React 컴포넌트 (기능별 서브폴더)
lib/                 # 유틸, 타입, 스키마, Supabase 클라이언트
  supabase/          # client.ts (브라우저), server.ts (서버)
  types/             # 공통 TypeScript 타입
  schemas/           # Zod 검증 스키마
  utils/             # 유틸 함수
docs/                # ROADMAP.md, PRD, 설계 문서
supabase/            # 로컬 Supabase 설정 및 migrations
e2e/                 # Playwright E2E 테스트
tests/               # Vitest 설정 (setup.ts)
```

### 환경 변수 (`.env.local` 필수)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SLACK_WEBHOOK_URL=
```

### 주요 Gotchas

- `nanoid`는 ESM 전용 — `vitest.config.ts`에서 `server.deps.inline: ['nanoid']` 처리됨
- Supabase RLS가 전체 허용(`true`)인 테이블은 앱 레벨에서 `manage_code` 검증 필수 (삭제 API 등)
- `play_count` / `like_count` 업데이트는 race condition 방지를 위해 일반 UPDATE 대신 Supabase RPC atomic increment 사용
- Server Component에서는 `lib/supabase/server.ts`, Client Component에서는 `lib/supabase/client.ts` 사용

## 1. Task 실행 브랜치 관리

ROADMAP.md 기반 task 실행 요청이 오면:
1. `git branch --show-current`로 현재 브랜치 확인
2. `develop`이 아니면 먼저 `develop`으로 이동
3. `feature/task-{번호}-{ROADMAP.md 제목 kebab-case 요약}` 브랜치 생성 후 체크아웃
4. 구현 완료 후 사용자에게 결과 보고

---

## 2. 구현 완료 후 빌드 검증

코드 구현/수정이 완료되면 반드시 아래 순서로 빌드를 검증한다.

```bash
rm -rf .next && npm run build
```

조건:
- UI 컴포넌트, 페이지, API 등 코드 변경이 수반된 모든 작업에 적용한다.
- 단순 설정 파일 변경(CLAUDE.md, .env 등)은 제외한다.
- 빌드 실패 시 원인을 수정한 후 재검증하고, 통과된 이후에 사용자에게 결과를 보고한다.

---

## 3. 작업 완료 시 Slack 알림

작업을 완료하고 사용자에게 결과를 보고할 때, 반드시 아래 절차대로 Slack `#claude-alerts` 채널에 알림을 전송한다.

1. `date '+%Y-%m-%d %H:%M'` Bash 명령으로 현재 시간을 가져온다.
2. `git branch --show-current` Bash 명령으로 현재 브랜치를 가져온다.
3. 아래 curl 명령으로 Incoming Webhook을 통해 메시지를 전송한다.

```bash
curl -s -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ *Claude 작업 완료*\n• *작업*: [한 작업 한 줄 요약]\n• *브랜치*: [현재 git 브랜치]\n• *다음 액션*: [사용자가 해야 할 다음 단계]\n• *완료 시간*: [date 명령 결과]"}' \
  '$SLACK_WEBHOOK_URL'
```

조건:
- 사용자 요청에 대한 구현/수정/설정이 완료된 시점에 전송한다.
- 단순 질문 답변이나 조회성 작업은 전송하지 않는다.

---

## 4. 작업 완료 시 ROADMAP.md 체크

ROADMAP.md 기반 task 구현이 완료되면, 반드시 해당 task의 모든 항목을 `- [ ]`에서 `- [x]`로 변경한다.

절차:
1. 현재 브랜치명에서 task 번호를 추출한다. (예: `feature/task-013-...` → `013`)
2. `docs/ROADMAP.md`에서 해당 Task 섹션을 찾는다.
3. 해당 섹션의 모든 `- [ ]` 항목을 `- [x]`로 변경한다.

조건:
- ROADMAP.md 기반 task 구현이 완료된 시점에만 적용한다.
- 단순 질문, 조회, 설정 변경은 제외한다.

---

## 5. 기능 구현 시 테스트 작성 의무

ROADMAP.md 기반 Task 구현 시 반드시 테스트를 함께 작성한다.

### 테스트 종류별 작성 기준

| 구현 내용 | 테스트 종류 | 위치 |
|-----------|-------------|------|
| 순수 함수 / 유틸 / 알고리즘 | 단위 테스트 (Vitest) | 소스 파일 옆 (`*.test.ts`) |
| React 컴포넌트 | 컴포넌트 테스트 (Vitest + RTL) | 소스 파일 옆 (`*.test.tsx`) |
| API Route Handler | 단위 테스트 (Vitest) | 소스 파일 옆 (`*.test.ts`) |
| 주요 사용자 플로우 | E2E 테스트 (Playwright) | `e2e/` 폴더 |

### 절차

1. Task 구현 완료 후 관련 테스트 파일 작성
2. `npm test`로 단위/컴포넌트 테스트 통과 확인
3. E2E 대상 Task라면 `npm run test:e2e`도 통과 확인
4. 테스트 통과 확인 후 사용자에게 결과 보고

### 조건

- 테스트 작성 없이 구현만 완료 보고하지 않는다.
- 단순 설정 변경(환경 변수, CLAUDE.md 등)은 제외한다.
- Task 032(E2E 주요 흐름 검증)는 전용 E2E 테스트 Task이다.
