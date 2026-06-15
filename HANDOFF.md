# HANDOFF — second-brain 인수인계

> 🟢 **이 repo를 처음 이어받는 세션이면 이 파일을 먼저 읽으세요.** 그다음 `CLAUDE.md`(운영 규칙) → `README.md`(사용법).
> 전체 설계 근거가 필요하면 §6의 플랜 파일을 읽으세요.

## 0. 최신 상태 (델타 로그 — 최신이 위)

- [2026-06-15] **사내정보 자동 감지·격리 추가**(사용자 요청: 위험정보 분리). 엔진이 채팅에서 사내 마커(도메인·네임스페이스·
  사설 IP)를 세어, personal 이라도 STRONG 감지 시 평문 raw 를 자동 `.gitignore` 격리. `allow_internal: true` 로만 해제.
  실제 식별 마커는 gitignore 된 `rails/internal-markers.local` 로 분리(코드/리포트엔 일반 라벨만). 프로젝트별 `chats/SENSITIVE.md`.
  **llm-wiki: 원본에 사내주소(intranet/harbor 등)가 이미 GitHub 히스토리에 평문 존재** — 사용자가 '그대로 둠'(option 3) 선택 →
  `allow_internal: true`. llm-wiki 지식 재distill(k8s 배포·트릴레마·사용량 가시화·413 등). 미해결: HANDOFF §5의 public 전환 시
  기존 참조(`docs/DEPLOY 템플릿`·이 §5) 일반화 필요.

- [2026-06-13] **`/archive` 전역화** — 어느 프로젝트에서든 호출 가능. 원본 백업 `archive.global.md`(repo 내),
  설치본 `~/.claude/commands/archive.md`(repo 밖·로컬). 엔진이 cwd 무관하게 `E:/second-brain` 으로 씀(검증함).
  재설치: `cp E:/second-brain/.claude/skills/chat-archivist/archive.global.md ~/.claude/commands/archive.md`.
  pull 모델 재확인: 데이터는 항상 second-brain 으로 모이고, 전역판은 트리거 편의일 뿐.

- [2026-06-13] **archive 새로고침 자동화** — `/archive all`(전체)·`auto`(개인만) 모드 + 미등록 폴더 탐지 +
  `newSinceDistill`(distill 후 새 세션) 표시. `refresh.ps1`(개인 프로젝트만 ingest→커밋→푸시, 잔여 비밀 시 중단,
  `-DryRun`) + `schedule-setup.ps1`(Windows 예약작업 등록/제거). `archive-sources.yaml` 에 `auto_push` 필드 추가
  (llm-wiki=true, agora=false). PS 스크립트는 ASCII 전용(PS5.1 UTF-8 오독 회피). pull 모델 — second-brain 에서 끌어옴.

- [2026-06-13] **archive/ 영역 + `/archive` 명령 추가 — 과거 프로젝트 집대성**. `chat-archivist` 스킬 +
  `ingest.mjs` 엔진(채팅 복사·세션 색인·**비밀 자동 마스킹**·README/INDEX 생성). `rails/archive-sources.yaml` 소스맵.
  **agora(15세션)·llm-wiki(3세션) 인제스트 완료.** 정책: 개인 데이터는 마스킹 후 평문 커밋, 회사 데이터(agora)는
  평문 raw `.gitignore` + `--encrypt`(gpg AES256)로 `raw.tar.gpg` 만 커밋. **main 에 푸시 완료(`ca0a84a`)**.
  단 **agora 원본 raw 암호화(`bash .claude/skills/chat-archivist/encrypt.sh agora`)는 사용자 선택으로 보류** — 실행하면
  `raw.tar.gpg` 가 생겨 추가 커밋하면 agora 채팅 원본도 클라우드 백업됨(현재는 일반화된 knowledge + 세션 색인만 올라감).
  CLAUDE.md 에 `## archive` 정책 추가(레일 자기모순 해소). knowledge/ideas 1차 distill 완료(agora는 일반화).
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
