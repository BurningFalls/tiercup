# TierCup MVP 개발 로드맵

## 프로젝트 개요

- **서비스명**: TierCup
- **목적**: 로그인 없이 누구나 아이템을 1:1 비교하여 위상정렬 기반 S~F 티어를 자동 생성하는 플랫폼
- **기술 스택**: Next.js 15 (App Router) · TypeScript · React 19 · TailwindCSS v4 · shadcn/ui · Supabase · Vercel
- **시작일**: 2026-05-11

---

## 전체 진행 현황

| Phase | 내용 | 진행 상태 | Task 수 |
|-------|------|-----------|---------|
| Phase 1 | 프로젝트 초기 설정 및 골격 구축 | 완료 | 5 |
| Phase 2 | 핵심 기능 구현 | 진행중 | 15 |
| Phase 3 | 부가 기능 구현 | 미시작 | 8 |
| Phase 4 | UI/UX 완성도 향상 및 최적화 | 미시작 | 4 |
| Phase 5 | 배포 및 런칭 | 미시작 | 3 |
| **합계** | | | **35** |

**전체 진행률**: 13 / 35 완료 (37%)

---

## 기능 ID ↔ Task 매핑

| 기능 ID | 기능명 | 관련 Task |
|---------|--------|-----------|
| F001 | 티어컵 생성 | Task 009, Task 014, Task 015 |
| F002 | 1:1 비교 플레이 | Task 010, Task 019 |
| F003 | 위상정렬 티어 자동 계산 | Task 016, Task 019 |
| F004 | 최적 비교 순서 결정 | Task 017, Task 019 |
| F005 | 조기 종료 | Task 010, Task 019 |
| F006 | 결과 확인 | Task 011, Task 020 |
| F007 | 결과 수동 수정 | Task 012, Task 021 |
| F008 | 결과 공유 | Task 011, Task 020 |
| F009 | 티어컵 공유 | Task 007, Task 018 |
| F010 | 티어컵 목록 및 탐색 | Task 007, Task 008, Task 018 |
| F011 | 통계 조회 | Task 013, Task 022 |
| F012 | 좋아요 | Task 023 |
| F013 | 티어컵 수정 및 삭제 | Task 014, Task 024 |

---

## Phase 1. 프로젝트 초기 설정 및 골격 구축

> 개발 환경 구성, 라우트 구조 확립, 공통 타입/스키마/유틸 정의, Supabase 인프라 구축

### Task 001 — 개발 환경 설정

- [x] Next.js 15 + TypeScript + TailwindCSS v4 프로젝트 초기화
- [x] shadcn/ui 설치 및 기본 컴포넌트 설정 (Button, Card, Dialog 등)
- [x] Lucide React, @dnd-kit/core, React Hook Form, Zod 패키지 설치
- [x] ESLint / Prettier 설정
- [x] 절대 경로 임포트 설정 (`@/`)
- [x] 환경 변수 파일 구성 (`.env.local`, `.env.example`)

### Task 002 — 라우트 골격 구축

- [x] App Router 기반 전체 페이지 라우트 골격 생성
  - `/` — 메인 페이지
  - `/explore` — 전체 티어컵 페이지
  - `/create` — 새 티어컵 만들기 페이지
  - `/create/complete` — 티어컵 만들기 완료 페이지
  - `/play/[playCode]` — 플레이 화면
  - `/result/[resultCode]` — 결과 페이지
  - `/stats/[playCode]` — 통계 페이지
  - `/manage/[manageCode]` — 티어컵 수정 페이지
- [x] 공통 레이아웃(`layout.tsx`) 및 내비게이션 컴포넌트 구조 확립
- [x] 404 / 에러 페이지 기본 구성

### Task 003 — 공통 타입 및 Zod 스키마 정의

- [x] 도메인 타입 정의 (`TierCup`, `Item`, `PlaySession`, `Comparison`, `PlayResult`, `Like`)
- [x] 티어 타입 정의 (`Tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | '?'`)
- [x] API 요청/응답 타입 정의
- [x] Zod 스키마 정의 (제목 30자 제한, 아이템 4~64개 범위, 이미지 5MB 제한 등)
- [x] nanoid 기반 코드 생성 유틸 (play_code 6자, manage_code 12자, result_code 6자)

### Task 004 — Supabase 데이터베이스 및 Storage 구축

