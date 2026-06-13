# second-brain — 지식 (노하우·결정·함정)

> 이 repo 자신의 메타 기록. 상세 운영 규칙은 `E:\second-brain\CLAUDE.md`·`HANDOFF.md`. [tier: judgment]
> ⚠️ 이 프로젝트 대화엔 agora 사내 정보 언급이 섞여 company-internal 분류 → 평문 raw 는 `.gitignore`(미푸시).

## 무엇을 만든 프로젝트인가
두 가지를 한 repo에 둔 개인 second brain: ① **레일(rails)** — 아이디어 한 문단을 `창작→개발→배포→회고` 게이트 파이프라인으로 자동 구성(`/creative`·`/develop`·`/deploy`·`/retro`). ② **archive/** — 과거 프로젝트(agora·llm-wiki 등)의 채팅 이력·노하우·아이디어를 모아 클라우드(GitHub private)에 영속 백업(`/archive`). 둘은 분리: 레일은 새 프로젝트를 *만들고*, archive는 끝난 프로젝트를 *보존*한다.

## 기술 스택 / 구조 한눈에
- **Claude Code 네이티브**: 명령(`.claude/commands/*.md`)=얇은 오케스트레이터, 스킬(`.claude/skills/*/SKILL.md`)=무거운 절차. 모델 무관 markdown/prompt.
- **archive 엔진**: `chat-archivist/ingest.mjs`(node, 무료·로컬) — 채팅 복사·비밀 마스킹·색인·README/INDEX 생성. `refresh.ps1`+`schedule-setup.ps1`(주기 자동), `encrypt.sh`(gpg AES256).
- **소스**: 채팅 원본은 `~/.claude/projects/<인코딩폴더>/*.jsonl`(Claude Code가 모든 프로젝트를 전역 자동저장). archive는 여기서 **pull**.
- **비용계층 seam**: `[tier: judgment]`(유료 Claude 소액) / `[tier: bulk]`(무료 로컬). 라우팅 엔진(R4)은 미구현.

## 핵심 결정 (왜 그렇게 했나)
- **산출물=인터페이스 + 게이트**: 모듈 사이엔 markdown + `*.manifest.yaml` 만 넘기고 경계마다 사람이 검수. 오류의 하류 전파 차단.
- **REQ-ID 척추**: 모든 요구를 `REQ-{CAT}-{NNN}` 로 추적(조용한 누락 방지).
- **archive는 pull 모델**: second-brain이 전역 `~/.claude/projects` 를 끌어옴(각 프로젝트에서 push 안 함). 전역 명령은 트리거 편의일 뿐, 데이터는 늘 여기로 모임.
- **비밀 자동 마스킹 + 민감도 분리**: 인제스트가 키/비번을 사본에서 `[REDACTED-SECRET]` 처리. `company-internal`=평문 raw `.gitignore`+gpg 암호화·자동푸시 제외 / `personal`=마스킹 후 평문 커밋·자동푸시 허용.
- **푸시는 명시 지시 시에만**(자동 새로고침을 사용자가 켠 범위 제외).

## 노하우 / 재사용 패턴
- **cwd-독립 엔진**: `ingest.mjs` 가 `import.meta.url` 기준으로 repo 루트를 찾음 → 어느 폴더에서 호출해도 항상 second-brain에 씀(전역 명령의 토대).
- **민감도를 데이터 옆에**: 회사 프로젝트는 엔진이 `chats/.gitignore`(raw/·raw.tar)를 자동 생성 → 정책이 자동 확장.
- **멱등 새로고침**: 재실행하면 새 세션 자동 반영. `newSinceDistill`(소스 mtime > knowledge.md mtime)로 "재정리 필요"만 표시, distill(유료)은 수동.
- **전역 명령 백업**: `~/.claude/commands/` 는 repo 밖이라 원본을 `archive.global.md` 로 repo에 보관(포맷 시 cp 복구).

## 함정 / 다시는 안 할 것
- **PowerShell 5.1 은 BOM 없는 UTF-8 `.ps1` 의 한글을 시스템 코드페이지로 오독** → 로그 mojibake. PS 스크립트 출력문은 **ASCII 전용**으로(한글은 node 출력/.md 에만).
- **채팅엔 진짜 API 키가 섞여 있다**(agora·llm-wiki 둘 다 발견). 평문 푸시 전 반드시 마스킹/암호화 — git 히스토리에 박히면 되돌리기 어려움.
- **회사 기밀의 개인 클라우드 이동**은 "private라 나만 봄"이어도 정책 위반 소지 — company-internal 은 raw 미푸시 기본.
- README "마지막 인제스트"·SECRETS "스캔 일시" 타임스탬프가 매 실행 갱신돼 무변경에도 diff 발생(소소한 churn, 미해결).

## 미해결 / 다음에 이어가면
- **R4 비용 라우팅 엔진** 미구현(`rails/model-tiers.yaml`+`.env` 읽어 bulk→무료/judgment→Claude).
- **레일 1바퀴 검증**: 작은 아이디어로 `/creative`→`/deploy`→`/retro` 미실행.
- **agora 원본 raw 암호화** 보류(사용자 선택). 미등록 프로젝트 자동탐지의 민감도 안전 기본값.
- 타임스탬프 churn 억제, company-internal 색인 주제(topic) 추가 정제 검토.

---
출처: `E:\second-brain\CLAUDE.md`·`HANDOFF.md`·`README.md`, `.claude/skills/chat-archivist/*`, `chats/INDEX.md`.
