# 작업 가이드 (CLAUDE.md)

> 🟢 **이 프로젝트를 처음 이어받는 세션이라면 [`HANDOFF.md`](HANDOFF.md) 를 먼저 읽으세요.**
> 현재 상태(R0~R3 완료·R4 연기)·확정된 결정·다음 작업·설계 근거 위치가 정리돼 있습니다.

이 저장소(`second-brain`, 루트 `E:\second-brain`)는 **아이디어를 자동으로 프로젝트로 구성하는 레일**이다.
**창작 → 개발 → 배포** 3모듈이 게이트가 있는 산출물 파이프라인으로 동작한다. 이 파일은 이 레일을 운영하는
Claude의 **행동 규칙**이다.

## 📌 핵심 규칙

1. **산출물이 곧 인터페이스다.** 모듈 사이에는 사람이 읽는 markdown + 기계가 읽는 `*.manifest.yaml` 만 넘긴다.
   다음 모듈은 그 산출물만으로 추가 맥락 없이 동작해야 한다. 대화 맥락에 의존하지 말 것.
2. **게이트를 건너뛰지 않는다.** 각 명령은 산출물 + `<stage>/GATE.md` 를 쓰고 **멈춘다**. 다음 명령은
   `projects/<slug>/.state/pipeline.yaml` 의 이전 단계 `gate: approved` 가 아니면 **하드 거부**한다.
3. **검증을 모듈 안에 넣는다.** 각 모듈은 끝에서 critic(adversarial-review 등)을 돌려 스스로 결함을 잡고
   루프백한다. 끝에서만 검증하지 않는다(오류는 하류로 갈수록 비싸진다).
4. **REQ-ID 척추.** 모든 요구는 `REQ-{CAT}-{NNN}` 으로 식별한다. 개발은 REQ당 작업/PR 1개,
   배포는 REQ당 smoke 1개로 추적한다. 아무 요구도 조용히 누락되지 않는다.
5. **레일은 사람이 만들지 않는 프로젝트를 만든다.** `projects/<slug>/` 아래 산출물은 명령이 생성한다.
   사람은 게이트에서 검토·승인·반복만 한다.

## 비용 계층 (무료~소과금)

- 명령·스킬의 각 step에 `[tier: judgment]` 또는 `[tier: bulk]` 태그가 붙어 있다.
  - `judgment` = 판단이 중요한 소수 단계(아이디어 프레이밍, 심사, 적대적 리뷰, 최종 통합) → 메인 모델(Opus)이 직접.
  - `bulk` = 대량·지루한 작업(초안, 보일러플레이트, 문서 확장, 스캐폴드) → **더 싼 모델로 위임**.
- **R4a 활성(라우팅 계약 = `rails/routing.md`)**: `[tier: bulk]` step 은 **`Agent`/`Task` 를 `model: sonnet` 으로 띄워 위임**하고(대량은 병렬),
  `[tier: judgment]` step 은 메인(Opus)이 직접 한다. 경계가 애매하면 judgment(품질 안전). 정본 매핑 = `rails/model-tiers.yaml`.
  태그를 임의로 바꾸지 말 것(라우팅 계약). 진짜 $0(로컬 qwen/Gemini)은 R4b(옵션·미구현, `route.mjs`+`.env`).

## prior art — 읽기 전용 참조 (복사 금지)

- `E:\llm-wiki` : 번호 설계 문서 arc(`docs/01~09`), REQ-ID 규약(`docs/02-requirements.md`),
  HANDOFF 재개성(`HANDOFF.md`), 멀티 프로바이더 비용 라우팅(`lib/anthropic.ts`,`lib/cost.ts`).
- `E:\agora` : 사내 배포 스택(`docs/12-deployment.md`,`.gitlab-ci.yml`,`agora/deploy/k8s/*`),
  graceful shutdown(`agora/src/instrumentation.ts`), 운영 런북(`docs/14·16`), 사내 인증(`docs/07 §8`).
- **규율**: 이 두 repo 안에는 어떤 second-brain 파일도 만들지 않는다. 패턴만 일반화하고 출처 경로를 인용한다.
  agora 문서를 복사하지 않는다(도메인이 다름). agora 인증은 사내 실명 기반이며, 레일이 **생성하는** 산출물에는
  **익명·민감 데이터를 인제스트하지 않는다**. (단, 개인 백업용 `archive/` 영역은 별도 정책 — 아래 참조.)

## archive — 과거 프로젝트 보관 (개인 백업)

`archive/<project>/` 는 과거 프로젝트(agora·llm-wiki 등)의 **채팅 이력·노하우·아이디어**를 모아 클라우드에 영속
백업하는 **개인 second brain** 영역이다. `/archive <project> [--encrypt]` 명령(+ `chat-archivist` 스킬)이 생성한다.
`projects/`(레일 생성물)·`memory/`(retro 교훈)와 별개다.

