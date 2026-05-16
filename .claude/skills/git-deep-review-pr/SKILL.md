---
name: git-deep-review-pr
description: Codex 리뷰 → code-reviewer 보완 → PR 인라인 코멘트 게시를 한 번에 실행합니다. "/git-deep-review-pr 1", "PR 딥리뷰 올려줘" 등의 요청에 사용하세요. PR 번호를 인자로 받습니다.
context: fork
---

## 0단계: 인자 확인

스킬 호출 시 PR 번호가 인자로 제공되어야 합니다.

PR 번호가 없으면 즉시 중단합니다:

> "PR 번호를 인자로 제공해주세요. 예: `/git-deep-review-pr 1`"

---

## 1단계: PR 정보 및 변경 파일 수집

```bash
# repo 정보 (이후 단계에서 $REPO 변수로 참조)
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')

# PR 기본 정보 (headRefOid는 인라인 코멘트에 필요)
gh pr view <PR번호> --json number,title,headRefName,headRefOid,url

# 변경 파일 목록과 patch
gh api repos/$REPO/pulls/<PR번호>/files \
  --jq '.[] | {filename: .filename, patch: .patch}'
```

수집한 정보를 이후 단계에서 사용할 수 있도록 보관합니다.

---

## 2단계: Codex 리뷰 실행

`/codex:review` 명령을 실행합니다. PR 브랜치의 변경사항을 기준으로 리뷰합니다.

```
/codex:review --base main
```

- `--base main`: main 브랜치 대비 현재 브랜치의 변경사항 리뷰

Codex 출력을 컨텍스트에 보관합니다 (3단계에서 직접 참조하여 사용).

---

## 3단계: code-reviewer 에이전트로 재검토

`code-reviewer` 서브에이전트를 호출합니다. (Agent tool 사용)

에이전트에 전달할 컨텍스트:

- PR 변경 파일 목록과 patch 전체 (1단계 결과)
- Codex 리뷰 결과 (2단계 결과)
- 프로젝트 스택: Next.js 15 App Router, TypeScript, TailwindCSS v4, shadcn/ui, Supabase
- 지시사항:
  > "Codex 리뷰 결과를 검토하여 각 이슈에 동의/반박/보완 의견을 추가하세요.
  > 이후 최종 이슈 목록을 생성하되, 각 항목에 파일 경로와 심각도를 포함하세요."

에이전트 출력(최종 이슈 목록)을 보관합니다 (4단계에서 사용).

---

## 4단계: diff position 계산

3단계 최종 이슈 목록의 각 항목에 대해 인라인 코멘트 위치(position)를 계산합니다.

patch hunk 파싱 규칙:
- `@@` 헤더 줄은 position 카운트에서 제외
- patch의 첫 번째 줄(헤더 다음)이 position 1
- `+`, `-`, ` `(컨텍스트) 줄 모두 position을 1씩 증가
- 삭제된(`-`) 줄에는 코멘트를 달 수 없으므로 인접한 컨텍스트 줄이나 추가(`+`) 줄에 달기

position 계산이 불확실한 항목은 인라인 코멘트에서 제외하고 5단계에서 일반 코멘트로 처리합니다.

---

## 5단계: 인라인 코멘트 게시

position이 확정된 각 이슈에 대해 gh api로 인라인 코멘트를 작성합니다:

```bash
gh api repos/$REPO/pulls/<PR번호>/comments \
  -X POST \
  -f body="<심각도이모지> **<제목>**\n\n<문제 설명>\n\n**Codex**: <Codex 의견>\n**검토**: <code-reviewer 동의/반박/보완>" \
  -f path="<파일경로>" \
  -F position=<계산된position> \
  -f commit_id="<headRefOid>"
```

심각도별 이모지:
- 🔴 높음 (즉시 수정 필요)
- 🟡 중간 (개선 권장)
- 🟢 낮음 (선택적 개선)

position이 불확실했던 항목은 PR 일반 코멘트로 보완합니다:

```bash
gh pr comment <PR번호> --body "<건너뛴 지적사항 목록>"
```

---

## 6단계: 완료 보고

```
✅ 풀 코드 리뷰 완료
- Codex 이슈: N개 발견
- 최종 이슈 (code-reviewer 검토 후): N개
- 인라인 코멘트: N개
- 일반 코멘트: N개
- PR: <PR URL>

리뷰 코멘트를 코드에 반영하려면 `/git-code-review-apply <PR번호>`를 사용하세요.
```
