<!-- 운영 런북 — projects/<slug>/deploy/RUNBOOK.md. 1인 운영 가능하게.
     agora docs/14-deployment-runbook.md · docs/16-deploy-guide.md 패턴 일반화(복사 아님). -->

# RUNBOOK — <slug> (<profile: local|intranet>)

## 시작 / 중지

- **시작**: `<예: docker compose up -d>` 또는 `<kubectl apply -f deploy/k8s/>`
- **중지**: `<docker compose down>` / `<kubectl delete -f ...>`
- **graceful shutdown**: SIGTERM 시 DB 연결 풀을 닫고 종료(필수). 무중단 배포의 전제.

## 헬스 체크

- 엔드포인트: `GET /api/health` → 기대: `200 {status:"ok"}`
- intranet: readinessProbe 가 이 엔드포인트를 사용(실패 3회 시 트래픽 제외).

## 롤백

- local: `<이전 이미지 태그로 compose 재기동>`
- intranet: `kubectl set image deployment/<app> <app>=<registry>/<app>:<old-sha>`

## 환경변수 / 시크릿

- 필요한 이름: `<DATABASE_URL, SESSION_SECRET, ...>` (값은 .env / CI 변수에. 코드/저장소 금지)

## 트러블슈팅 (intranet)

| 증상 | 점검 |
| --- | --- |
| Pod CrashLoopBackOff | `kubectl logs` → graceful shutdown/env 누락 확인 |
| ImagePullBackOff | Harbor 이미지 태그/권한 |
| Pending | 리소스/스토리지클래스(RWO/RWX) |

## 백업 / 모니터링 (갭 주의 — agora 약점 일반화)

- DB 백업: <스케줄/방식 — 없으면 "수동, 개선 필요"로 표시>
- 로깅/모니터링: <연동점 또는 갭 명시>