- **비밀 자동 마스킹**: 인제스트 시 채팅 사본에서 API 키·비밀번호를 자동으로 `[REDACTED-SECRET]` 처리한다
  (원본 `~/.claude/projects` 는 불변). `chats/SECRETS.md` 에 결과를 남긴다.
- **사내정보 자동 격리**: 엔진이 채팅에서 사내 마커(도메인·네임스페이스·사설 IP)를 감지하면, `personal` 이라도
  평문 raw 를 자동으로 커밋에서 격리(.gitignore)한다 — 회사정보의 개인 클라우드 유출 방지(안전 기본값). `allow_internal: true`
  로만 해제. **실제 식별 마커는 gitignore 된 `rails/internal-markers.local` 에 두고 코드/리포트엔 안 박는다.** 결과 `chats/SENSITIVE.md`.
- **회사 데이터(`sensitivity: company-internal`)**: 평문 raw 는 `chats/.gitignore` 로 커밋 차단되고, `--encrypt`
  로 만든 `chats/raw.tar.gpg`(gpg AES256) 만 커밋한다. 평소 읽기는 일반화된 `knowledge.md` 로.
- **개인 데이터**는 마스킹 후 평문 raw 를 커밋해도 된다(브라우징 편의).
- **갱신은 pull 모델**: `/archive all`(전체) 또는 `/archive <p>` 를 다시 돌리면 새 세션이 반영된다(멱등).
  **주기적 자동 새로고침**은 `schedule-setup.ps1`(Windows 예약작업)→`refresh.ps1` 가 무료로 수행한다.
  `auto_push: true`(개인) 만 자동 커밋·푸시하고, **회사 데이터(`auto_push: false`)는 자동 제외**, 잔여 비밀 시 푸시 중단.
- **지식 distill 은 자동화하지 않는다**(판단=유료). 엔진은 `newSinceDistill` 로 재정리 필요만 표시.
- **푸시는 사용자가 명시 지시할 때만**(수동 경로). 비밀 게이트 통과(또는 암호화) 전에는 푸시하지 않는다.
  단, 위 자동 새로고침을 **사용자가 등록한 경우** 그 범위(개인·잔여비밀0)에 한해 자동 푸시가 사전 승인된 것으로 본다.
- **public 전환 / 공동작업자 추가 전**에는 `company-internal` 아카이브를 반드시 암호화 또는 제거한다.
- 소스 매핑은 `rails/archive-sources.yaml`. 원본 repo(`E:\...`)에는 아무 파일도 만들지 않는다.

## 배포 프로파일

- `local` (기본·프로토타입): docker-compose, dry-run 가능. 1인 운영.
- `intranet` (사내 실배포): GitLab CI(test→docker-build→deploy) → Harbor → 사내 k8s rolling
  (replicas:2, maxUnavailable:0, preStop sleep, readinessProbe), cert-manager TLS, ConfigMap initdb.
  agora 패턴을 일반화하되 복사하지 않는다. `/api/health` + SIGTERM graceful shutdown 필수.

## 회고 = second brain의 보상

`/retro` 는 3개 모듈의 HANDOFF·GATE·critic 루프백을 읽어 `memory/lessons/<slug>.md` 로 distill하고,
레일 수정(템플릿 필드 추가/명령 step 강화/tier 재배정)을 **제안만** 한다. 레일 변경은 **사람이 승인**한다.
교훈은 append-only, 승격된 패턴(`memory/patterns/`)만 템플릿을 바꾼다(레일 안정성).
또한 `/retro`(레일 수준)는 `archive/*` 를 가로질러 **재사용 패턴을 자동 채굴**한다(2+ 프로젝트 반복 결정 → 승격 후보).
**열린 학습 원칙**: 교훈·패턴은 *과거를 복제하는 레시피*가 아니라 **결정·실패·트레이드오프·"언제 같게/언제 다르게"** 로 적는다 —
다음 프로젝트가 기존처럼도, 다르게도 고를 수 있는 **열린 구조**. (목적은 사례 재현이 아니라 판단을 물려주는 것.)

## 시크릿·푸시 정책

- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` 등 시크릿은 코드/저장소에 넣지 않는다. `.env` 커밋 금지.
- 원격 푸시(`https://github.com/majorTom-cat/second-brain`)는 **사용자가 명시 지시할 때만**. 임의 푸시 금지.

## 용어

- **레일(rails)** = 이 repo의 재사용 자산(명령·스킬·템플릿·tier 정책·교훈). 모델 무관 markdown/prompt.
- **프로젝트(project)** = `projects/<slug>/` 아래 생성된 한 산출물 묶음.
- **게이트(gate)** = 모듈 경계의 사람 검수 지점.
