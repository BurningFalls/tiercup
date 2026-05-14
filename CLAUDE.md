# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Task 실행 브랜치 관리

ROADMAP.md 기반 task 실행 요청이 오면:
1. `git branch --show-current`로 현재 브랜치 확인
2. `develop`이 아니면 먼저 `develop`으로 이동
3. `feature/task-{번호}-{ROADMAP.md 제목 kebab-case 요약}` 브랜치 생성 후 체크아웃
4. 구현 완료 후 사용자에게 결과 보고

---

## 6. 구현 완료 후 빌드 검증

코드 구현/수정이 완료되면 반드시 아래 순서로 빌드를 검증한다.

```bash
rm -rf .next && npm run build
```

조건:
- UI 컴포넌트, 페이지, API 등 코드 변경이 수반된 모든 작업에 적용한다.
- 단순 설정 파일 변경(CLAUDE.md, .env 등)은 제외한다.
- 빌드 실패 시 원인을 수정한 후 재검증하고, 통과된 이후에 사용자에게 결과를 보고한다.

---

## 7. 작업 완료 시 Slack 알림

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
