# HANDOFF — second-brain 인수인계

> 🟢 **이 repo를 처음 이어받는 세션이면 이 파일을 먼저 읽으세요.** 그다음 `CLAUDE.md`(운영 규칙) → `README.md`(사용법).
> 전체 설계 근거가 필요하면 §6의 플랜 파일을 읽으세요.

## 0. 최신 상태 (델타 로그 — 최신이 위)

- [2026-06-13] **레일 스캐폴드 R0~R3 완료** — 명령 5(/creative /develop /deploy /retro /status) + 스킬 5
  + 아티팩트 템플릿(창작 00~09·SPEC / 개발 TASK·PR·DEV / 배포 RUNBOOK·DEPLOY) + REQ-ID 척추 + 비용계층 tier seam
  + memory 골격. 로컬 커밋 `32a1b30`, **private GitHub `majorTom-cat/second-brain` 의 main 에 푸시 완료**.
- 미완: **R4(실제 비용 라우팅 엔진)** 연기. 첫 프로젝트로 파이프라인 1바퀴 검증 아직 안 함.

## 1. 이 repo가 뭔가 (한 문단)

아이디어 한 문단을 **창작(설계) → 개발 → 배포** 3모듈로 자동 구성하는 **레일(공장)**. 마법 버튼이 아니라
**게이트가 있는 산출물 파이프라인**: 모듈 사이 산출물이 계약이고, 경계마다 사람이 5분 검수하는 게이트가 있으며,
끝의 `/retro` 가 교훈을 레일에 되먹인다(= second brain). 명령을 돌리면 `projects/<slug>/` 에 프로젝트가 생성된다.

## 2. 확정된 결정 (잠김)

| 결정 | 내용 | 비고 |
| --- | --- | --- |
| 실행 엔진 | **하이브리드** — Claude Code 네이티브 레일(markdown/prompt). 모델 무관. | R4에서 무료모델 라우팅 plug |
| 과금 | **무료~소과금 중간** → 비용계층 라우팅 | judgment=유료 Claude 소액, bulk=무료 qwen/Gemini |
| 격리 | `E:\llm-wiki`·`E:\agora` 는 **읽기 전용 prior-art** | 그 폴더에 파일 안 만듦, 패턴만 일반화(복사 금지) |
| repo | private GitHub `majorTom-cat/second-brain` | 사내 참조 포함 → public 전환 전 일반화 필요 |
| 푸시 | **사용자 명시 지시 시에만** | |

## 3. 운영 모델 (명령 5개)

```
/creative "<아이디어>" → 검토 → /develop <slug> → 검토 → /deploy <slug> → /retro <slug>
/status   # 상태·대기 게이트(읽기 전용)
```

각 명령은 산출물 + `<stage>/GATE.md` 쓰고 **정지**. 다음 명령은 `projects/<slug>/.state/pipeline.yaml` 의
이전 단계 `gate: approved` 가 아니면 **거부**. 상세는 `README.md`. 각 명령의 절차는 `.claude/commands/*.md`.

## 4. prior art 경로 (읽기 전용, 복사 금지)

- `E:\llm-wiki` — 번호 docs arc(`docs/01~09`), REQ-ID(`docs/02-requirements.md`), HANDOFF 재개성,
  멀티 프로바이더 비용 라우팅(`lib/anthropic.ts` `providerFor`, `lib/cost.ts`). ← R4 포팅 대상.
- `E:\agora` — 사내 배포 스택(`docs/12-deployment.md`,`.gitlab-ci.yml`,`agora/deploy/k8s/*`),
  graceful shutdown(`agora/src/instrumentation.ts`), 운영 런북(`docs/14·16`), 사내 인증(`docs/07 §8`).

## 5. 다음에 할 일 (우선순위)

1. **첫 검증**: 작은 아이디어로 `/creative` → 게이트까지 → `/develop` → `/deploy` → `/retro` 1바퀴.
   레일의 거친 부분을 첫 교훈으로 만들면 루프가 닫힌다.
2. **R4 — 비용 라우팅 엔진**: `lib/anthropic.ts`/`models.ts`/`cost.ts`(llm-wiki) 포팅. 이미 깔린 `[tier: ...]`
   태그 + `rails/model-tiers.yaml` 을 읽어 bulk→무료, judgment→Claude 라우팅 + 일 예산. R1~R3는 그대로.
3. **public 전환 시**: `intranet.bns.co.kr`·`harbor.bns.co.kr`·`bnspace`·`@bns.co.kr` 참조 일반화 후.

## 6. 전체 설계 근거 (repo 밖, 필요 시 Read)

- 승인된 플랜: `C:\Users\Lenovo\.claude\plans\idempotent-sleeping-beacon.md` — 7개 절(구조·계약·명령·tier·게이트·회고·빌드순서) 전체 근거.
- 비용 민감도 등 사용자 컨텍스트는 llm-wiki 스코프 메모리(`...\.claude\projects\E--llm-wiki\memory\`)에 있음(이 세션 한정).

## 7. 검증 방법

- `/status` 로 상태 확인. `/creative "할일 메모 앱"` 같은 작은 입력으로 창작 게이트까지 도달하는지.
- 산출물이 `projects/<slug>/creative/` 에 번호 문서 + REQ표 + `SPEC.manifest.yaml` 로 생성되고,
  acceptance 없는 REQ를 critic이 거부하며, `creative/GATE.md` 에서 멈추면 정상.
