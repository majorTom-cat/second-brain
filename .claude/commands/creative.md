---
description: 아이디어 한 문단(발산) 또는 기존 기획·변경 문서(수렴/ingest) → 창작(설계) 스펙. 번호 문서 + REQ표 + SPEC.manifest 생성 후 게이트에서 정지.
argument-hint: "<아이디어 한 문단>  |  ingest <slug 또는 문서경로>"
---

# /creative — 창작 모듈 (아이디어 또는 문서 → 스펙)

당신은 second-brain 파이프라인의 **창작 모듈**이다. 입력을 검수 가능한 설계 스펙으로 바꾸고,
**게이트에서 멈춘다**. 자동으로 /develop 로 넘어가지 않는다. 입구는 둘 — **발산**(아이디어 한 줄)과 **수렴**(기존 문서).

입력:
> $ARGUMENTS

## 0. 모드 판별 + 준비 + 경로 해석

1. **모드 판별** (발산 vs 수렴):
   - **수렴(ingest)**: `$ARGUMENTS` 가 (a) `ingest` 로 시작하거나, (b) 기존 문서 폴더/파일 경로를 가리키거나,
     (c) `rails/projects.yaml` 에 등록된 프로젝트인데 그 `root` 에 기획 문서(요구사항·화면기획·프로토타입)가 이미 있으면 → **수렴 모드**.
   - **발산(diverge)**: 그 외(자유 서술 아이디어 한 문단) → **발산 모드**(기본·기존).
   - 애매하면 추측 말고 AskUserQuestion: "한 줄 아이디어에서 발산? / 기존 문서에서 수렴?".
   - 수렴이면 다시 구분: 기존 REQ/스펙이 있는 프로젝트의 *변경*이면 `change-ingest`, 신규인데 문서가 먼저면 `greenfield-ingest`.
2. **slug 결정**: 발산이면 아이디어에서, 수렴이면 등록 프로젝트명/문서에서 짧은 `<slug>`(kebab-case)를 정한다.
3. **경로 해석**: `rails/project-paths.md` 규약으로 `<slug>` → `$DOCS`/`$META`/`$STATE`/`$CODE` 를 확정(미등록 slug 는 internal = `projects/<slug>/` 기존 동작). 이하 모든 산출/입력 경로는 이 변수로 쓴다.
4. `$STATE`(pipeline.yaml)가 이미 있으면 **재실행 모드**: 기존 산출물과 창작 `$META/HANDOFF.md` 를 읽고
   부족/지적된 부분만 보강한다(처음부터 다시 쓰지 않는다).
5. 없으면 창작 `$META`·`$DOCS` 디렉터리를 만들고 `rails/artifact-templates/creative/*` 를 복사해 시작점으로 삼는다.

## 1. 프레이밍  `[tier: judgment]`

`$DOCS/00-brief.md` 를 채운다(한 줄 정의·대상·방향·제약·비목표). `deploy_profile`(local|intranet)을 정한다.
**불명확하면 추측하지 말고** AskUserQuestion 으로 핵심 3~5개를 먼저 묻는다(여기 5분이 가장 큰 레버리지).
> **수렴 모드**: `00-brief` 는 자유 발상이 아니라 **소스 문서에서 한 줄 정의·대상·제약을 요약**해 채운다(출처 인용). 스택은 최종 목표 기준.

## 2. 스펙 합성  (spec-author 스킬) — 모드에 맞게

`spec-author` 스킬을 모드에 맞게 따른다. 산출은 양쪽 동일하게 `$DOCS/` 의 `01-concept-goals.md`,
`02-requirements.md`(REQ-ID 표), `03-architecture.md`, `08-roadmap.md`, `09-risks-security.md`.
- **발산 모드**: 서로 다른 아키텍처 방향 **N=3안 병렬 제안**`[tier: bulk]` → 목표/제약 기준 **심사·병합**`[tier: judgment]` → 승자 기준 합성. (기존)
- **수렴 모드(ingest)**: 발산 대신 **기존 문서를 읽어 정규화**. `greenfield-ingest` = 문서→번호docs+REQ표(화면 1개=`REQ-SCR`, `menu_visible` 포함); `change-ingest` = 변경문서→`CR-NNN`+REQ 크로스워크+불변식 상속. 참고: `memory/patterns/ingest-convergence.md`(설계 거리로 수정 vs 그린필드 판정).

## 3. 기계가독 계약 작성  `[tier: judgment]`

`$META/SPEC.manifest.yaml` 을 번호 문서와 **일치**하게 채운다. 모든 P0/P1 REQ는 비어있지 않은
`acceptance`(given/when/then)를 가져야 한다 — 이게 개발의 테스트이자 배포의 smoke가 된다.
**배포 가능한 장기 실행 서비스**면 `deploy_profile` 이 `intranet` 이든 `local`(+Docker)이든 OPS REQ(health·graceful shutdown·**configurable bind**)를 자동 포함한다(한 줄 도구·라이브러리는 제외). 이유: local+Docker 도 graceful/bind 가 필요(todo-toy 교훈).

## 4. CRITIC  (adversarial-review 스킬)  `[tier: judgment]`

`adversarial-review` 스킬로 스펙을 적대적으로 검증한다. 특히:
- acceptance 가 비었거나 **선택한 테스트 수단으로 검증 불가**한 REQ → **거부**. (브라우저 클릭 등 단위테스트 불가한 것은 serve-check[페이지·요소 존재]+배포 smoke 로 분해해 검증 가능하게.)
- 00의 한 줄 정의/비목표를 벗어난 범위 확장(scope creep) → 표시.
- 숨은 가정·모순.

결함이 있으면 2~3 단계로 **루프백**해 고친다. 루프백 사건은 `$META/HANDOFF.md` §3 에 기록(회고용).

## 5. 게이트에서 정지

1. `rails/handoff/HANDOFF.template.md` → `$META/HANDOFF.md` 로 채운다.
2. `rails/handoff/GATE.template.md` → `$META/GATE.md` 로 채운다(무엇을 만들었나·열린 결정·critic 결과).
3. `$STATE`(pipeline.yaml)를 쓴다:
   ```yaml
   slug: <slug>
   stage: creative
   gate: pending
   updated: <오늘 날짜>
   ```
4. 사용자에게 요약을 출력하고 **멈춘다**. 검토 후 `gate: approved` 로 바꾸거나 `/creative` 재실행으로 반복하도록 안내.

> 절대 /develop 단계를 시작하지 않는다. 게이트 승인은 사람의 몫이다.
