<!-- 게이트 — 명령이 끝에서 projects/<slug>/<stage>/GATE.md 로 쓰고 멈춘다.
     사람이 읽고 승인/반복을 결정하는 5분 검수 지점. -->

# GATE — <slug> / <stage>

## ✅ 무엇이 만들어졌나 (요약)

- <산출물 핵심 1~5줄. 예: REQ 12개(P0 7), 스택 결정, 주요 화면 N개>

## ⚠️ 열린 결정 / 사람이 확인할 것

- <검토자가 판단해야 할 트레이드오프·가정. 없으면 "없음">

## 🔁 critic 결과

- <통과/루프백 횟수, 마지막에 남은 경고>

## ▶ 다음 행동

1. `projects/<slug>/<stage>/` 의 산출물을 검토한다.
2. 만족하면 → `projects/<slug>/.state/pipeline.yaml` 의 `gate:` 를 `approved` 로 바꾼다.
3. 고치려면 → `/<stage>` 명령을 다시 돌린다(반복).

> 다음 명령(`/<next-stage>`)은 이 게이트가 `approved` 가 아니면 거부한다.
