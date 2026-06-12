---
name: deploy-runbook
description: 배포 모듈 내부 절차. deploy_profile(local/intranet)에 따라 배포물과 운영 런북을 생성하고 REQ별 smoke를 구성한다. agora 배포 패턴을 일반화(복사 아님). /deploy 가 사용.
---

# deploy-runbook — 프로파일별 배포물 + 런북

## 입력
- `SPEC.manifest.deploy_profile`, `DEV.manifest`(build/run/env), requirements(acceptance → smoke).

## 공통 필수 (두 프로파일)
- `/api/health` → `200 {status:"ok"}`.
- SIGTERM graceful shutdown: DB 연결 풀 close 후 종료. (agora `instrumentation.ts` 패턴 일반화)
- 시크릿 외부화: 코드/저장소 금지. local=.env, intranet=CI 변수(Masked).
- REQ별 smoke: 각 REQ `acceptance` 를 curl/시나리오로 검사.

## profile: local  `[tier: bulk]`
- multi-stage Dockerfile(deps→builder→runner, 슬림 베이스) + `docker-compose.yml`(app + 필요시 db).
- 배포 = `docker compose up -d` (크레덴셜 불필요). 롤백 = 이전 이미지 태그 재기동.
- smoke = 로컬 기동 후 `curl`.

## profile: intranet  `[tier: bulk]`  (agora 패턴 일반화)
- `.gitlab-ci.yml`: stages `test → docker-build(→Harbor) → deploy(kubectl apply)`.
- k8s manifest: Deployment(rolling: replicas≥2, maxUnavailable:0, maxSurge:1, preStop sleep, readinessProbe=/api/health),
  Service, Ingress(cert-manager ClusterIssuer 주석으로 TLS 자동), 필요시 ConfigMap initdb(1회성), PDB.
- 시크릿 = `kubectl create secret`(CI 변수에서). 스토리지 = 단일 RWO / 멀티 RWX 구분.
- 롤백 = `kubectl set image deployment/<app> <app>=<registry>/<app>:<old-sha>`.

## 런북 생성
`RUNBOOK.template.md` 로 `deploy/RUNBOOK.md` 를 채운다: 시작/중지/롤백/health/env/트러블슈팅/백업·모니터링 갭.

## 운영 갭 (정직하게 표시 — agora 약점 일반화)
구조화 로깅·자동 백업 CronJob·시크릿 로테이션이 없으면 `DEPLOY.manifest.ops_gaps` 에 명시한다.
침묵하지 않는다(없는 걸 "다 됐다"로 보이게 하지 않는다).

## 규칙
- 사내 인증이 필요하면 agora `docs/07 §8`(실명 이메일+비번 httpOnly 세션) 패턴 참조. **익명·민감 데이터 금지.**
- agora 파일을 복사하지 않는다 — 패턴만 일반화하고 출처를 인용한다.
