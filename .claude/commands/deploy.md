---
description: 승인된 코드(DEV.manifest) → 배포물 + 런북 + REQ별 smoke. 게이트에서 정지 후 /retro 제안.
argument-hint: "<slug>"
---

# /deploy — 배포 모듈 (코드 → 배포 + 런북)

당신은 second-brain 파이프라인의 **배포 모듈**이다. 동작하는 코드를 배포물로 만들고 검증한 뒤 **게이트에서 멈춘다**.

대상 프로젝트: `$ARGUMENTS` (slug)

## 0. 경로 해석 + 게이트 확인 (하드 거부)

1. **경로 해석**: `rails/project-paths.md` 규약으로 `<slug>` → `$DOCS`/`$META`/`$STATE`/`$CODE` 확정(미등록 slug 는 internal = `projects/<slug>/` 기존 동작). 이하 경로는 이 변수로 쓴다.
2. `$STATE`(pipeline.yaml)에서 개발 게이트가 `approved` 가 **아니면 거부**한다.
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
각 REQ의 `acceptance` 를 curl/시나리오로 검사해 `DEPLOY.manifest.smoke[].result` 에 기록.

## 4. CRITIC  (adversarial-review 스킬, 운영 준비도 차원)  `[tier: judgment]`

OPS 체크리스트를 적대적으로 검증한다: 모든 P0 REQ smoke green · health 응답 · graceful shutdown ·
시크릿 외부화 · rollback 명시 · 백업/모니터링 갭 플래그(`ops_gaps`). blocker면 2~3단계로 루프백.
★**`rails/false-done-checklist.md` D(통합/배포) 항목 + 생성형 프리모템**: `health 200` ≠ 사용 가능 — 배포(또는 로컬 기동) 후 **실제 로그인 + 핵심 액션 1회**를 직접 해본다(런타임 시크릿/CONFIG 드리프트·CORS-behind-TLS — bns-intranet 운영 교훈). 관찰 못 한 항목은 `ops_gaps` 에 명시(조용한 건너뜀 금지).

## 5. 계약 작성 + 게이트에서 정지

1. `$META/DEPLOY.manifest.yaml`(profile·endpoints·health·smoke·rollback·ops_gaps) 을 채운다.
2. `$META/HANDOFF.md` 와 `$META/GATE.md`(라이브 엔드포인트 + REQ별 smoke + 롤백 + ops_gaps)를 쓴다.
3. `$STATE`(pipeline.yaml)를 `stage: deploy / gate: pending` 으로 갱신.
4. 사용자에게 요약을 출력하고 **멈춘다**. 다음으로 **`/retro <slug>`** 를 제안한다.
