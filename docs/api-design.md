# API 설계

## 메인

### GET /api/main — 메인 페이지 조회

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| client_id | string | X | 클라이언트 식별자 (좋아요 여부 확인용) |

**Response 성공 (200)**

```json
{
  "popular": [
    {
      "play_code": "dF7kx9",
      "title": "디저트 월드컵",
      "play_count": 1247,
      "like_count": 89,
      "item_count": 16,
      "is_liked": true,
      "thumbnail_items": [
        { "name": "케이크", "image_url": "https://..." },
        { "name": "도넛", "image_url": "https://..." },
        { "name": "아이스크림", "image_url": "https://..." },
        { "name": "마카롱", "image_url": "https://..." }
      ]
    }
  ],
  "most_liked": [
    { "play_code": "...", "title": "...", "play_count": 0, "like_count": 0, "item_count": 0, "is_liked": false, "thumbnail_items": [] }
  ],
  "recent": [
    { "play_code": "...", "title": "...", "play_count": 0, "like_count": 0, "item_count": 0, "is_liked": false, "thumbnail_items": [] }
  ]
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| popular | array | 인기 티어컵 4개 (참여자 수 기준) |
| most_liked | array | 좋아요 많은 티어컵 4개 |
| recent | array | 최근 올라온 티어컵 4개 |

**각 티어컵 객체**

| 필드 | 타입 | 설명 |
|------|------|------|
| play_code | string | 플레이용 코드 (URL에 사용) |
| title | string | 티어컵 제목 |
| play_count | number | 총 참여자 수 |
| like_count | number | 좋아요 수 |
| item_count | number | 아이템 수 |
| is_liked | boolean | 좋아요 여부 (client_id 없으면 false) |
| thumbnail_items | array | 썸네일용 아이템 4개 |

**사용 예시**

```
GET /api/main
GET /api/main?client_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 티어컵

### GET /api/tier-cups — 티어컵 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| sort | string | X | 정렬 기준 (popular, likes, recent) 기본값: popular |
| page | number | X | 페이지 번호 (기본값: 1) |
| client_id | string | X | 클라이언트 식별자 (좋아요 여부 확인용) |

**Response 성공 (200)**

```json
{
  "tier_cups": [
    {
      "play_code": "dF7kx9",
      "title": "디저트 월드컵",
      "play_count": 1247,
      "like_count": 89,
      "item_count": 16,
      "is_liked": true,
      "thumbnail_items": [
        { "name": "케이크", "image_url": "https://..." },
        { "name": "도넛", "image_url": "https://..." },
        { "name": "아이스크림", "image_url": "https://..." },
        { "name": "마카롱", "image_url": "https://..." }
      ]
    }
  ],
  "total_pages": 10,
  "total_count": 192
}
```

**Response 실패 (400)**

```json
{
  "error": {
    "code": "INVALID_SORT",
    "message": "잘못된 정렬 기준입니다."
  }
}
```

**Response 필드 설명**

tier_cups

| 필드 | 타입 | 설명 |
|------|------|------|
| play_code | string | 플레이용 코드 (URL에 사용) |
| title | string | 티어컵 제목 |
| play_count | number | 총 참여자 수 |
| like_count | number | 좋아요 수 |
| item_count | number | 아이템 수 |
| is_liked | boolean | 좋아요 여부 (client_id 없으면 false) |
| thumbnail_items | array | 썸네일용 아이템 4개 |

thumbnail_items

| 필드 | 타입 | 설명 |
|------|------|------|
| name | string | 아이템 이름 |
| image_url | string | 이미지 URL |

페이지네이션

| 필드 | 타입 | 설명 |
|------|------|------|
| total_pages | number | 전체 페이지 수 |
| total_count | number | 전체 티어컵 개수 |

**사용 예시**

