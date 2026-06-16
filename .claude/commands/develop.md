---
description: 승인된 스펙(SPEC.manifest) → 동작하는 코드 + 테스트. REQ당 구현·테스트·적대적 리뷰 후 게이트에서 정지.
argument-hint: "<slug>"
---

# /develop — 개발 모듈 (스펙 → 코드+테스트)

당신은 second-brain 파이프라인의 **개발 모듈**이다. 승인된 스펙을 코드로 구현하고 **게이트에서 멈춘다**.
자동으로 /deploy 로 넘어가지 않는다.

대상 프로젝트: `$ARGUMENTS` (slug)

## 0. 경로 해석 + 게이트 확인 (하드 거부)

1. **경로 해석**: `rails/project-paths.md` 규약으로 `<slug>` → `$DOCS`/`$META`/`$STATE`/`$CODE` 확정(미등록 slug 는 internal = `projects/<slug>/` 기존 동작). 이하 경로는 이 변수로 쓴다.
2. `$STATE`(pipeline.yaml)를 읽는다.
3. 창작 게이트가 `approved` 가 **아니면 거부**한다: "창작 게이트 미승인 — `/creative` 검토 후 `gate: approved` 필요".
4. 창작 `SPEC.manifest.yaml`(대조표의 창작 메타 행)을 입력으로 읽는다. **대화 맥락이 아니라 이 파일이 진실의 원천이다.**

## 1. 재실행/재개 확인

개발 `$META/DEV.manifest.yaml` 가 이미 있으면, `status: done` 인 REQ는 **건너뛰고** 나머지(미완·blocked·partial)만 처리한다.

## 2. 골격  `[tier: bulk]`

`$DOCS/03-architecture.md` 의 스택 결정으로 `$CODE` 에 프로젝트 골격을 만든다(또는 기존 골격 유지).

## 3. REQ별 병렬 구현  (req-implementer 스킬)

`req-implementer` 스킬을 따른다: **P0 REQ마다 git worktree에서 독립 구현**하되, 각 REQ에 대해
그 `acceptance`(given/when/then)를 **그대로 검증하는 테스트**를 함께 작성한다.`[tier: bulk]`
worktree 격리로 병렬 변경 충돌을 막는다.

## 4. CRITIC  (adversarial-review 스킬)  `[tier: judgment]`

각 REQ 구현을 6차원으로 리뷰한다. **REQ는 (a) acceptance 테스트 통과 + (b) 리뷰 PASS 일 때만 `status: done`.**
둘 중 하나라도 실패면 그 REQ로 루프백(3단계). 루프백 사건은 개발 `$META/HANDOFF.md` §3 에 기록.

## 5. 통합  `[tier: judgment]`

worktree들을 병합하고 전체 빌드/테스트를 돌린다(`npm run build`, `npm test`). 통합 단계에서 깨지면 고친다.

## 6. 계약 작성 + 게이트에서 정지

1. `$META/DEV.manifest.yaml` 을 채운다(REQ별 status·tests·verification, build, run).
2. `$META/HANDOFF.md`(델타·확정결정·루프백) 와 `$META/GATE.md`(REQ별 status 표 + diff 요약)를 쓴다.
3. `$STATE`(pipeline.yaml)를 갱신한다:
   ```yaml
   stage: develop
   gate: pending
   updated: <오늘 날짜>
   ```
4. 사용자에게 REQ별 상태 표를 출력하고 **멈춘다**. 검토 후 `gate: approved` 또는 `/develop` 재실행 안내.

> 절대 /deploy 를 시작하지 않는다. 모든 P0 REQ가 done 이 아니면 GATE.md 에 명확히 표시한다.
