<!-- 게이트 — 명령이 끝에서 projects/<slug>/<stage>/GATE.md 로 쓰고 멈춘다.
     사람이 읽고 승인/반복을 결정하는 5분 검수 지점. -->

# GATE — <slug> / <stage>

## ✅ 무엇이 만들어졌나 (요약)

- <산출물 핵심 1~5줄. 예: REQ 12개(P0 7), 스택 결정, 주요 화면 N개>

## 📋 REQ별 done 근거 — (a)/(b)/(c) 분리 (단일 'verification' 칸 금지)

> 단일 칸이면 (a)만 채우고 (b)(c) 생략해도 'done'으로 보인다. 셋 중 하나라도 `skip/미실행/dry-run`이면 그 REQ는 done 아님 — blocker 표시.

| REQ | (a) acceptance | (b) critic(루프백수) | (c) 관찰 smoke | done? |
|---|---|---|---|---|
| REQ-... | pass/fail/skip | pass / 루프백 N회 | real / **dry-run** / 미실행 (UI=시안대조+클릭스루, 배포=실여정) | ✅/❌ |

## ⚠️ 열린 결정 / 사람이 확인할 것

- <검토자가 판단해야 할 트레이드오프·가정. 없으면 "없음">
- [ ] **열린 결정 검토 완료** (위 항목이 있으면 사람이 체크 — 미체크인데 approved 면 다음 §0가 가시화)

## 🔁 critic 결과 (의역 금지 — 그대로 전사)

- adversarial-review 발견을 `{차원, 심각도(blocker|warn), 위치, 고칠 방법}` 그대로 옮긴다. "경고 없음"으로 soft-pedal 금지.
- 0건이면 그 근거(어느 REQ가 무엇으로 루프백됐는지)가 HANDOFF §3과 일치하는지.
- (배포 GATE) **dry-run 비율**: smoke 중 dry-run N / 전체 M — intranet인데 전부 dry-run이면 "라이브 검증 미완".

## ▶ 다음 행동

1. `projects/<slug>/<stage>/` 의 산출물을 검토한다 — 특히 위 (a)/(b)/(c) 표에서 `dry-run/미실행/skip` 이 done 으로 둔갑하지 않았는지.
2. 만족하면 → `projects/<slug>/.state/pipeline.yaml` 의 `gate:` 를 `approved` 로 바꾼다. **승인은 사람의 몫**(산출 세션이 자가승인 금지).
3. 고치려면 → `/<stage>` 명령을 다시 돌린다(반복).

> 다음 명령(`/<next-stage>`)은 이 게이트가 `approved` 가 아니면 거부한다.