```
GET /api/tier-cups
GET /api/tier-cups?sort=likes
GET /api/tier-cups?sort=recent&page=2
GET /api/tier-cups?sort=popular&client_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### POST /api/tier-cups — 티어컵 생성

**Request Body**

```json
{
  "title": "디저트 월드컵",
  "items": [
    { "name": "케이크", "image_url": "https://..." },
    { "name": "도넛", "image_url": "https://..." },
    { "name": "아이스크림", "image_url": "https://..." },
    { "name": "마카롱", "image_url": "https://..." }
  ]
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | O | 티어컵 제목 (최대 30자) |
| items | array | O | 아이템 목록 (최소 4개, 최대 64개) |

items

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | O | 아이템 이름 |
| image_url | string | O | 이미지 URL (S3 업로드 후 URL) |

**Response 성공 (201)**

```json
{
  "play_code": "dF7kx9",
  "manage_code": "Kp3mQ2xL9vRt"
}
```

**Response 실패 (400)**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목은 최대 30자까지 입력할 수 있습니다."
  }
}
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "아이템은 최소 4개, 최대 64개여야 합니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| play_code | string | 플레이용 코드 (공유 링크에 사용) |
| manage_code | string | 관리용 코드 (수정/삭제에 사용, 재확인 불가) |

---

### GET /api/tier-cups/manage/:manageCode — 티어컵 관리 정보 조회

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| manageCode | string | O | 관리용 코드 |

**Response 성공 (200)**

```json
{
  "title": "디저트 월드컵",
  "items": [
    { "id": 1, "name": "케이크", "image_url": "https://..." },
    { "id": 2, "name": "컵케이크", "image_url": "https://..." },
    { "id": 3, "name": "도넛", "image_url": "https://..." },
    { "id": 4, "name": "아이스크림", "image_url": "https://..." },
    { "id": 5, "name": "쿠키", "image_url": "https://..." }
  ]
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 티어컵 제목 |
| items | array | 전체 아이템 목록 |

items

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | 아이템 ID |
| name | string | 아이템 이름 |
| image_url | string | 이미지 URL |

**사용 예시**

```
GET /api/tier-cups/manage/Kp3mQ2xL9vRt
```

---

### PUT /api/tier-cups/manage/:manageCode — 티어컵 수정

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| manageCode | string | O | 관리용 코드 |

**Request Body**

```json
{
  "title": "디저트 월드컵 v2",
  "items": [
    { "id": 1, "name": "케이크", "image_url": "https://..." },
    { "id": 2, "name": "컵케이크 수정", "image_url": "https://..." },
    { "id": 3, "name": "도넛", "image_url": "https://..." },
    { "name": "새 아이템", "image_url": "https://..." }
  ]
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | O | 티어컵 제목 (최대 30자) |
| items | array | O | 아이템 목록 (최소 4개, 최대 64개) |

items

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | number | X | 기존 아이템 ID (없으면 새 아이템) |
| name | string | O | 아이템 이름 |
| image_url | string | O | 이미지 URL |

**처리 규칙**

- id 있음 → 기존 아이템 수정
- id 없음 → 새 아이템 추가
- 기존 id가 요청에 없음 → 해당 아이템 삭제

**Response 성공 (200)**

```json
{
  "message": "티어컵이 수정되었습니다."
}
```

**Response 실패 (400)**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목은 최대 30자까지 입력할 수 있습니다."
  }
}
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "아이템은 최소 4개, 최대 64개여야 합니다."
  }
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**사용 예시**

```
PUT /api/tier-cups/manage/Kp3mQ2xL9vRt
```

---

### DELETE /api/tier-cups/manage/:manageCode — 티어컵 삭제

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| manageCode | string | O | 관리용 코드 |

**Response 성공 (200)**

