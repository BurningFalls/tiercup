#!/usr/bin/env bash
# git commit 후 브랜치명에서 task 번호를 파싱해 ROADMAP.md 항목을 자동 체크

ROADMAP="$(git rev-parse --show-toplevel)/docs/ROADMAP.md"

# ROADMAP.md 없으면 종료
[ -f "$ROADMAP" ] || exit 0

# 현재 브랜치명에서 task 번호 추출 (feature/task-003-... → 3)
BRANCH=$(git branch --show-current 2>/dev/null)
TASK_NUM=$(echo "$BRANCH" | grep -oE 'task-([0-9]+)' | grep -oE '[0-9]+' | head -1)

[ -z "$TASK_NUM" ] && exit 0

# 0패딩 3자리로 정규화 (3 → 003)
TASK_ID=$(printf "%03d" "$((10#$TASK_NUM))")

# 해당 Task 섹션의 미체크 항목(- [ ])을 체크(- [x])로 변경
# 대상 범위: "### Task {ID}" 시작 ~ 다음 "### Task" 또는 "---" 전까지
awk -v task="Task $TASK_ID" '
  /^### / { in_task = ($0 == "### " task) }
  in_task && /^- \[ \]/ { sub(/^- \[ \]/, "- [x]") }
  { print }
' "$ROADMAP" > "$ROADMAP.tmp" && mv "$ROADMAP.tmp" "$ROADMAP"

echo "✓ ROADMAP.md — Task $TASK_ID 항목 체크 완료"
