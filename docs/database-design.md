# 티어컵 DB 설계

## 1. 개요

티어컵 서비스의 데이터를 저장하고 관리하기 위한 데이터베이스 설계이다. 

RDB을 사용하며, snake_case 네이밍 컨벤션을 따른다.

---

## 2. 데이터베이스 선택

### 2.1 요구사항 분석

| 요구사항 | 설명 |
| --- | --- |
| 통계 쿼리 | 아이템별 티어 분포, S티어 비율, 가장 치열한 대결 등 |
| 다양한 정렬 | 인기순, 좋아요순, 최신순 |
| 데이터 일관성 | 좋아요 시 likes INSERT + like_count UPDATE 동시 처리 |

### 2.2 RDB vs NoSQL 비교

| 관점 | RDB | NoSQL |
| --- | --- | --- |
| 통계 쿼리 (JOIN, GROUP BY) | ✅ 간단하고 강력 | ⚠️ aggregation 복잡 |
| 다양한 정렬 | ✅ 인덱스로 해결 | ⚠️ 가능하지만 비효율적 |
| 트랜잭션 | ✅ 기본 지원 | ⚠️ 제한적 |
| 스키마 변경 | ⚠️ 마이그레이션 필요 | ✅ 유연함 |
| 수평 확장 | ⚠️ 어려움 | ✅ 쉬움 |

### 2.3 결론

- 통계 쿼리 많음 → RDB 유리
- 정렬 옵션 다양함 → RDB 유리
- 트랜잭션 필요함 → RDB 유리
- 대규모 트래픽 예상 X → 수평 확장 불필요

---

## 3. 테이블 목록

| 테이블명 | 설명 |
| --- | --- |
| tier_cups | 티어컵 정보 |
| items | 티어컵 내 아이템 |
| play_sessions | 플레이 세션 |
| comparisons | 비교 결과 |
| play_results | 최종 결과 (티어 배치) |
| likes | 좋아요 |

---

## 4. 테이블 상세

### 4.1 tier_cups (티어컵)

티어컵의 기본 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| play_code | VARCHAR(10), UNIQUE | 플레이용 코드 (URL에 사용) |
| manage_code | VARCHAR(20), UNIQUE | 관리용 코드 (수정/삭제) |
| title | VARCHAR(30) | 티어컵 제목 |
| play_count | INT, DEFAULT 0 | 총 참여자 수 |
| like_count | INT, DEFAULT 0 | 좋아요 수 |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### 4.2 items (아이템)

티어컵에 포함된 아이템 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| tier_cup_id | BIGINT, FK | 티어컵 ID |
| name | VARCHAR(50) | 아이템 이름 |
| image_url | VARCHAR(500) | 이미지 URL (S3) |
| display_order | INT | 표시 순서 |
| created_at | DATETIME | 생성일 |

### 4.3 play_sessions (플레이 세션)

유저의 플레이 세션 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| tier_cup_id | BIGINT, FK | 티어컵 ID |
| result_code | VARCHAR(10), UNIQUE | 결과 페이지용 코드 |
| status | ENUM('playing', 'completed') | 진행 상태 |
| comparison_count | INT, DEFAULT 0 | 비교 횟수 |
| started_at | DATETIME | 시작 시간 |
| completed_at | DATETIME, NULL | 완료 시간 |

### 4.4 comparisons (비교 결과)

플레이 중 발생한 각 비교의 결과를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| play_session_id | BIGINT, FK | 플레이 세션 ID |
| winner_item_id | BIGINT, FK | 이긴 아이템 ID |
| loser_item_id | BIGINT, FK | 진 아이템 ID |
| created_at | DATETIME | 비교 시간 |

### 4.5 play_results (최종 결과)

플레이 완료 후 각 아이템의 최종 티어 배치를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| play_session_id | BIGINT, FK | 플레이 세션 ID |
| item_id | BIGINT, FK | 아이템 ID |
| tier | ENUM('S', 'A', 'B', 'C', 'D', 'F', '?') | 최종 티어 |
| tier_order | INT | 티어 내 순서 |

### 4.6 likes (좋아요)

