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
- **러프 산출물을 정지 이미지(PNG 묶음)로 전달하지 말 것** — 구현된 반응형·인터랙션이 "없는 것"처럼 보이고, 자동생성 GNB가 "메뉴 아닌 화면 목록"으로 오해받는다(intra 기획자 피드백). 실행 링크/배포 프리뷰로 만지게 주고, "러프 골격"인지 "프로토타입"인지 단어를 먼저 맞춘다.

## 레일 첫 실사용 — intra (2026-06-15~16)
레일의 *방법*(REQ-ID 척추·spec-author 수렴·req-implementer 화면단위)을 **외부 독립 프로젝트** `E:\intra`(agora 동일계열 사내 인트라넷 — 차량·회의실·익명게시판 통합)에 처음 적용. `projects/` 안에 만들지 않음 — 레일은 *방법·지식* 제공자, 산출물은 그 프로젝트 repo에 둔다.
> ★**intra의 출생 배경(사용자 정정)**: intra는 "agora 동일계열 신규"가 아니라 **agora 인플레이스 리디자인의 그린필드 재시작**이다. agora가 새 디자인/프로토타입을 받고 "기존 수정"을 택했으나 구현이 자꾸 기존 UI로 회귀해(기존 코드 관성) 받은 디자인과 어긋났고, 그걸 접고 intra를 새로 시작했다. ⇒ 교훈: **전면 리디자인은 인플레이스 수정의 "빠름"이 관성 비용에 잡아먹힌다 — 그린필드가 답일 수 있다**(근거: `archive/agora/knowledge.md` 함정 "기존 코드 관성"). 발견된 갭(→ 진화 후보, `ideas.md`):
- **명령이 `projects/<slug>/` 를 하드코딩** → 외부 타깃 미지원. 레지스트리(`rails/projects.yaml`)+경로해석 규약(`rails/project-paths.md`) 필요(layout=external 이면 docs/+루트 코드+.rail/ 로 매핑, 미등록 slug는 기존 동작=하위호환).
- **`/creative` 는 아이디어 발산 전제**인데 실제 프로젝트는 기획 문서가 먼저 옴 → **수렴(인제스트) 모드** 필요(문서→번호docs+REQ표, 화면 1개=`REQ-SCR`).
- **rough vs full 분리**: 디자이너 반복형 UI는 *오래 갈 것*(실 스택·공유 셸·REQ-SCR 인벤토리) vs *버려질 것*(러프 화면 마크업)을 가른다. 러프엔 풀 rigor(화면별 테스트·6차원 critic·worktree) 생략이 맞음(throwaway 과투자 회피).
- **스택은 단기(러프)가 아니라 최종 목표 기준**으로 정해야 러프가 실제 앱이 됨(intra=사내 배포 → agora 스택 정렬: Next.js+React+TS+Tailwind+Radix, DB/인증은 보류·mock).
- **일하는 방식**: 단계마다 묻지 말고 모듈/단계 단위 자율 진행 + 게이트에서만 검수(레일 게이트 모델과 일치).
산출물: `E:\intra` 33화면 러프(빌드 통과)·`docs/screens.md`(REQ-SCR 인벤토리)·`HANDBACK.md`(기획자 핸드백). 로컬 커밋만(미푸시).

### 기획자 피드백 라운드 (2026-06-16) — 전달방식·용어가 산출물만큼 중요
기획자가 러프 산출물에 "**좌측이 화면 목록이라 프로토타입이 아니다 / 반응형·햄버거가 없는 듯**"이라고 피드백. 코드를 직접 본 진단(`AppShell.tsx`·`Sidebar.tsx`·`menu.ts`·`screens.json`·`HANDBACK.md`): 절반은 맞고 절반은 전달방식이 만든 오해였다. 이번에는 사용자가 "정리만 하고 손대지 말라"고 해 코드 무수정으로 마무리했지만, 교훈은 durable:
- **러프 GNB를 명세에서 자동생성하면 "메뉴"가 아니라 "전 화면 인벤토리"가 노출된다.** intra는 좌측 GNB를 `screens.json`(전 33화면)에서 자동 생성 → 예약상세/수정/반납·각종 추가폼 등 흐름 안에서만 도달할 화면·개발/QA용 화면이 최상위에 다 깔림. 보는 사람에겐 "메뉴 아닌 화면 리스트"가 맞는 지적. **명세 원천(screens.json)은 그대로 두되 "메뉴 노출" 플래그를 분리**해야 진짜 메뉴가 된다.
- **정지 이미지로 전달하면 인터랙션·반응형이 구현돼 있어도 "없는 것"이 된다.** 반응형·햄버거 드로어(768px 미만)는 이미 `AppShell.tsx`에 구현·모바일 샷도 생성돼 있었는데, 전달이 **PNG 48장(shots.zip)** 이라 ⓐ 화면 목록처럼 보이고 ⓑ 창을 줄일 수 없어 햄버거가 안 보였다. → 디자이너 반복형 산출물은 **실행 링크/배포 프리뷰로 "만지게"** 줘야 한다(최소 데스크탑+모바일 샷 병치). 이미지 묶음은 러프를 실제보다 못하게 보이게 함.
- **용어 정합이 기대치를 가른다.** 우리가 "러프 골격"이라 부른 것이 전달 과정에서 "프로토타입"으로 불렸는데, **디자인팀에게 "프로토타입"은 클릭·반응형으로 실제처럼 동작하는 시안**을 뜻한다. 단어가 어긋나면 기대치가 어긋남 → 핸드백 시 산출물 단계명("러프 골격" vs "하이파이 프로토타입")을 명시적으로 합의할 것. → 레일 진화 후보: `HANDBACK.md` 템플릿에 **산출물 단계 라벨 + 권장 전달방식(실행 링크) 필드** 추가, screens 명세에 `menu_visible` 플래그.

