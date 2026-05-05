---
name: notion-dev-log
description: 최근 커밋을 분석해서 Notion에 개발 로그를 기록합니다. 커밋 1개당 Notion DB 행 1개를 생성합니다. "노션에 개발 로그 남겨줘", "커밋 기록 정리해줘", "개발 로그 기록해줘", "notion-dev-log" 등의 요청에 사용하세요. 마지막으로 기록한 커밋 이후의 새 커밋만 대상으로 합니다.
---

## 고정값

- **Notion DB ID**: `356f6ba9bd6780b0a755c675c81cc1eb`
- **Notion Data Source ID**: `356f6ba9-bd67-809d-89f6-000b1d3392fb`
- **GitHub 리포지토리**: `https://github.com/BurningFalls/tiercup`
- **커밋 링크 형식**: `https://github.com/BurningFalls/tiercup/commit/{전체 해시}`
- **상태 파일**: `.claude/skills/notion-dev-log/notion-dev-log-state.json`

---

## 1단계: 커밋 범위 파악

`.claude/skills/notion-dev-log/notion-dev-log-state.json` 읽기를 시도합니다:

```bash
cat .claude/skills/notion-dev-log/notion-dev-log-state.json 2>/dev/null
```

**`last_commit_hash`가 비어있거나 파일이 없는 경우** (첫 실행):

```bash
git log --format="%H|%h|%s|%ad" --date=short -20
```

**`last_commit_hash` 값이 있는 경우**:

```bash
git log {last_commit_hash}..HEAD --format="%H|%h|%s|%ad" --date=short
```

대상 커밋이 없으면 즉시 중단합니다:

> "기록할 새 커밋이 없습니다. (마지막 기록 커밋: {last_commit_hash})"

---

## 2단계: 각 커밋 분석

각 커밋에 대해 다음을 수행합니다.

### type 분류

커밋 메시지의 conventional commit prefix를 파싱합니다 (`feat:`, `fix:` 등).
prefix가 없으면 메시지 내용을 보고 추론합니다.

| type | 사용 시점 |
|------|----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서만 변경 |
| `style` | 포맷팅, 세미콜론 등 |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 의존성, 설정 |
| `perf` | 성능 개선 |

### 변경 파일 파악

```bash
git show --stat {hash} --format=""
```

### 영역 추론

파일 경로 기준으로 영역을 분류합니다:

| 경로 패턴 | 영역 |
|----------|------|
| `app/`, `components/`, `pages/` | frontend |
| `lib/`, `server/`, `api/` | backend |
| `.claude/`, `*.config.*`, `*.json` | config |
| `docs/`, `*.md` | docs |

### 한글 제목 생성

커밋 메시지를 그대로 옮기지 않고 의미를 풀어서 **한글**로 설명합니다.
- 50자 이내, 명사형으로 끝냄
- 예: `사용자 인증 미들웨어 추가`, `로그인 페이지 레이아웃 구현`

---

## 3단계: Notion DB 스키마 확인 및 준비

```
Notion:notion-fetch
id: "356f6ba9bd6780b0a755c675c81cc1eb"
```

현재 DB 스키마를 확인하고, 아래 컬럼이 없으면 `Notion:notion-update-data-source`로 추가합니다:

```sql
ADD COLUMN "날짜" DATE;
ADD COLUMN "타입" MULTI_SELECT('feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf');
ADD COLUMN "영역" MULTI_SELECT('frontend', 'backend', 'config', 'docs', 'infra');
ADD COLUMN "커밋 해시" RICH_TEXT;
ADD COLUMN "GitHub 링크" RICH_TEXT;
```

- `제목` 컬럼(기본 Title)은 항상 존재하므로 추가하지 않습니다.
- 이미 존재하는 컬럼은 건너뜁니다.
- multi_select 옵션은 반드시 컬럼 추가 시 함께 지정합니다.

---

## 4단계: Notion에 커밋별 행 생성

각 커밋에 대해 순서대로 처리합니다.

### 중복 확인

```
Notion:notion-search
query: "{short_hash}"
data_source_url: "collection://356f6ba9-bd67-809d-89f6-000b1d3392fb"
```

검색 결과에 해당 short hash가 이미 있으면 **skip**합니다.

### 신규 행 생성

```
Notion:notion-create-pages
parent: { data_source_id: "356f6ba9-bd67-809d-89f6-000b1d3392fb" }
pages: [{
  properties: {
    "제목": "{한글 설명}",
    "date:날짜:start": "{커밋 날짜}",
    "date:날짜:is_datetime": 0,
    "타입": "["{type}"]",
    "영역": "["{영역1}", "{영역2}", ...]",
    "커밋 해시": "{short_hash}",
    "GitHub 링크": "https://github.com/BurningFalls/tiercup/commit/{전체 해시}"
  },
  content: "## 작업 내용\n\n- {한 일 1 (명사형, 예: TypeScript 설정 추가)}\n- {한 일 2}\n- ...\n\n변경 파일과 diff를 분석해서 무엇을 했는지 bullet 명사형으로 정리. 파일 목록 나열 금지. '~했다' 형태 금지."
}]
```

**제목 규칙**:
- 한글로 풀어 쓴 설명만 (예: `사용자 인증 미들웨어 추가`, `로그인 페이지 레이아웃 구현`)
- 50자 이내, 명사형으로 끝냄

**커밋 해시 규칙**:
- `커밋 해시` 컬럼에는 **short hash** (7자, 예: `a1b2c3d`) 사용
- `GitHub 링크` 컬럼에는 **전체 해시** 기반 URL 사용

---

## 5단계: 상태 파일 업데이트

가장 최신 커밋의 전체 해시와 오늘 날짜를 상태 파일에 저장합니다:

```bash
printf '%s' '{"last_commit_hash":"{최신 전체 해시}","last_run_date":"{오늘 날짜}"}' > .claude/skills/notion-dev-log/notion-dev-log-state.json
```

---

## 6단계: 결과 안내

처리 결과를 사용자에게 안내합니다:

> "커밋 {N}개 기록 완료"
> - `{short_hash}`: {한글 설명} → {Notion 페이지 URL}
> - `{short_hash}`: {한글 설명} → {Notion 페이지 URL}