티어컵에 대한 좋아요 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGINT, PK, AUTO_INCREMENT | 고유 ID |
| tier_cup_id | BIGINT, FK | 티어컵 ID |
| client_id | VARCHAR(100) | 클라이언트 식별자 (localStorage 기반) |
| created_at | DATETIME | 좋아요 시간 |

**UNIQUE KEY:** (tier_cup_id, client_id)

---

## 5. ERD

```
tier_cups (1) ──── (N) items
    │
    ├──── (N) play_sessions (1) ──── (N) comparisons
    │               │
    │               └──── (N) play_results
    │
    └──── (N) likes
```

---

## 6. 인덱스

```sql
-- tier_cups
CREATE INDEX idx_tier_cups_play_code ON tier_cups(play_code);
CREATE INDEX idx_tier_cups_manage_code ON tier_cups(manage_code);
CREATE INDEX idx_tier_cups_play_count ON tier_cups(play_count DESC);
CREATE INDEX idx_tier_cups_like_count ON tier_cups(like_count DESC);
CREATE INDEX idx_tier_cups_created_at ON tier_cups(created_at DESC);

-- items
CREATE INDEX idx_items_tier_cup_id ON items(tier_cup_id);

-- play_sessions
CREATE INDEX idx_play_sessions_tier_cup_id ON play_sessions(tier_cup_id);
CREATE INDEX idx_play_sessions_result_code ON play_sessions(result_code);

-- comparisons
CREATE INDEX idx_comparisons_play_session_id ON comparisons(play_session_id);

-- play_results
CREATE INDEX idx_play_results_play_session_id ON play_results(play_session_id);

-- likes
CREATE INDEX idx_likes_tier_cup_id ON likes(tier_cup_id);
```

---

## 7. 주요 쿼리

### 7.1 아이템별 S티어 비율 (통계 페이지용)

```sql
SELECT
    i.id,
    i.name,
    COUNT(CASE WHEN pr.tier = 'S' THEN 1 END) * 100.0 / COUNT(*) AS s_tier_rate
FROM items i
JOIN play_results pr ON i.id = pr.item_id
WHERE i.tier_cup_id = ?
GROUP BY i.id, i.name
ORDER BY s_tier_rate DESC;
```

### 7.2 티어컵 목록 조회 (인기순)

```sql
SELECT *
FROM tier_cups
ORDER BY play_count DESC
LIMIT 10;
```

### 7.3 특정 플레이 결과 조회

```sql
SELECT
    pr.tier,
    pr.tier_order,
    i.name,
    i.image_url
FROM play_results pr
JOIN items i ON pr.item_id = i.id
JOIN play_sessions ps ON pr.play_session_id = ps.id
WHERE ps.result_code = ?
ORDER BY
    FIELD(pr.tier, 'S', 'A', 'B', 'C', 'D', 'F', '?'),
    pr.tier_order;
```

---

## 8. 부록: 좋아요 기능 상세

### 8.1 개요

로그인 없이 좋아요 기능을 구현하기 위해 localStorage 기반의 client_id를 사용합니다.

### 8.2 동작 방식

**클라이언트 식별자 생성 (최초 접속 시):**

```jsx
if (!localStorage.getItem('client_id')) {
  localStorage.setItem('client_id', crypto.randomUUID());
}
```

**좋아요 요청:**

```jsx
const clientId = localStorage.getItem('client_id');

fetch('/api/tier-cups/123/like', {
  method: 'POST',
  body: JSON.stringify({ client_id: clientId })
});
```

**서버 처리:**

```sql
-- 좋아요 추가
INSERT INTO likes (tier_cup_id, client_id, created_at)
VALUES (123, 'a1b2c3d4-...', NOW());

-- 카운트 증가
UPDATE tier_cups SET like_count = like_count + 1 WHERE id = 123;
```

### 8.3 중복 방지

UNIQUE KEY (tier_cup_id, client_id) 제약으로 DB 레벨에서 중복을 차단합니다.

### 8.4 한계점

| 상황 | 결과 |
| --- | --- |
| 다른 브라우저로 접속 | 중복 좋아요 가능 |
| localStorage 삭제 | 중복 좋아요 가능 |
| 시크릿 모드 | 중복 좋아요 가능 |

로그인 없는 서비스에서 현실적인 최선의 방법이며, 악의적 어뷰징은 rate limiting으로 방어합니다.