## 레일 진화 — 첫 회고 + P1·P2·P3 빌드 (2026-06-16~18)
intra·아카이브에서 드러난 갭을 `/retro`(첫 회고)로 distill해 레일을 **실제 개조**했다. 교훈은 append-only `memory/lessons/rail.md`, 반복 검증 패턴은 `memory/patterns/` 로 승격. 사람 게이트 후 승인분만 반영.
- **첫 `/retro`(2026-06-16)**: `projects/` 정식 생성물이 없어 아카이브 distill을 소스로 삼음. 패턴 2개 승격 — `ingest-convergence`(수렴 모드)·`external-project-layout`(외부 산출 타깃). ★agora CR-001을 "성공"으로 적은 distill 초안을 사용자가 정정 → "**기존 코드 관성**(전면 리디자인은 인플레이스보다 그린필드)" 교훈으로 바로잡음.
- **P1 — 외부 타깃 지원(완료)**: `rails/projects.yaml`(주소록)+`rails/project-paths.md`(경로해석 `$DOCS/$META/$STATE/$CODE`). 5개 명령의 `projects/<slug>/` 하드코딩 → 변수화. external = `<root>/docs/`+`<root>/`(코드)+`<root>/.rail/`(메타·상태). **미등록 slug = 기존 동작(하위호환)**. intra external 등록.
- **P2-b — 러프/풀 모드(완료)**: `/develop <slug> [rough|full]`(기본 full). rough=스캐폴드+화면, 테스트·6차원 critic·worktree 생략, 빌드만 게이트, REQ `done` 미표시 → `/deploy` 거부(배포 대상 아님). 산출=HANDBACK. 스택은 최종 목표 기준.
- **P3 — 핸드백 품질·menu_visible(완료)**: `rails/handoff/HANDBACK.template.md`(전달단계 라벨·권장 전달방식=정적 PNG 금지·화면 인벤토리). `req-implementer` 가 네비 자동생성 시 `menu_visible: true` 화면만 노출.
- **P2-a — 수렴(ingest) 입구(완료, 2026-06-18)**: `/creative` 가 발산(한 줄 아이디어) vs 수렴(문서)을 **자동 판별**. `spec-author` 에 greenfield-ingest(문서→REQ표, 화면=`REQ-SCR`)·change-ingest(변경문서→`CR`+크로스워크+불변식 상속) 절차. ★사용자 조건 = **발산 경로 유지 + 모드 자동 판별**(대체 아님).
- **방법론 메모**: 모든 빌드는 *설명서(프롬프트) 수준* — 진짜 검증은 실제 프로젝트 실행이라야(아직 미실행). 회고→빌드→사람 게이트→커밋 단위로 진행. 비전문가 사용자 대상이라 매 단계 평이하게 설명.

## 미해결 / 다음에 이어가면
- **R4 비용 라우팅 엔진** 미구현(`rails/model-tiers.yaml`+`.env` 읽어 bulk→무료/judgment→Claude). 남은 backlog 1순위.
- **레일 end-to-end 미검증**: P1·P2·P3 입구는 빌드됐으나 실제 프로젝트에 `/creative→/develop→/deploy` 를 돌린 적 없음(프롬프트 정합까지). 첫 대상 = intra 인데 **디자이너 화면 디자인 파일 대기 중이라 보류**(지금 태우면 스펙 재변동+러프 중복). 파일 도착 시 `/creative ingest intra`→게이트→`/develop intra rough`.
- **agora 원본 raw 암호화** 보류(사용자 선택). 미등록 폴더 `...AppData\Local\Temp`(15 jsonl) 감지됨 — 임시폴더라 등록 안 함.
- 타임스탬프 churn 억제, company-internal 색인 주제(topic) 추가 정제 검토.

---
출처: `E:\second-brain\CLAUDE.md`·`HANDOFF.md`·`README.md`, `.claude/skills/chat-archivist/*`, `chats/INDEX.md`. 기획자 피드백 라운드 근거: `chats/raw/6ee83c8c-*.jsonl`(intra `AppShell.tsx`·`Sidebar.tsx`·`menu.ts`·`screens.json`·`HANDBACK.md` 직접 검토).
