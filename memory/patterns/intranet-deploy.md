# 패턴 — 사내 k8s 무중단 배포 + 운영 플레이북

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/agora/knowledge.md`(노하우·함정),
> `archive/llm-wiki/knowledge.md`(배포·port-forward 함정), `archive/llm-wiki/ideas.md`("사내 k8s 배포 플레이북").
> 2개 프로젝트 공통. ⚠️ company-internal 일반화.

## 문제

사내 k8s(`<사내k8s>`)에 처음 배포하거나 롤링 업데이트를 할 때, 다운타임·probe 설정 실수·
시크릿 누락·`set image` 의 사각지대 등 반복적으로 같은 함정에 빠진다.
운영 중 DB 점검을 위한 port-forward 세션도 tmux/nohup 환경 차이로 즉사하는 패턴이 반복된다.

## 패턴

### 무중단 롤링 레시피

| 항목 | 설정값 | 이유 |
|------|--------|------|
| `replicas` | ≥ 2 | 단일 파드 롤링 불가 |
| `strategy` | RollingUpdate(maxSurge:1, maxUnavailable:0) | 구파드 먼저 살림 |
| `minReadySeconds` | 10 | 새 파드 안정화 대기 |
| `preStop sleep` | 10초 | 엔드포인트 draining(트래픽 수신 차단→종료) |
| `terminationGracePeriodSeconds` | 30 | graceful shutdown 보장 |
| `readinessProbe` | `/api/health` HTTP(DB 핑 포함) | 트래픽 진입 게이트 |
| `livenessProbe` | `tcpSocket` (DB 비의존) | DB 블립에 전 파드 동시 재시작 방지 — probe 분리 필수 |
| `PodDisruptionBudget` | minAvailable:1 | 노드 유지보수 중 가용성 유지 |

### 단일 라이터 앱 (git 서버 등 동시쓰기 불가)

- `replicas:1` + `strategy: Recreate`
- 진짜 무중단이 필요하면: Postgres advisory lock으로 크로스파드 쓰기락 + RWX PVC + replicas:2

### 다중 replica 파일 공유

- RWO 블록스토리지는 단일 노드 마운트만 → **RWX(공유 파일시스템) PVC** 사용

### DB 초기화 / 스키마

- 초기 스키마·시드: ConfigMap → `/docker-entrypoint-initdb.d` 마운트 (빈 볼륨 최초 1회 실행)
- 마이그레이션: 클러스터 내 **migrate Job** (서버에 node/npm 설치 불필요)

### TLS

- cert-manager + Ingress 어노테이션(`cert-manager.io/cluster-issuer`) → 호스트 전용 인증서 자동발급
- 흐름: Ingress → Certificate → Secret 자동 연결

### Standalone 절대 URL

- `req.url` 에 `0.0.0.0` 박힘 → 리다이렉트·origin 은 반드시 `x-forwarded-host` / `host` 헤더 기준

### CI / 레지스트리

- GitLab CI: `test → docker-build → deploy` → `<사내레지스트리>`
- 러너 SA 권한: `kubectl set image` 만 허용 → **최초 리소스는 사람이 `kubectl apply`**
- 자격증명: CI Variables + K8s Secret `envFrom secretRef` 외부화 (CI 변수에 시크릿 경로 남기지 말 것)
- SA에 secret 생성 권한 없으면 최초 셋업은 `first-setup.sh` 별도 제공

## ★함정

- **`set image` ≠ 매니페스트 전체 반영**: 볼륨·env 등 매니페스트 변경은 `kubectl apply -f` 또는 `patch` 필요.
  "동작 안 하면 **배포 상태부터** 확인" — 미배포가 흔한 원인.
- **시크릿은 CI 변수가 아니라 서버 Secret(`envFrom secretRef`)**: CI 변수 경로를 남기면 나중에 빈 값으로 덮어쓰는 함정.
- **tmux/nohup port-forward 즉사**: `nohup`/`tmux new -d` 는 PATH·KUBECONFIG 미로딩 → 즉사.
  올바른 방법: **빈 tmux 세션 먼저 열고 `send-keys` 로 명령 전송**. 로컬 DB 포트와 터널 포트 혼동 금지.

## 신호 (이 패턴을 써야 할 때)

- 사내 k8s(`<사내k8s>`, `<사내ns>`) 네임스페이스에 신규 서비스 배포할 때
- 롤링 업데이트 후 500/다운타임 발생 시 원인 체크리스트
- 운영 DB를 외부 노출 없이 점검해야 할 때 (port-forward 플레이북)
- CI 파이프라인에서 `set image` 만 하는데 변경이 반영 안 될 때

## 레일 적용 (빌드는 backlog)

- `deploy-runbook` 스킬의 **`intranet` 프로파일** 체크리스트로 삽입
- `/deploy` 명령이 `intranet` 프로파일 선택 시 이 패턴을 smoke 구성 가이드로 참조
- intra 프로젝트가 이 프로파일의 첫 실사용

관련: [[ingest-convergence]], lessons.