- [x] Supabase 프로젝트 생성 및 연결 설정
- [x] DB 테이블 생성 마이그레이션 작성 및 적용
  - `tier_cups`: id, play_code, manage_code, title, play_count, like_count, created_at, updated_at
  - `items`: id, tier_cup_id, name, image_url, display_order, created_at
  - `play_sessions`: id, tier_cup_id, result_code, status, comparison_count, started_at, completed_at
  - `comparisons`: id, play_session_id, winner_item_id, loser_item_id, created_at
  - `play_results`: id, play_session_id, item_id, tier, tier_order
  - `likes`: id, tier_cup_id, client_id, created_at (UNIQUE: tier_cup_id + client_id)
- [x] Supabase Storage 버킷 생성 및 이미지 업로드 정책 설정
- [x] Supabase 클라이언트 초기화 (`lib/supabase.ts`)

### Task 005 — 공통 유틸 및 헬퍼 함수 구현

- [x] client_id 생성 및 localStorage 저장/조회 유틸 (UUID v4)
- [x] 클립보드 복사 유틸
- [x] 날짜/시간 포맷 유틸 (소요 시간 계산)
- [x] 이미지 유효성 검사 유틸 (형식: JPG/PNG/GIF, 크기: 5MB 이하)
- [x] Supabase Route Handler 클라이언트 유틸 (`lib/supabase-server.ts`)

---

## Phase 2. 핵심 기능 구현

> 티어컵 생성·관리, 1:1 비교 플레이, 위상정렬 알고리즘, 결과 확인·수정·공유

### Task 006 — 공통 UI 컴포넌트 구현

- [x] 내비게이션 바 (홈, 전체 탐색, + 새 티어컵 만들기)
- [x] 티어컵 카드 컴포넌트 (썸네일, 제목, play_count, like_count, 공유/좋아요/통계 버튼)
- [x] 페이지네이션 컴포넌트
- [x] 검색바 컴포넌트
- [x] 이탈 경고 모달 컴포넌트
- [x] 티어 배지 컴포넌트 (S/A/B/C/D/F/?)

### Task 007 — 메인 페이지 구현 (F009, F010, F012)

- [x] 인기순 / 좋아요순 / 최신순 각 4개 카드 섹션 레이아웃
- [x] 각 섹션 [더보기] 버튼 (전체 티어컵 페이지 이동, 정렬 탭 유지)
- [x] 검색바 (키워드 검색 → 전체 티어컵 페이지 이동)
- [x] [+ 새 티어컵 만들기] 버튼
- [x] 카드별 공유 버튼 / 좋아요 버튼 / 통계 버튼

### Task 008 — 전체 티어컵 페이지 구현 (F009, F010, F012)

- [x] 정렬 탭 3개: 인기순 / 좋아요순 / 최신순 (쿼리 파라미터 `sort` 반영)
- [x] 검색바
- [x] 12개씩 페이지네이션
- [x] 카드별 공유 / 좋아요 / 통계 버튼

### Task 009 — 새 티어컵 만들기 페이지 구현 (F001)

- [x] 제목 입력 (최대 30자, 글자 수 카운터)
- [x] 아이템 입력 폼: 이미지 업로드(JPG/PNG/GIF, 5MB 이하) + 이름 입력
- [x] 아이템 추가/삭제 버튼
- [x] 최소 4개 미충족 시 [만들기] 버튼 비활성화
- [x] 이탈 경고 모달 (변경사항 유실 안내)
- [x] React Hook Form + Zod 유효성 검증 연동

### Task 010 — 플레이 화면 구현 (F002, F003, F004, F005)

- [x] 두 아이템 카드 표시 (이미지 + 이름)
- [x] 클릭 시 0.3초 하이라이트 애니메이션 처리
- [x] 우측 사이드바: 전체 아이템 현재 티어 실시간 표시 (초기값 ?)
- [x] 진행률 표시 (현재 비교 횟수 / 예상 총 비교 횟수)
- [x] [지금 결과 확정하기] 버튼 (미비교 아이템 ? 티어 처리)
- [x] 이탈 경고 모달 (진행 상황 유실 안내)

### Task 011 — 결과 페이지 구현 (F006, F008, F012)

- [x] 확정된 S~F 티어 표시 (? 티어 아이템 숨김)
- [x] 통계 표시: 비교 횟수, 총 항목 수, 소요 시간
- [x] [티어 수정] / [다시하기] / [공유하기] 버튼
- [x] 공유 모달: result_code 기반 링크 클립보드 복사
- [x] 공유 링크 접속 시 읽기 전용 모드 + [나도 해보기] 버튼 고정 표시
- [x] 좋아요 버튼