```json
{
  "message": "티어컵이 삭제되었습니다."
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**사용 예시**

```
DELETE /api/tier-cups/manage/Kp3mQ2xL9vRt
```

---

## 플레이

### POST /api/play/:playCode/start — 플레이 시작

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| playCode | string | O | 티어컵 플레이 코드 |

**Response 성공 (201)**

```json
{
  "session_id": 12345,
  "result_code": "xY9kL2",
  "title": "디저트 월드컵",
  "items": [
    { "id": 1, "name": "케이크", "image_url": "https://..." },
    { "id": 2, "name": "도넛", "image_url": "https://..." },
    { "id": 3, "name": "아이스크림", "image_url": "https://..." },
    { "id": 4, "name": "마카롱", "image_url": "https://..." },
    { "id": 5, "name": "쿠키", "image_url": "https://..." },
    { "id": 6, "name": "푸딩", "image_url": "https://..." },
    { "id": 7, "name": "초콜릿", "image_url": "https://..." },
    { "id": 8, "name": "젤리", "image_url": "https://..." }
  ],
  "first_match": {
    "item_a": { "id": 1, "name": "케이크", "image_url": "https://..." },
    "item_b": { "id": 2, "name": "도넛", "image_url": "https://..." }
  }
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| session_id | number | 플레이 세션 ID (비교 결과 제출 시 사용) |
| result_code | string | 결과 페이지용 코드 |
| title | string | 티어컵 제목 |
| items | array | 전체 아이템 목록 |
| first_match | object | 첫 번째 비교 쌍 |

items

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | 아이템 ID |
| name | string | 아이템 이름 |
| image_url | string | 이미지 URL |

first_match

| 필드 | 타입 | 설명 |
|------|------|------|
| item_a | object | 비교 아이템 A |
| item_b | object | 비교 아이템 B |

**사용 예시**

```
POST /api/play/dF7kx9/start
```

---

### POST /api/play/:sessionId/compare — 비교 결과 제출

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| sessionId | number | O | 플레이 세션 ID |

**Request Body**

```json
{
  "winner_item_id": 1,
  "loser_item_id": 2
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| winner_item_id | number | O | 이긴 아이템 ID |
| loser_item_id | number | O | 진 아이템 ID |

**Response 성공 (200)**

```json
{
  "comparison_count": 5,
  "current_tiers": [
    { "tier": "S", "items": [{ "id": 1, "name": "케이크", "image_url": "https://..." }] },
    { "tier": "A", "items": [{ "id": 3, "name": "아이스크림", "image_url": "https://..." }] },
    { "tier": "B", "items": [
      { "id": 2, "name": "도넛", "image_url": "https://..." },
      { "id": 4, "name": "마카롱", "image_url": "https://..." }
    ]},
    { "tier": "C", "items": [{ "id": 5, "name": "쿠키", "image_url": "https://..." }] },
    { "tier": "D", "items": [{ "id": 6, "name": "푸딩", "image_url": "https://..." }] },
    { "tier": "F", "items": [
      { "id": 7, "name": "초콜릿", "image_url": "https://..." },
      { "id": 8, "name": "젤리", "image_url": "https://..." }
    ]}
  ],
  "next_match": {
    "item_a": { "id": 3, "name": "아이스크림", "image_url": "https://..." },
    "item_b": { "id": 4, "name": "마카롱", "image_url": "https://..." }
  },
  "is_complete": false
}
```

**Response 성공 - 플레이 완료 (200)**

```json
{
  "comparison_count": 10,
  "current_tiers": [...],
  "next_match": null,
  "is_complete": true
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "플레이 세션을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| comparison_count | number | 현재까지 비교 횟수 |
| current_tiers | array | 현재 티어 배치 상태 |
| next_match | object / null | 다음 비교 쌍 (완료 시 null) |
| is_complete | boolean | 플레이 완료 여부 |

current_tiers

| 필드 | 타입 | 설명 |
|------|------|------|
| tier | string | 티어 (S, A, B, C, D, F) |
| items | array | 해당 티어의 아이템 목록 |

next_match

| 필드 | 타입 | 설명 |
|------|------|------|
| item_a | object | 비교 아이템 A |
| item_b | object | 비교 아이템 B |

**사용 예시**

```
POST /api/play/12345/compare
```

---

### GET /api/play/:sessionId/status — 플레이 상태 조회

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| sessionId | number | O | 플레이 세션 ID |

**Response 성공 (200)**

```json
{
  "title": "디저트 월드컵",
  "comparison_count": 5,
  "current_tiers": [
    { "tier": "S", "items": [{ "id": 1, "name": "케이크", "image_url": "https://..." }] },
    { "tier": "A", "items": [{ "id": 3, "name": "아이스크림", "image_url": "https://..." }] },
    { "tier": "B", "items": [
      { "id": 2, "name": "도넛", "image_url": "https://..." },
      { "id": 4, "name": "마카롱", "image_url": "https://..." }
    ]},
    { "tier": "C", "items": [{ "id": 5, "name": "쿠키", "image_url": "https://..." }] },
    { "tier": "D", "items": [{ "id": 6, "name": "푸딩", "image_url": "https://..." }] },
    { "tier": "F", "items": [
      { "id": 7, "name": "초콜릿", "image_url": "https://..." },
      { "id": 8, "name": "젤리", "image_url": "https://..." }
    ]}
  ],
  "next_match": {
    "item_a": { "id": 3, "name": "아이스크림", "image_url": "https://..." },
    "item_b": { "id": 4, "name": "마카롱", "image_url": "https://..." }
  },
  "is_complete": false
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "플레이 세션을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 티어컵 제목 |
| comparison_count | number | 현재까지 비교 횟수 |
| current_tiers | array | 현재 티어 배치 상태 |
| next_match | object / null | 다음 비교 쌍 (완료 시 null) |
| is_complete | boolean | 플레이 완료 여부 |

current_tiers

| 필드 | 타입 | 설명 |
|------|------|------|
| tier | string | 티어 (S, A, B, C, D, F) |
| items | array | 해당 티어의 아이템 목록 |

next_match

| 필드 | 타입 | 설명 |
|------|------|------|
| item_a | object | 비교 아이템 A |
| item_b | object | 비교 아이템 B |

**사용 예시**

```
GET /api/play/12345/status
```

---

### POST /api/play/:sessionId/complete — 플레이 완료 (조기 종료)

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| sessionId | number | O | 플레이 세션 ID |

**Response 성공 (200)**

```json
{
  "result_code": "xY9kL2"
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "플레이 세션을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| result_code | string | 결과 페이지용 코드 |

**사용 예시**

```
POST /api/play/12345/complete
```

---

## 좋아요

### POST /api/tier-cups/:playCode/like — 좋아요 추가

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| playCode | string | O | 티어컵 플레이 코드 |

**Request Body**

```json
{
  "client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| client_id | string | O | 클라이언트 식별자 (localStorage 기반) |

**Response 성공 (201)**

```json
{
  "like_count": 90
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**Response 실패 (409)**

```json
{
  "error": {
    "code": "ALREADY_LIKED",
    "message": "이미 좋아요를 눌렀습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| like_count | number | 좋아요 수 |

**사용 예시**

```
POST /api/tier-cups/dF7kx9/like
```

---

### DELETE /api/tier-cups/:playCode/like — 좋아요 취소

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| playCode | string | O | 티어컵 플레이 코드 |

**Request Body**

```json
{
  "client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| client_id | string | O | 클라이언트 식별자 (localStorage 기반) |

**Response 성공 (200)**

```json
{
  "like_count": 89
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

```json
{
  "error": {
    "code": "LIKE_NOT_FOUND",
    "message": "좋아요 기록을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| like_count | number | 좋아요 수 |

**사용 예시**

```
DELETE /api/tier-cups/dF7kx9/like
```

---

## 결과

### GET /api/results/:resultCode — 결과 조회

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| resultCode | string | O | 결과 페이지용 코드 |

**Response 성공 (200)**

```json
{
  "play_code": "dF7kx9",
  "title": "디저트 월드컵",
  "tiers": [
    { "tier": "S", "items": [{ "id": 1, "name": "케이크", "image_url": "https://..." }] },
    { "tier": "A", "items": [{ "id": 3, "name": "아이스크림", "image_url": "https://..." }] },
    { "tier": "B", "items": [
      { "id": 2, "name": "도넛", "image_url": "https://..." },
      { "id": 4, "name": "마카롱", "image_url": "https://..." }
    ]},
    { "tier": "C", "items": [{ "id": 5, "name": "쿠키", "image_url": "https://..." }] },
    { "tier": "D", "items": [{ "id": 6, "name": "푸딩", "image_url": "https://..." }] },
    { "tier": "F", "items": [
      { "id": 7, "name": "초콜릿", "image_url": "https://..." },
      { "id": 8, "name": "젤리", "image_url": "https://..." }
    ]}
  ],
  "comparison_count": 10
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "RESULT_NOT_FOUND",
    "message": "결과를 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| play_code | string | 티어컵 플레이 코드 (다시하기, 통계 링크용) |
| title | string | 티어컵 제목 |
| tiers | array | 티어 배치 결과 |
| comparison_count | number | 총 비교 횟수 |

tiers

| 필드 | 타입 | 설명 |
|------|------|------|
| tier | string | 티어 (S, A, B, C, D, F) |
| items | array | 해당 티어의 아이템 목록 |

**사용 예시**

```
GET /api/results/xY9kL2
```

---

### PUT /api/results/:resultCode — 결과 수정 (티어 변경)

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| resultCode | string | O | 결과 페이지용 코드 |

**Request Body**

```json
{
  "tiers": [
    { "tier": "S", "item_ids": [1, 3] },
    { "tier": "A", "item_ids": [2] },
    { "tier": "B", "item_ids": [4, 5] },
    { "tier": "C", "item_ids": [6] },
    { "tier": "D", "item_ids": [7] },
    { "tier": "F", "item_ids": [8] }
  ]
}
```

**Request 필드 설명**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| tiers | array | O | 티어 배치 |

tiers

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| tier | string | O | 티어 (S, A, B, C, D, F) |
| item_ids | array | O | 해당 티어에 배치할 아이템 ID 목록 |

**Response 성공 (200)**

```json
{
  "message": "결과가 수정되었습니다."
}
```

**Response 실패 (400)**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "최소 1개 아이템은 티어에 배치해야 합니다."
  }
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "RESULT_NOT_FOUND",
    "message": "결과를 찾을 수 없습니다."
  }
}
```

**사용 예시**

```
PUT /api/results/xY9kL2
```

---

## 통계

### GET /api/stats/:playCode — 티어컵 통계 조회

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| playCode | string | O | 티어컵 플레이 코드 |

**Response 성공 (200)**

```json
{
  "title": "디저트 월드컵",
  "summary": {
    "total_plays": 1247,
    "total_comparisons": 12470,
    "avg_duration_seconds": 138
  },
  "item_stats": [
    {
      "id": 1,
      "name": "케이크",
      "image_url": "https://...",
      "tier_distribution": {
        "S": 42,
        "A": 28,
        "B": 15,
        "C": 10,
        "D": 3,
        "F": 2
      }
    },
    {
      "id": 2,
      "name": "도넛",
      "image_url": "https://...",
      "tier_distribution": {
        "S": 15,
        "A": 25,
        "B": 30,
        "C": 18,
        "D": 8,
        "F": 4
      }
    }
  ],
  "fun_stats": {
    "most_s_tier": { "id": 1, "name": "케이크", "rate": 42 },
    "most_f_tier": { "id": 8, "name": "젤리", "rate": 38 },
    "closest_match": {
      "item_a": { "id": 1, "name": "케이크" },
      "item_b": { "id": 2, "name": "도넛" },
      "win_rate": 51.2
    }
  }
}
```

**Response 실패 (404)**

```json
{
  "error": {
    "code": "TIER_CUP_NOT_FOUND",
    "message": "티어컵을 찾을 수 없습니다."
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 티어컵 제목 |
| summary | object | 요약 통계 |
| item_stats | array | 아이템별 통계 |
| fun_stats | object | 재미있는 통계 |

summary

| 필드 | 타입 | 설명 |
|------|------|------|
| total_plays | number | 총 참여자 수 |
| total_comparisons | number | 총 비교 횟수 |
| avg_duration_seconds | number | 평균 플레이 시간 (초) |

item_stats

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | 아이템 ID |
| name | string | 아이템 이름 |
| image_url | string | 이미지 URL |
| tier_distribution | object | 티어별 비율 (%) |

fun_stats

| 필드 | 타입 | 설명 |
|------|------|------|
| most_s_tier | object | S티어 1위 아이템 |
| most_f_tier | object | F티어 1위 아이템 |
| closest_match | object | 가장 치열한 대결 (승률 50%에 가까운 매치업) |

**사용 예시**

```
GET /api/stats/dF7kx9
```
