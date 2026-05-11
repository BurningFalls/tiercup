# TierCup Development Guidelines

## 1. Project Overview

- **Service**: 로그인 없이 아이템 1:1 비교 → 위상정렬 기반 S~F 티어 자동 생성 플랫폼
- **Stack**: Next.js 15 (App Router) · TypeScript · React 19 · TailwindCSS v4 · shadcn/ui · Supabase (PostgreSQL + Storage) · Vercel
- **Auth**: 없음. 접근 제어는 URL 코드(play_code / manage_code / result_code)로만 구분

---

## 2. Project Architecture

### 2.1 Directory Structure

```
tiercup/
├── app/                        # Next.js App Router (src/ 폴더 없음)
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈 (/)
│   ├── globals.css
│   ├── api/                    # Route Handlers (API 엔드포인트)
│   │   ├── main/route.ts
│   │   ├── tier-cups/
│   │   │   ├── route.ts
│   │   │   ├── manage/[manageCode]/route.ts
│   │   │   └── [playCode]/
│   │   │       ├── like/route.ts
│   │   │       └── stats/route.ts
│   │   ├── play/
│   │   │   ├── [playCode]/start/route.ts
│   │   │   └── [sessionId]/
│   │   │       ├── compare/route.ts
│   │   │       ├── status/route.ts
│   │   │       └── complete/route.ts
│   │   └── results/
│   │       └── [resultCode]/route.ts
│   ├── explore/page.tsx        # 전체 티어컵 탐색
│   ├── create/
│   │   ├── page.tsx            # 새 티어컵 만들기
│   │   └── complete/page.tsx   # 만들기 완료
│   ├── play/[playCode]/page.tsx
│   ├── result/[resultCode]/page.tsx
│   ├── stats/[playCode]/page.tsx
│   └── manage/[manageCode]/page.tsx
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트 (자동 생성, 직접 수정 금지)
│   ├── layout/                 # 헤더, 푸터, 컨테이너
│   ├── navigation/             # 내비게이션 바
│   ├── tier-cup/               # 티어컵 관련 컴포넌트
│   ├── play/                   # 플레이 화면 컴포넌트
│   └── result/                 # 결과/수정 페이지 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   ├── server.ts           # 서버 컴포넌트/Route Handler 클라이언트
│   │   └── proxy.ts
│   ├── types/                  # 도메인 타입 정의
│   ├── schemas/                # Zod 스키마
│   ├── utils/                  # 유틸리티 함수
│   └── utils.ts                # cn() 등 공통 유틸
└── docs/                       # 설계 문서 (수정 금지)
```

### 2.2 Route Structure

| URL | 페이지 |
|-----|--------|
| `/` | 메인 페이지 |
| `/explore` | 전체 티어컵 탐색 |
| `/create` | 새 티어컵 만들기 |
| `/create/complete` | 티어컵 만들기 완료 |
| `/play/[playCode]` | 플레이 화면 |
| `/result/[resultCode]` | 결과 페이지 (플레이완료 + 공유링크 분기) |
| `/stats/[playCode]` | 통계 페이지 |
| `/manage/[manageCode]` | 티어컵 수정 페이지 |

---

## 3. Database Schema

**절대 직접 SQL 작성 금지. Supabase MCP로 마이그레이션 적용.**

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `tier_cups` | id, play_code(6자), manage_code(12자), title(30자), play_count, like_count |
| `items` | id, tier_cup_id(FK), name, image_url, display_order |
| `play_sessions` | id, tier_cup_id(FK), result_code(6자), status('playing'/'completed'), comparison_count |
| `comparisons` | id, play_session_id(FK), winner_item_id(FK), loser_item_id(FK) |
| `play_results` | id, play_session_id(FK), item_id(FK), tier('S'/'A'/'B'/'C'/'D'/'F'/'?'), tier_order |
| `likes` | id, tier_cup_id(FK), client_id, UNIQUE(tier_cup_id, client_id) |

**코드 생성**: nanoid 사용 — play_code 6자, manage_code 12자, result_code 6자

---

## 4. API Endpoints

### 메인/티어컵

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/main` | 메인 페이지 (인기/좋아요/최신 각 4개) |
| GET | `/api/tier-cups` | 목록 조회 (`sort=popular/likes/recent`, `page`, `client_id`) |
| POST | `/api/tier-cups` | 티어컵 생성 → `{play_code, manage_code}` 반환 |
| GET | `/api/tier-cups/manage/[manageCode]` | 관리 정보 조회 |
| PUT | `/api/tier-cups/manage/[manageCode]` | 티어컵 수정 |
| DELETE | `/api/tier-cups/manage/[manageCode]` | 티어컵 삭제 |

### 플레이

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/play/[playCode]/start` | 세션 생성 → `{session_id, result_code, items, first_match}` |
| POST | `/api/play/[sessionId]/compare` | 비교 결과 제출 → `{comparison_count, current_tiers, next_match, is_complete}` |
| GET | `/api/play/[sessionId]/status` | 현재 상태 조회 |
| POST | `/api/play/[sessionId]/complete` | 조기 종료 → `{result_code}` |