### Task 012 — 결과 수정 페이지 구현 (F007)

- [x] @dnd-kit/core 기반 드래그앤드롭으로 아이템 개별 티어 이동
- [x] 티어 단위 일괄 이동
- [x] 변경사항 있을 때 [취소] 클릭 시 확인 모달
- [x] [저장] / [취소] 버튼

### Task 013 — 통계 페이지 구현 (F011)

- [x] 아이템별 티어 분포 히트맵 (S~F 각 티어 배치 비율)
- [x] 재미있는 통계: S티어 1위, F티어 1위, 가장 치열한 대결
- [x] 집계 지표: 전체 참여자 수, 총 비교 횟수, 평균 소요 시간
- [x] [나도 해보기] 버튼

### Task 014 — 티어컵 만들기 완료 페이지 구현 (F001)

- [x] 공유 링크 표시 및 클립보드 복사 버튼
- [x] 관리 링크 표시 및 클립보드 복사 버튼 (재확인 불가 경고 문구)
- [x] [지금 바로 플레이하기] 버튼

### Task 015 — 티어컵 생성 API 구현 (F001)

- [x] `POST /api/tier-cups` — 티어컵 생성 (play_code + manage_code 발급)
- [x] `POST /api/tier-cups/:id/items` — 아이템 생성 (이미지 Supabase Storage 업로드)

### Task 016 — 위상정렬 알고리즘 구현 (F003)

- [x] 비교 결과 방향 그래프 구성
- [x] BFS 위상정렬로 계층 계산
- [x] 비율 기반 S~F 티어 매핑 로직
- [x] Route Handler에서 실행 후 결과 반환

### Task 017 — 최적 비교 순서 결정 알고리즘 구현 (F004)

- [x] 토너먼트 방식(n-1번) 비교 순서 생성
- [x] 같은 계층 내 세분화 로직
- [x] 이미 관계 있는 쌍 건너뜀 처리

### Task 018 — 티어컵 목록/탐색 API 구현 (F009, F010)

- [x] `GET /api/tier-cups` — 목록 조회 (정렬: popular/likes/latest, 페이지네이션, 검색)
- [x] `GET /api/tier-cups/:playCode` — 단건 조회

### Task 019 — 플레이 세션 및 비교 API 구현 (F002, F004, F005)

- [x] `POST /api/play-sessions` — 세션 생성 (result_code 발급)
- [x] `GET /api/play-sessions/:resultCode/next-pair` — 다음 비교 쌍 반환
- [x] `POST /api/play-sessions/:resultCode/comparisons` — 비교 결과 저장 + 위상정렬 재계산
- [x] `POST /api/play-sessions/:resultCode/complete` — 조기 종료 또는 완료 처리

### Task 020 — 결과 조회 및 공유 API 구현 (F006, F008)

- [ ] `GET /api/play-sessions/:resultCode` — 결과 조회 (티어 목록 + 통계)
- [ ] `PATCH /api/play-sessions/:resultCode/results` — 수동 수정 결과 저장

### Task 021 — 결과 수정 API 구현 (F007)

- [ ] `PATCH /api/play-sessions/:resultCode/results` — 드래그앤드롭 수정 결과 저장

### Task 022 — 통계 API 구현 (F011)

- [ ] `GET /api/tier-cups/:playCode/stats` — 전체 참여 결과 집계 통계 반환

### Task 023 — 좋아요 API 구현 (F012)

- [ ] `POST /api/tier-cups/:id/likes` — 좋아요 추가 (client_id 기반 중복 방지)
- [ ] `DELETE /api/tier-cups/:id/likes` — 좋아요 취소
- [ ] IP 기반 rate limiting 적용

### Task 024 — 티어컵 수정/삭제 API 구현 (F013)

- [ ] `GET /api/manage/:manageCode` — 티어컵 정보 조회 (manage_code 검증)
- [ ] `PATCH /api/manage/:manageCode` — 제목/아이템 수정
- [ ] `DELETE /api/manage/:manageCode` — 티어컵 삭제
- [ ] 티어컵 수정 페이지 UI ↔ API 통합

---

## Phase 3. 부가 기능 구현

> 좋아요, 통계, 공유, UI ↔ API 통합, E2E 검증

### Task 025 — 메인/탐색 페이지 UI ↔ API 통합

- [ ] 메인 페이지: 인기순/좋아요순/최신순 각 4개 카드 실데이터 연동
- [ ] 전체 티어컵 페이지: 정렬·검색·페이지네이션 API 연동
- [ ] 공유 버튼 (클립보드 복사) 동작 확인
- [ ] 좋아요 버튼 (client_id, API, 낙관적 업데이트) 동작 확인

