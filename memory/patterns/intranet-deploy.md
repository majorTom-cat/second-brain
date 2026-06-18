# 패턴 — 사내 k8s 무중단 배포 + 운영 플레이북

> 승격: 2026-06-18 (`/retro` 아카이브 채굴). 근거: `archive/agora/knowledge.md`(노하우·함정),
> `archive/llm-wiki/knowledge.md`(배포·port-forward 함정), `archive/llm-wiki/ideas.md`("사내 k8s 배포 플레이북").
> 2개 프로젝트 공통. ⚠️ company-internal 일반화.

## 결정 (fork) — 무슨 갈림길인가

**단일 라이터 앱** (`replicas:1` + `strategy:Recreate`, 배포 시 수 초 blip 감수)
vs **무중단 롤링** (`replicas≥2` + RollingUpdate, 선택적으로 쓰기락·RWX 추가)

그 아래에도 세부 갈림길이 있다: probe 분리 방식 · preStop 길이 · PDB 유무 ·
스토리지 RWO vs RWX · DB 초기화 방식(ConfigMap initdb vs migrate Job) ·
CI 배포 명령(`set image` vs `apply`).

## 계기·증거 — 어느 프로젝트에서 무엇이 실패·통했나

- **agora** — 사내 `<사내k8s>` 실배포. `replicas:2` + RollingUpdate + preStop 10초로
  운영 중 롤링 업데이트를 무중단으로 수행. probe 분리(liveness=tcpSocket,
  readiness=/api/health) 전에는 DB 블립 때 전 파드가 동시 재시작하는 장애 발생.
- **llm-wiki** — git 저장소를 직접 쓰는 단일 라이터 구조. `replicas:2`로 올렸더니
  두 파드가 동시에 git push → 충돌. `replicas:1` + `strategy:Recreate`로 단순화 후 안정.
- **공통** — `set image`만 쓰는 CI에서 볼륨·env 변경이 반영 안 되는 사고 반복.
  port-forward를 nohup/tmux detach로 띄웠다가 즉사하는 패턴도 두 프로젝트에서 반복.

## 선택지와 트레이드오프

| | 단일 라이터 (`replicas:1` + Recreate) | 무중단 롤링 (`replicas≥2` + RollingUpdate) |
|---|---|---|
| **가용성** | 배포 시 수 초 blip(다운타임 짧음) | 배포 중 무중단 |
| **복잡도** | 낮음 — 쓰기락·RWX 불필요 | 높음 — preStop·PDB·probe 분리 필수 |
| **비용** | 파드 1개 | 파드 ≥2개 (컴퓨트·스토리지 추가) |
| **적합 앱** | 파일·git 등 동시쓰기 불가 앱 | 무상태·DB 기반 앱, 가용성 SLA 있는 서비스 |
| **언제 다르게** | 가용성 SLA 필요해지면 → 무중단으로 | 파일/git 동시쓰기 있으면 → 단일 라이터로 |

**세부 결정별 트레이드오프**

- **probe 분리** (liveness=tcpSocket, readiness=/api/health): 분리하지 않으면 DB 블립 시 전 파드 동시 재시작.
  거의 항상 분리 권장. 다르게 갈 신호: 외부 의존 없는 순수 인메모리 앱(분리 불필요).
- **preStop sleep 10초**: 엔드포인트 draining 보장. 짧게 가도 될 신호: 트래픽이 없는 배치 잡.
- **PDB(minAvailable:1)**: 노드 유지보수 중 강제 퇴출 방지. 다르게: replicas:1 Recreate 앱엔 무의미.
- **RWO vs RWX**: 다중 replica가 같은 볼륨 마운트 필요 시 RWX 필수. replicas:1이면 RWO로 충분.
- **ConfigMap initdb vs migrate Job**: 빈 볼륨 최초 1회 초기화 → ConfigMap. 반복 마이그레이션 → migrate Job.
- **`set image` vs `kubectl apply`**: `set image`는 이미지 태그만 교체; 볼륨·env 변경은 반영 안 됨.
  매니페스트 변경이 없는 경우에만 `set image` 사용.

## 언제 이대로 · 언제 다르게