### 결과/통계/좋아요

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/results/[resultCode]` | 결과 조회 → `{play_code, title, tiers, comparison_count}` |
| PUT | `/api/results/[resultCode]` | 결과 수정 (드래그앤드롭 저장) |
| GET | `/api/stats/[playCode]` | 통계 조회 → `{summary, item_stats, fun_stats}` |
| POST | `/api/tier-cups/[playCode]/like` | 좋아요 추가 |
| DELETE | `/api/tier-cups/[playCode]/like` | 좋아요 취소 |

**오류 응답 형식** (모든 API 통일):
```json
{ "error": { "code": "ERROR_CODE", "message": "사용자 메시지" } }
```

---

## 5. Core Algorithm (위상정렬 티어 계산)

**위치**: 반드시 Route Handler(서버)에서 실행. 클라이언트는 결과 표시만.

### 구현 순서

1. `comparisons` 테이블에서 해당 세션의 모든 비교 결과 조회
2. winner→loser 방향 그래프 구성 (indegree 계산)
3. BFS 위상정렬로 계층(layer) 계산 (0계층 = 아무도 안 이긴 아이템)
4. 계층 순서대로 줄세우기 → `비율 = 순위 / 전체아이템수`
5. 비율 기반 티어 매핑: `~15%=S, ~30%=A, ~50%=B, ~70%=C, ~85%=D, ~100%=F`
6. 비교 안 된 아이템은 `?` 티어

### 비교 순서 알고리즘

- **1단계**: 토너먼트 방식(n-1번) — 같은 계층의 아이템끼리 순차 비교
- **2단계**: 같은 계층 내 세분화 — 이미 방향 경로가 있는 쌍은 건너뜀
- 상위 계층 우선 정리

---

## 6. Supabase Client Usage

```typescript
// Server Component / Route Handler에서
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component에서
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

- **Route Handler**: 반드시 `server.ts` 클라이언트 사용
- **'use client' 컴포넌트**: `client.ts` 사용
- **이미지 업로드**: Supabase Storage, JPG/PNG/GIF만 허용, 5MB 이하

---

## 7. Component Rules

### Server vs Client 분리

- 기본값: Server Component
- `useState`, `useEffect`, 이벤트 핸들러 필요 시만 `'use client'` 추가
- 위상정렬, 통계 계산, DB 조회는 서버에서

### 컴포넌트 위치

| 유형 | 위치 |
|------|------|
| shadcn/ui 기본 컴포넌트 | `components/ui/` |
| 공통 레이아웃 | `components/layout/` |
| 내비게이션 | `components/navigation/` |
| 티어컵 카드, 목록 | `components/tier-cup/` |
| 플레이 화면 | `components/play/` |
| 결과/수정 화면 | `components/result/` |

### 드래그앤드롭

- 결과 수정 페이지에서만 사용: `@dnd-kit/core`
- 아이템 개별 티어 이동 + 티어 단위 일괄 이동 모두 지원

---

## 8. Form & Validation

- **폼 상태**: React Hook Form 7.x
- **검증**: Zod 스키마
- **제약**:
  - 티어컵 제목: 최대 30자
  - 아이템 수: 최소 4개, 최대 64개
  - 이미지: JPG/PNG/GIF, 5MB 이하
  - 아이템 이름: 최대 50자

---

## 9. Naming & Code Conventions

- **파일명**: kebab-case (`tier-cup-card.tsx`)
- **컴포넌트명**: PascalCase (`TierCupCard`)
- **폴더명**: kebab-case 또는 소문자
- **DB 컬럼 / API 필드**: snake_case
- **TypeScript 타입/인터페이스**: PascalCase
- **Import**: 경로 별칭 `@/` 필수 (상대경로 `../` 금지)
- **Export**: Named export 기본, 페이지 컴포넌트만 default export

---

## 10. Key Constraints

- **인증 없음**: 모든 페이지/API 인증 불필요
- **좋아요 중복 방지**: localStorage UUID(client_id) + DB UNIQUE(tier_cup_id, client_id)
- **좋아요 rate limiting**: IP 기반 (Upstash Ratelimit + Redis 또는 Supabase Edge Functions)
- **manage_code 재확인 불가**: 티어컵 완료 페이지에서 한 번만 표시, 재조회 불가
- **위상정렬은 서버에서만**: 클라이언트에서 직접 계산 금지
- **play_count 증가**: 세션 생성(`POST /api/play/[playCode]/start`) 시 +1
- **조기 종료**: 미비교 아이템은 `?` 티어로 저장, 결과 페이지에서 숨김

---

## 11. File Interaction Rules

### 새 페이지 추가 시

- `app/[route]/page.tsx` 생성
- 필요한 경우 `app/[route]/layout.tsx` 추가
- Route Handler는 `app/api/[path]/route.ts`

### API 엔드포인트 추가 시

- `app/api/` 하위에 `route.ts` 생성
- 반드시 `lib/supabase/server.ts` 클라이언트 사용
- 응답 형식: 성공 `{data}`, 실패 `{error: {code, message}}`

### 타입 추가 시

- 도메인 타입: `lib/types/` 하위 파일
- Zod 스키마: `lib/schemas/` 하위 파일
- API 요청/응답 타입도 `lib/types/`에 정의

### shadcn/ui 컴포넌트 추가 시

- `npx shadcn@latest add [component]` 명령어 사용
- 생성된 파일은 `components/ui/`에 자동 배치
- 직접 수정 최소화, 커스텀은 래핑 컴포넌트로

---

## 12. Prohibited Actions

- `components/ui/` 파일 직접 수정 (shadcn/ui 재생성 시 덮어써짐)
- 클라이언트 컴포넌트에서 위상정렬/통계 계산 실행
- `src/` 폴더 생성 (프로젝트는 루트 `app/` 구조)
- 상대 경로 import (`../../../`) 사용
- snake_case 파일명 사용
- `docs/` 폴더 내 설계 문서 수정
- 인증/세션 쿠키 기반 접근 제어 추가 (play_code/manage_code/result_code URL 방식만 허용)
- manage_code를 URL 파라미터 외의 방식으로 노출
- `?` 티어 아이템을 결과 페이지에서 표시 (반드시 숨김)