### Task 026 — 플레이 화면 UI ↔ API 통합

- [ ] 세션 생성 → 첫 비교 쌍 수신 → 표시
- [ ] 클릭 → 비교 결과 저장 → 위상정렬 결과 수신 → 사이드바 갱신
- [ ] 진행률 계산 및 표시
- [ ] 조기 종료 처리 → 결과 페이지 이동
- [ ] 모든 비교 완료 → 자동 결과 페이지 이동

### Task 027 — 결과 페이지 UI ↔ API 통합

- [ ] resultCode로 결과 조회 및 표시
- [ ] 플레이 완료 모드 vs 공유 링크 모드 분기 처리
- [ ] [다시하기] → 새 세션 생성 후 플레이 화면 이동
- [ ] [나도 해보기] → 동일 play_code로 새 세션 생성 후 플레이 화면 이동

### Task 028 — 결과 수정 페이지 UI ↔ API 통합

- [ ] 드래그앤드롭 변경사항 서버 저장 연동
- [ ] 저장 성공 → 결과 페이지 복귀

### Task 029 — 통계 페이지 UI ↔ API 통합

- [ ] 통계 API 데이터 → 히트맵 및 통계 카드 렌더링 연동
- [ ] [나도 해보기] → 플레이 화면 이동 처리

### Task 030 — 티어컵 수정 페이지 UI ↔ API 통합

- [ ] 기존 제목/아이템 불러와 편집 폼 표시
- [ ] 아이템 추가/삭제 처리
- [ ] 티어컵 삭제 확인 모달 → 삭제 후 메인 이동
- [ ] 저장 성공 메시지 처리

### Task 031 — play_count 증가 처리

- [ ] 플레이 세션 생성 시 `tier_cups.play_count` +1 처리

### Task 032 — E2E 주요 흐름 검증

- [ ] 티어컵 생성 → 플레이 → 결과 확인 → 공유 흐름 검증
- [ ] 공유 링크 접속 → [나도 해보기] → 플레이 흐름 검증
- [ ] 관리 링크 접속 → 수정/삭제 흐름 검증
- [ ] 좋아요 중복 방지 검증

---

## Phase 4. UI/UX 완성도 향상 및 최적화

> 반응형, 접근성, 성능, 에러 상태, SEO

### Task 033 — 반응형 디자인 및 접근성

- [ ] 모바일/태블릿/데스크톱 반응형 레이아웃 점검 및 보완
- [ ] 키보드 접근성 및 포커스 관리 확인
- [ ] 이미지 alt 속성, aria 레이블 처리

### Task 034 — 에러 상태 및 빈 상태 처리

- [ ] 유효하지 않은 play_code / result_code / manage_code 접근 시 에러 페이지
- [ ] 티어컵이 없을 때 빈 상태 UI
- [ ] API 오류 시 사용자 피드백 (토스트 등)
- [ ] 이미지 로딩 실패 처리

### Task 035 — 성능 최적화

- [ ] Next.js Image 컴포넌트를 이용한 이미지 최적화
- [ ] 목록 페이지 데이터 캐싱 전략 수립 (Next.js `fetch` 캐시 옵션)
- [ ] Suspense / 스켈레톤 로딩 UI 적용

---

## Phase 5. 배포 및 런칭

> Vercel 배포, 모니터링, 보안 점검

### Task 036 — SEO 및 메타데이터 설정

- [ ] 각 페이지 메타 태그 설정 (`metadata` API)
- [ ] OG(Open Graph) 이미지 설정 (공유 시 미리보기)
- [ ] robots.txt / sitemap.xml 설정

### Task 037 — Vercel 배포 설정

- [ ] Vercel 프로젝트 생성 및 GitHub 연결
- [ ] 환경 변수 Vercel에 등록 (Supabase URL, Supabase Anon Key 등)
- [ ] 프로덕션 배포 후 전체 흐름 검증

### Task 038 — 보안 및 모니터링

- [ ] 좋아요 API rate limiting 적용 확인 (Upstash Ratelimit + Redis 또는 Supabase Edge Functions)
- [ ] Supabase RLS(Row Level Security) 정책 검토
- [ ] 이미지 업로드 MIME 타입 서버사이드 검증
- [ ] Vercel Analytics 또는 외부 모니터링 도구 연동

---

*최종 업데이트: 2026-05-11*
