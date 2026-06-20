---
description: 승인된 코드(DEV.manifest) → 배포물 + 런북 + REQ별 smoke. 게이트에서 정지 후 /retro 제안.
argument-hint: "<slug>"
---

# /deploy — 배포 모듈 (코드 → 배포 + 런북)

당신은 second-brain 파이프라인의 **배포 모듈**이다. 동작하는 코드를 배포물로 만들고 검증한 뒤 **게이트에서 멈춘다**.

대상 프로젝트: `$ARGUMENTS` (slug)

## 0. 경로 해석 + 게이트 확인 (하드 거부)

1. **경로 해석**: `rails/project-paths.md` 규약으로 `<slug>` → `$DOCS`/`$META`/`$STATE`/`$CODE` 확정(미등록 slug 는 internal = `projects/<slug>/` 기존 동작). 이하 경로는 이 변수로 쓴다.
2. `$STATE`(pipeline.yaml)에서 개발 게이트가 `approved` 가 **아니면 거부**한다. ★**자가승인 탐지 + done freshness(false-done-checklist G)**: `approved` 라도 (a) `approved_by`(사람 표식) 없거나 (b) 직전 develop `GATE.md` 열린 결정 미해소거나 (c) **`SPEC.manifest.updated > DEV.manifest 의 done 기록 시점`**(상류 창작이 재실행돼 acceptance 가 바뀌었는데 done 이 stale)이면 — **정지하고 사람 승인/재검증 요구**. *한 세션 권한 안 → 탐지 수준(critic 차원 8).*
3. 개발 `DEV.manifest.yaml` 와 창작 `SPEC.manifest.yaml`(deploy_profile) — 대조표의 해당 stage 메타 행 — 을 입력으로 읽는다.
4. 모든 P0 REQ가 `status: done` 인지 확인. 아니면 게이트로 돌려보낸다.

## 1. 프로파일 분기  (deploy-runbook 스킬)  `[tier: judgment]`

`SPEC.manifest.deploy_profile` 로 분기한다.
- **local**(기본): multi-stage Dockerfile + docker-compose.
- **intranet**: `.gitlab-ci.yml`(test→docker-build→deploy) + k8s manifest(rolling: replicas≥2, maxUnavailable:0,
  preStop sleep, readinessProbe) + cert-manager Ingress + ConfigMap initdb. (agora 패턴 일반화, 복사 아님)

## 2. 산출물 생성  `[tier: bulk]`

배포 파일(`$CODE` 에)과 `$META/RUNBOOK.md` 를 생성한다. **두 프로파일 공통 필수**: `/api/health` 엔드포인트,
SIGTERM graceful shutdown(DB 풀 close), 시크릿 외부화(.env / CI 변수, 코드 금지).

## 3. 배포 + REQ별 smoke  `[tier: bulk]`

크레덴셜이 있으면 배포, 없으면 **dry-run**. 배포 후(또는 dry-run 시 로컬 기동으로) **REQ마다 smoke** 를 돌린다 —
각 REQ의 `acceptance` 를 **given/when/then 1:1 로(의역·약화 금지)** curl/시나리오로 검사해 `DEPLOY.manifest.smoke[]` 에 기록한다. given 의 전제(역할·계정상태)가 셋업되고 then 의 기대결과(상태코드·필드·거부)가 단언에 그대로 나타나야 한다(복합 acceptance 를 단순 200 으로 의역 금지).
- ★**dry-run 은 result:pass 금지**: 크레덴셜 없이 로컬 기동한 smoke 는 `env: dry-run` + `result: dry-run`(라이브 클러스터 TLS·인증미들웨어·CORS·런타임시크릿 미경유 — `health 200` 라도 클러스터 검증 아님). intranet 인데 전부 dry-run 이면 GATE.md 에 "라이브 미완" + 보안 REQ(401·HTTPS강제·429)는 `partial — intranet 스택 미검증`.
- ★**smoke 구성에 경계/동시/멱등/cold-start 포함**(해당 REQ 유형에서만, 아니면 명시 N/A): 빈 DB cold-start 1회(TRUNCATE ALL 후 핵심 플로우) · 선점성 REQ 동시 N요청 probe(성공 row=1) · 쓰기 REQ 멱등 2회 POST(row=1) · 배포 후 DB 일시 차단해 health 비정상 전환. (false-done-checklist D·E)

## 4. CRITIC  (adversarial-review 스킬, 운영 준비도 차원)  `[tier: judgment]`

OPS 체크리스트를 적대적으로 검증한다: 모든 P0 REQ smoke green · health 응답 · graceful shutdown ·
시크릿 외부화 · rollback 명시 · 백업/모니터링 갭 플래그(`ops_gaps`). blocker면 2~3단계로 루프백.
★**`rails/false-done-checklist.md` D(통합/배포) 항목 + 생성형 프리모템**: `health 200` ≠ 사용 가능 — 배포(또는 로컬 기동) 후 **실제 로그인 + 핵심 액션 1회**를 직접 해본다(런타임 시크릿/CONFIG 드리프트·CORS-behind-TLS — bns-intranet 운영 교훈). 관찰 못 한 항목은 `ops_gaps` 에 명시(조용한 건너뜀 금지).

## 5. 계약 작성 + 게이트에서 정지

1. `$META/DEPLOY.manifest.yaml`(profile·endpoints·health·smoke·rollback·ops_gaps) 을 채운다.
2. `$META/HANDOFF.md` 와 `$META/GATE.md`(라이브 엔드포인트 + REQ별 smoke + 롤백 + ops_gaps)를 쓴다.
3. `$STATE`(pipeline.yaml)를 `stage: deploy / gate: pending` 으로 갱신(★`pending` 만 — `approved` 는 사람이 `approved_by`/`approved_at` 과 함께).
4. 사용자에게 요약을 출력하고 **멈춘다**(`gate:approved` 자가 기재 금지). 다음으로 **`/retro <slug>`** 를 제안한다.