- 이대로(**무중단 롤링**) 할 신호:
  - 무상태 HTTP 앱 또는 DB 기반 앱 (동시쓰기 충돌 없음)
  - 가용성 SLA가 있거나 배포 blip이 허용 안 되는 서비스
  - `<사내k8s>` `<사내ns>` 네임스페이스 신규 서비스 배포
- 이대로(**단일 라이터 + Recreate**) 할 신호:
  - 파일시스템·git 등 동시 쓰기가 불가한 앱
  - 운영팀이 수 초 blip을 허용하는 내부 도구
- 다르게 갈 신호:
  - 단일 라이터인데 진짜 무중단 필요 → Postgres advisory lock + RWX PVC + replicas:2 조합
  - 트래픽이 거의 없는 배치·도구성 앱 → probe·PDB 단순화 가능
  - 온프레미스 환경이 아닌 퍼블릭 클라우드 → 클라우드 네이티브 LB/PDB 정책 재검토

## 레일 적용 (빌드는 backlog)

- `deploy-runbook` 스킬의 **`intranet` 프로파일** 체크리스트로 삽입
- `/deploy` 명령이 `intranet` 프로파일 선택 시 이 패턴을 smoke 구성 가이드로 참조
- intra 프로젝트가 이 프로파일의 첫 실사용

---

### 무중단 롤링 주 선택 시 기본값 (검증된 설정)

| 항목 | 기본값 | 이유 |
|------|--------|------|
| `replicas` | ≥ 2 | 단일 파드 롤링 불가 |
| `strategy` | RollingUpdate(maxSurge:1, maxUnavailable:0) | 구파드 먼저 살림 |
| `minReadySeconds` | 10 | 새 파드 안정화 대기 |
| `preStop sleep` | 10초 | 엔드포인트 draining |
| `terminationGracePeriodSeconds` | 30 | graceful shutdown 보장 |
| `readinessProbe` | `/api/health` HTTP (DB 핑 포함) | 트래픽 진입 게이트 |
| `livenessProbe` | `tcpSocket` (DB 비의존) | DB 블립에 전 파드 동시 재시작 방지 |
| `PodDisruptionBudget` | minAvailable:1 | 노드 유지보수 중 가용성 유지 |

### TLS

- cert-manager + Ingress 어노테이션(`cert-manager.io/cluster-issuer`) → 호스트 전용 인증서 자동발급
- 흐름: Ingress → Certificate → Secret 자동 연결

### Standalone 절대 URL

- `req.url`에 `0.0.0.0` 박힘 → 리다이렉트·origin은 반드시 `x-forwarded-host` / `host` 헤더 기준

### CI / 레지스트리

- GitLab CI: `test → docker-build → deploy` → `<사내레지스트리>`
- 러너 SA 권한: `kubectl set image`만 허용 → **최초 리소스는 사람이 `kubectl apply`**
- 자격증명: CI Variables + K8s Secret `envFrom secretRef` 외부화 (CI 변수에 시크릿 경로 남기지 말 것)
- SA에 secret 생성 권한 없으면 최초 셋업은 `first-setup.sh` 별도 제공

### 운영 DB port-forward 플레이북

- **nohup/tmux detach 즉사 방지**: 빈 tmux 세션 먼저 열고 `send-keys`로 명령 전송
  (nohup·`tmux new -d`는 PATH·KUBECONFIG 미로딩 → 즉사)
- 로컬 DB 포트와 터널 포트 혼동 금지

## ★ 공통 주의 (함정)

- **`set image` ≠ 매니페스트 전체 반영**: 볼륨·env 등 매니페스트 변경은 `kubectl apply -f` 또는 `patch` 필요.
  "동작 안 하면 **배포 상태부터** 확인" — 미배포가 흔한 원인.
- **시크릿은 CI 변수가 아니라 서버 Secret(`envFrom secretRef`)**: CI 변수 경로를 남기면 나중에 빈 값으로 덮어쓰는 함정.
- **tmux/nohup port-forward 즉사**: `nohup`/`tmux new -d`는 PATH·KUBECONFIG 미로딩 → 즉사.
  올바른 방법: **빈 tmux 세션 먼저 열고 `send-keys`로 명령 전송**. 로컬 DB 포트와 터널 포트 혼동 금지.

관련: [[ingest-convergence]], lessons.
