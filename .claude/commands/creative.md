---
description: 아이디어 한 문단 → 창작(설계) 스펙. 번호 문서 + REQ표 + SPEC.manifest 생성 후 게이트에서 정지.
argument-hint: "<아이디어 한 문단>"
---

# /creative — 창작 모듈 (아이디어 → 스펙)

당신은 second-brain 파이프라인의 **창작 모듈**이다. 입력 아이디어를 검수 가능한 설계 스펙으로 바꾸고,
**게이트에서 멈춘다**. 자동으로 /develop 로 넘어가지 않는다.

입력 아이디어:
> $ARGUMENTS

## 0. 준비

1. 아이디어에서 짧은 `<slug>`(kebab-case)를 정한다.
2. `projects/<slug>/` 가 이미 있으면 **재실행 모드**: 기존 산출물과 `creative/HANDOFF.md` 를 읽고
   부족/지적된 부분만 보강한다(처음부터 다시 쓰지 않는다).
3. 없으면 `projects/<slug>/creative/` 를 만들고 `rails/artifact-templates/creative/*` 를 복사해 시작점으로 삼는다.

## 1. 프레이밍  `[tier: judgment]`

`creative/00-brief.md` 를 채운다(한 줄 정의·대상·방향·제약·비목표). `deploy_profile`(local|intranet)을 정한다.
**불명확하면 추측하지 말고** AskUserQuestion 으로 핵심 3~5개를 먼저 묻는다(여기 5분이 가장 큰 레버리지).

## 2. 발산 → 심사 → 합성  (spec-author 스킬)

`spec-author` 스킬을 따른다: 서로 다른 아키텍처 방향 **N=3안을 병렬로 제안**`[tier: bulk]` →
목표/제약 기준으로 **심사·병합**`[tier: judgment]` → 승자 기준으로 나머지 문서를 합성:
`01-concept-goals.md`, `02-requirements.md`(REQ-ID 표), `03-architecture.md`, `08-roadmap.md`, `09-risks-security.md`.

## 3. 기계가독 계약 작성  `[tier: judgment]`

`creative/SPEC.manifest.yaml` 을 번호 문서와 **일치**하게 채운다. 모든 P0/P1 REQ는 비어있지 않은
`acceptance`(given/when/then)를 가져야 한다 — 이게 개발의 테스트이자 배포의 smoke가 된다.
`deploy_profile: intranet` 이면 OPS REQ(health·graceful shutdown)를 자동 포함한다.

## 4. CRITIC  (adversarial-review 스킬)  `[tier: judgment]`

`adversarial-review` 스킬로 스펙을 적대적으로 검증한다. 특히:
- acceptance 가 비었거나 검증 불가한 REQ → **거부**.
- 00의 한 줄 정의/비목표를 벗어난 범위 확장(scope creep) → 표시.
- 숨은 가정·모순.

결함이 있으면 2~3 단계로 **루프백**해 고친다. 루프백 사건은 `creative/HANDOFF.md` §3 에 기록(회고용).

## 5. 게이트에서 정지

1. `rails/handoff/HANDOFF.template.md` → `creative/HANDOFF.md` 로 채운다.
2. `rails/handoff/GATE.template.md` → `creative/GATE.md` 로 채운다(무엇을 만들었나·열린 결정·critic 결과).
3. `projects/<slug>/.state/pipeline.yaml` 를 쓴다:
   ```yaml
   slug: <slug>
   stage: creative
   gate: pending
   updated: <오늘 날짜>
   ```
4. 사용자에게 요약을 출력하고 **멈춘다**. 검토 후 `gate: approved` 로 바꾸거나 `/creative` 재실행으로 반복하도록 안내.

> 절대 /develop 단계를 시작하지 않는다. 게이트 승인은 사람의 몫이다.
