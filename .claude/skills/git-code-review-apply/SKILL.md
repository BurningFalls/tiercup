---
name: git-code-review-apply
description: GitHub PR의 인라인 리뷰 코멘트를 fetch하여 코드에 자동으로 반영하고 각 코멘트에 reply를 작성합니다. "/git-code-review-apply 1", "리뷰 반영해줘", "코드 리뷰 반영" 등의 요청에 사용하세요. PR 번호를 인자로 받습니다.
context: fork
---

## 0단계: 인자 확인

스킬 호출 시 PR 번호가 인자로 제공되어야 합니다.

PR 번호가 없으면 즉시 중단하고 안내합니다:

> "PR 번호를 인자로 제공해주세요. 예: `/git-code-review-apply 1`"

## 1단계: PR 코멘트 fetch

```bash
# repo 정보 추출
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')

# 인라인 코멘트 전체 조회 (id, path, body, replies 포함)
gh api repos/$REPO/pulls/<PR번호>/comments \
  --jq '.[] | {id: .id, path: .path, line: .original_line, body: .body, reply_count: (.replies | length // 0)}'
```

## 2단계: 코멘트 분석 및 반영 대상 선별

fetch한 코멘트를 분석합니다:

- `reply_count > 0`인 코멘트는 이미 처리된 것으로 간주하고 **제외** (중복 반영 방지)
- 남은 코멘트를 파일별로 그룹화
- 각 코멘트의 지적사항이 무엇인지 파악 (버그 수정, 개선 제안, 스타일 등)

반영 불가 판단 기준:
- 이미 수정된 상태인 경우 (현재 파일을 읽어 확인)
- 단순 칭찬/확인 코멘트인 경우

## 3단계: 코드 수정 실행

반영 대상 코멘트별로 해당 파일을 수정합니다.

수정 원칙:
- 코멘트에서 제안한 내용을 그대로 적용
- 제안 코드 예시가 있으면 우선 참고
- 수정 범위는 해당 지적사항에 한정 (주변 코드를 불필요하게 변경하지 않음)

모든 수정 완료 후 검증:
```bash
npm run lint && npm run build
```

오류가 발생하면 해당 수정을 재검토 후 재시도합니다.

## 4단계: GitHub reply 작성

반영한 코멘트마다 reply를 작성합니다:

```bash
gh api repos/$REPO/pulls/<PR번호>/comments/<코멘트id>/replies \
  -X POST \
  -f body="반영했습니다. <구체적으로 무엇을 바꿨는지 한 줄>"
```

반영하지 않은 코멘트(이미 처리됨, 반영 불가 등):
```bash
gh api repos/$REPO/pulls/<PR번호>/comments/<코멘트id>/replies \
  -X POST \
  -f body="<반영하지 않은 이유 한 줄>"
```

## 5단계: 완료 보고

모든 처리가 끝나면 사용자에게 요약 출력합니다:

```
✅ 코드 리뷰 반영 완료
- 반영한 코멘트: N개
- 건너뛴 코멘트: N개 (이유: 이미 처리됨 / 반영 불가)
- 수정된 파일: [파일 목록]
- lint/build: ✅ 통과

다음 단계: /git-commit 으로 변경사항을 커밋하세요.
```
