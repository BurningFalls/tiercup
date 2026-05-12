---
name: git-merge
description: 현재 feature 브랜치의 PR을 squash merge하고, 원격/로컬 브랜치를 삭제한 뒤 base 브랜치를 pull합니다. "머지해줘", "merge 해줘", "PR 머지하고 브랜치 정리해줘", "git-merge" 등의 요청에 사용하세요.
---

## 1단계: 현재 상태 확인

현재 브랜치와 PR 상태를 확인합니다:

```bash
git branch --show-current
gh pr view --json number,title,state,mergeable,baseRefName
```

다음 경우 즉시 중단합니다:

- 브랜치가 `main` 또는 `develop`이면:
  > "main/develop 브랜치에서는 실행할 수 없습니다. feature 브랜치에서 실행해주세요."

- PR이 존재하지 않으면:
  > "열린 PR이 없습니다. 먼저 /git-pr 로 PR을 생성해주세요."

- PR 상태가 `OPEN`이 아니면:
  > "PR이 이미 머지됐거나 닫혀 있습니다."

- `mergeable`이 `CONFLICTING`이면:
  > "충돌이 있어 머지할 수 없습니다. 충돌을 해결한 후 다시 시도해주세요."

- `mergeable`이 `UNKNOWN`이면 아래 명령어로 10초 대기 후 재확인합니다:
  ```bash
  sleep 10
  gh pr view --json mergeable --jq '.mergeable'
  ```
  재확인 후에도 UNKNOWN이면:
  > "머지 가능 여부를 확인할 수 없습니다. 잠시 후 다시 시도해주세요."

## 2단계: 머지 정보 출력

머지 전 다음 정보를 출력합니다:

```
PR #<number>: <title>
<baseRefName> ← <현재 브랜치> (squash merge)
```

## 3단계: Squash merge 실행

```bash
gh pr merge --squash --delete-branch
```

`--delete-branch` 플래그로 **원격(remote)** feature 브랜치를 자동 삭제합니다.
로컬 브랜치는 4단계에서 별도로 삭제합니다.

## 4단계: base 브랜치로 전환 + 로컬 브랜치 삭제

`gh pr merge`가 자동으로 처리하지 않은 경우에만 실행합니다.
아래 명령어로 현재 브랜치와 로컬 브랜치 존재 여부를 확인합니다:

```bash
git branch --show-current
git branch --list <feature-branch>
```

- 현재 브랜치가 이미 `<baseRefName>`이고 `<feature-branch>`가 존재하지 않으면 → 5단계로 건너뜁니다.
- 아직 feature 브랜치에 있거나 로컬 브랜치가 남아있으면 실행합니다:

```bash
git checkout <baseRefName>
git branch -d <feature-branch>
```

checkout을 먼저 실행해야 현재 브랜치를 삭제할 수 있습니다.

## 5단계: Pull 및 완료 보고

base 브랜치를 최신화하고 결과를 출력합니다:

```bash
git pull origin <baseRefName>
git log --oneline -3
```
