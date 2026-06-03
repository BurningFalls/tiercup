# Welcome to TierCup

## How We Use Claude

Based on BurningFalls's usage over the last 30 days:

Work Type Breakdown:
  Build Feature  ████████████████░░░░  ~55%
  Improve Quality  ████████░░░░░░░░░░░░  ~25%
  Plan & Design  █████░░░░░░░░░░░░░░░  ~12%
  Write Docs  ██░░░░░░░░░░░░░░░░░░  ~8%

Top Skills & Commands:
  /clear              ████████████████████  92x/month
  /exit               ██████░░░░░░░░░░░░░░  32x/month
  /git-merge          █████░░░░░░░░░░░░░░░  29x/month
  /plugin             ████░░░░░░░░░░░░░░░░  21x/month
  /mcp                ████░░░░░░░░░░░░░░░░  20x/month

Top MCP Servers:
  Notion             ████████████████████  236 calls
  Slack              ██░░░░░░░░░░░░░░░░░░  24 calls
  Supabase           █░░░░░░░░░░░░░░░░░░░  15 calls
  Shrimp Task Mgr    █░░░░░░░░░░░░░░░░░░░  9 calls

## Your Setup Checklist

### Codebases
- [ ] tiercup — https://github.com/burningfalls/tiercup

### MCP Servers to Activate
- [ ] **Notion** (`plugin_Notion_notion`) — 개발 로그 작성, ROADMAP 시각화, 설계 문서 관리에 사용. Claude Code 설정에서 Notion MCP 플러그인을 연결하고 Notion 워크스페이스 접근 권한을 부여받아야 함.
- [ ] **Slack** (`plugin_slack_slack`) — 작업 완료 알림 전송, 채널 메시지 조회에 사용. Slack MCP 플러그인 연결 후 팀 워크스페이스 접근 권한 필요. `SLACK_WEBHOOK_URL` 환경 변수도 `.env.local`에 설정 필요.
- [ ] **Supabase** (`supabase`, `https://mcp.supabase.com`) — DB 스키마 조회, 마이그레이션 실행, 테이블 관리에 사용. Supabase MCP에 프로젝트 접근 권한 필요.
- [ ] **Shrimp Task Manager** (`shrimp-task-manager`) — ROADMAP.md의 Task를 실행 단위로 세분화하고 의존관계를 파악하는 데 사용. 로컬 MCP 서버로 `npx @shrimp-task-manager/mcp` 형태로 실행.
- [ ] **Context7** (`plugin_context7-plugin_context7`) — Next.js, Supabase 등 라이브러리 최신 문서를 실시간으로 조회하는 데 사용. Context7 플러그인 연결 필요.

### Skills to Know About
- `/git-merge` — 현재 feature 브랜치의 PR을 squash merge하고, 원격/로컬 브랜치를 삭제한 뒤 base 브랜치를 pull. Task 구현 완료 후 항상 `/clear` 먼저 실행하고 이 스킬을 사용 (토큰 절약).
- `/git-pr` — 현재 브랜치 기반으로 PR을 자동 생성. 커밋 목록을 분석해 제목과 본문을 자동 작성.
- `/git-commit` — staged 여부 관계없이 전체 변경사항을 논리 단위로 분류해 자동 커밋.
- `/git-deep-review-pr [PR번호]` — Codex(1차 독립 리뷰) → code-reviewer 에이전트(2차 동의/반박/보완) → PR 인라인 코멘트 자동 게시의 이중 검증 파이프라인. PR 올리고 나서 실행.
- `/code-review-pr [PR번호]` — 코드 리뷰 결과를 GitHub PR 인라인 코멘트로 게시. deep-review보다 가볍게 쓸 때 사용.
- `/session-report:session-report` — 최근 세션의 토큰 소모, 스킬별 비용, 최고 비용 프롬프트를 리포트로 생성. 비용이 많이 나온다 싶으면 실행해서 원인 파악.
- `/clear` — 컨텍스트 초기화. `/git-merge`, `/git-pr` 같은 단순 작업 전에 먼저 실행하면 토큰 비용 절감.
- `/notion-dev-log` — 커밋 기반으로 Notion에 개발 로그를 자동 작성.
- `/claude-md-management:claude-md-improver` — CLAUDE.md 파일 품질을 감사하고 개선.

## Team Tips

_TODO_

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
