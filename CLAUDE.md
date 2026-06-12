# 작업 가이드 (CLAUDE.md)

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
  - `judgment` = 판단이 중요한 소수 단계(아이디어 프레이밍, 심사, 적대적 리뷰, 최종 통합) → 유료 Claude(소액).
  - `bulk` = 대량·지루한 작업(초안, 보일러플레이트, 문서 확장) → 무료(로컬 qwen / Gemini).
- 지금(R1~R3)은 태그만 의미를 가지며 전부 직접 실행해도 된다. 실제 라우팅은 R4 엔진이
  `rails/model-tiers.yaml` + `.env` 를 읽어 수행한다. 태그를 임의로 바꾸지 말 것(라우팅 계약).

## prior art — 읽기 전용 참조 (복사 금지)

- `E:\llm-wiki` : 번호 설계 문서 arc(`docs/01~09`), REQ-ID 규약(`docs/02-requirements.md`),
  HANDOFF 재개성(`HANDOFF.md`), 멀티 프로바이더 비용 라우팅(`lib/anthropic.ts`,`lib/cost.ts`).
- `E:\agora` : 사내 배포 스택(`docs/12-deployment.md`,`.gitlab-ci.yml`,`agora/deploy/k8s/*`),
  graceful shutdown(`agora/src/instrumentation.ts`), 운영 런북(`docs/14·16`), 사내 인증(`docs/07 §8`).
- **규율**: 이 두 repo 안에는 어떤 second-brain 파일도 만들지 않는다. 패턴만 일반화하고 출처 경로를 인용한다.
  agora 문서를 복사하지 않는다(도메인이 다름). agora 인증은 사내 실명 기반이며, **익명·민감 데이터는 인제스트 금지**.

## 배포 프로파일

- `local` (기본·프로토타입): docker-compose, dry-run 가능. 1인 운영.
- `intranet` (사내 실배포): GitLab CI(test→docker-build→deploy) → Harbor → 사내 k8s rolling
  (replicas:2, maxUnavailable:0, preStop sleep, readinessProbe), cert-manager TLS, ConfigMap initdb.
  agora 패턴을 일반화하되 복사하지 않는다. `/api/health` + SIGTERM graceful shutdown 필수.

## 회고 = second brain의 보상

`/retro` 는 3개 모듈의 HANDOFF·GATE·critic 루프백을 읽어 `memory/lessons/<slug>.md` 로 distill하고,
레일 수정(템플릿 필드 추가/명령 step 강화/tier 재배정)을 **제안만** 한다. 레일 변경은 **사람이 승인**한다.
교훈은 append-only, 승격된 패턴(`memory/patterns/`)만 템플릿을 바꾼다(레일 안정성).

## 시크릿·푸시 정책

- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` 등 시크릿은 코드/저장소에 넣지 않는다. `.env` 커밋 금지.
- 원격 푸시(`https://github.com/majorTom-cat/second-brain`)는 **사용자가 명시 지시할 때만**. 임의 푸시 금지.

## 용어

- **레일(rails)** = 이 repo의 재사용 자산(명령·스킬·템플릿·tier 정책·교훈). 모델 무관 markdown/prompt.
- **프로젝트(project)** = `projects/<slug>/` 아래 생성된 한 산출물 묶음.
- **게이트(gate)** = 모듈 경계의 사람 검수 지점.
