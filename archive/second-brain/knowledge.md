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
- **★크로스-cwd 수집**: 외부 프로젝트를 second-brain cwd 에서 작업하는 방식(CLAUDE.md 규약) 때문에 실제 트랜스크립트는 대상 프로젝트 세션 폴더(`E--intra`)가 아니라 **second-brain 폴더**에 쌓인다 — `/archive intra` 만 돌리면 세션 1개짜리 빈 껍데기. 크로스워킹이 흔한 프로젝트는 관련 second-brain 세션도 같이 수집해야 "대화 저장" 목적이 채워짐. (대상 폴더 세션 수가 비정상적으로 적으면 second-brain 세션을 후보로 제안 = backlog.)
- **★크로스레포 재개 = 정본 상태파일 + 양쪽 등록 커맨드**: 세션 cwd 는 second-brain 인데 작업은 외부 repo 에서 벌어지면 그 repo 문서는 자동로드 안 되고 슬래시 커맨드도 *cwd 기준으로만* 뜬다. → `docs/TODO.md`(대상 repo, 사람이 보는 잔여작업 정본) + 재개 커맨드(`/goal` 류)를 **양쪽 repo 에 같은 이름으로 등록**(각자 절대경로로 정본 파일을 가리킴). 커맨드엔 상태를 하드코딩 말고 파일만 가리켜, TODO.md 갱신만으로 재사용. 한쪽에만 두면 그 repo 밖 세션에선 커맨드 자체가 안 뜬다.
- **크래시 복구는 기억이 아니라 git 증거로**: "어디까지 했어?"·"이제 꺼도 되나?"엔 추측 금지 — HEAD vs origin/main, 미커밋/untracked, 마지막 1~2 커밋 diff ↔ 원본 소스(QA 문서 등) 대조로 답한다. **HANDOFF 본문이 실제 커밋보다 뒤처질 수 있으니**(번호 블록이 ⑱까지인데 그 뒤 커밋 3개 더 있던 사례) HANDOFF 최신 항목만 보지 말고 그 이후 `git log` 도 반드시 대조. 대량 배치의 영속 기록은 세션 TaskCreate/Update(휘발) 가 아니라 **HANDOFF 번호 블록(항목별 ✅/⬜) + 청크당 커밋**.
- **다중에이전트 적대적 sweep 경제학**: 실제 토큰이 사전추정의 3~9배(렌즈 수 × 후보별 검증 라운드 = 곱연산). 돌리기 전 그 곱으로 재추정. 결과(장문 JSON)는 **큐레이션·압축 없이 그대로 체크리스트에 붙이면 레일이 스캔 불가능한 벽으로 비대**해진다 — "적용 vs 제안 분리 + 서술 압축"이 그 자체로 필수 단계. 병렬 워크플로는 포그라운드 Esc 로 안 멈춘다 → 명시적으로 워크플로 중단 지시 + `/workflows` 확인.
- **QA 문서 워크플로 (2층 모델)**: A층(기계 — 요소존재·문구·아이콘·반응형·기능·죽은컨트롤)과 B층(사람 — 업무흐름·UX 느낌·실데이터 엣지)을 나누고, B층에서 반복·기계적으로 판명된 케이스를 A층으로 승격시켜 사람 몫을 복리로 줄인다. **단 테스터 시트엔 "자동화됨?" 같은 내부 개념 노출 금지**(테스터는 화면/부분/Pass·Fail/한줄메모만). 포맷은 용도 종속 — 다중 PC·실시간 공유는 구글시트, TestRail/Jira+Xray 는 QA 가 본업화한 뒤. **QA 문서의 "진단"도 검증 대상이지 정답이 아니다**(코드만 읽고 믿으면 멀쩡한 코드 깨짐 — 진단이 거꾸로였던 항목이 dev 렌더로만 잡힘). 시트 완료 후 **로컬로 직접 눌러보는 것도 별도 검사층**(152건 처리 뒤 시트에 없던 버그를 로컬 클릭으로 발견).

## 함정 / 다시는 안 할 것
- **PowerShell 5.1 은 BOM 없는 UTF-8 `.ps1` 의 한글을 시스템 코드페이지로 오독** → 로그 mojibake. PS 스크립트 출력문은 **ASCII 전용**으로(한글은 node 출력/.md 에만).
- **채팅엔 진짜 API 키가 섞여 있다**(agora·llm-wiki 둘 다 발견). 평문 푸시 전 반드시 마스킹/암호화 — git 히스토리에 박히면 되돌리기 어려움.
- **회사 기밀의 개인 클라우드 이동**은 "private라 나만 봄"이어도 정책 위반 소지 — company-internal 은 raw 미푸시 기본.
- README "마지막 인제스트"·SECRETS "스캔 일시" 타임스탬프가 매 실행 갱신돼 무변경에도 diff 발생(소소한 churn, 미해결).
- **러프 산출물을 정지 이미지(PNG 묶음)로 전달하지 말 것** — 구현된 반응형·인터랙션이 "없는 것"처럼 보이고, 자동생성 GNB가 "메뉴 아닌 화면 목록"으로 오해받는다(intra 기획자 피드백). 실행 링크/배포 프리뷰로 만지게 주고, "러프 골격"인지 "프로토타입"인지 단어를 먼저 맞춘다.
- **★`/archive` 자동 비밀·사내마커 격리는 *채팅 인제스트 경로*만 커버 — 세션이 직접 쓴 `memory/lessons/*`·patterns·docs 파일은 안 본다.** 실제로 배포 교훈 문서에 사내 호스트명이 섞여 들어갔고 second-brain(외부 GitHub) 푸시 *직전 수동 grep* 으로 겨우 걸렀다. 이 아카이브 자신도 company-internal 이므로, 큐레이트 파일에 사내 식별자를 넣지 않는 건 *사람이 지켜야 하는* 불변식(엔진이 안 지켜줌). → pre-push 마커 스캔을 기계 게이트화가 backlog.
- **"Bash 도구가 막혔다" ≠ permission 문제.** Claude Code 업데이트가 settings.json allow/deny 와 *별개 계층*인 auto-mode 안전 분류기를 강화 → `Bash(node *)` allow 규칙이 있는데도 "운영 사이트에서 대량 메일 발송" 같은 되돌릴 수 없는 동작이 소프트 블록됨. **고치는 법은 설정 편집이 아니라 요청을 극도로 구체화**(누가/어디서/무엇을/어떻게)하는 것 — 분류기는 "의도가 명확한가"로 판단하는 듯. 이미 allow 매칭되는데 막히면 settings 만지기 전에 분류기 계층부터 의심.
- **로컬 preflight 통과 ≠ CI 빌드 이미지 동일.** 네이티브 prebuilt 바이너리(sharp 등)가 LIVE 에서만 실패한 근본원인 = 가상화 CPU 가 x86-64-v2 마이크로아키텍처를 마스킹해 바이너리를 거부(로컬 PC 는 v2 라 늘 통과, 6라운드 헛짚음). 교훈: preflight 는 헬스체크만 말고 **네이티브/옵셔널 의존성을 실제로 태우는 경로(이미지 업로드 등)까지 행사**하고, "로컬은 되는데 런타임만 실패"면 로컬 재현 반복 대신 **파드 exec 로 실제 증거부터**. 안정 해법 = 빌드 산출물(`.node`)을 리포에 vendoring 해 로컬 검증=CI 를 구조로 보장.
- **프로덕션 런타임(standalone/minimal) 이미지엔 node/npm 이 없어 devDep 필요한 백필 스크립트가 못 돈다** → devDeps 설치된 머신(로컬 PC, SSH 터널)에서 돌리고, DB URL·암호화 키는 **손입력 말고 k8s secret 에서 그대로 추출**(특수문자 URL 파싱 실패·앱과 다른 키 → 복호화 불가/데이터 손실 방지).
- **Excel 한글 깨짐은 UTF-8 BOM 으로 풀되, 이미 BOM 붙은 CSV 에 또 BOM 씌우면 이중 BOM 버그**(원본 BOM 제거 확인). Claude Design(claude.ai/design) 프로토타입의 pass/fail 클릭은 계정/DB 에 저장 안 됨 — 그 세션 화면에만 떠 있다 사라짐 → 남기려면 즉시 CSV 다운로드가 유일.
- **`DROP SCHEMA` 기반 DB 리셋은 떠 있는 dev 서버의 커넥션을 stale 하게 만들어 "로그인 풀림" 같은 오진단을 유발** → `TRUNCATE` 기반으로 바꾸면 서버 재시작 없이 안전. "리셋 후 갑자기 안 됨"은 코드 아니라 커넥션·캐시부터.

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
- **R4a — 비용 라우팅(완료, 2026-06-18)**: `[tier: bulk]`→더 싼 Claude 서브에이전트 위임(기본 **Sonnet**, 다이얼 haiku/sonnet/opus)·`[tier: judgment]`→Opus. `rails/routing.md`+`model-tiers.yaml`+`CLAUDE.md` 배선. 핵심 = 레일이 Claude Code 안에서 도니 "라우팅"=서브에이전트 모델 위임(외부 스크립트=R4b 옵션). `/retro`→`/archive all` 자동선행, 엔진 churn 수정(P-B)도 이 라운드.
- **레일 1바퀴 실검증(todo-toy, 2026-06-18)**: `creative→develop→deploy` **첫 완주**(throwaway 토이). 실버그 1건(**Windows ESM main-guard** — 테스트 20/20 green인데 `node index.js` 실행 깨짐)·OPS 보강 2건(HOST·SIGTERM) 회수 → `/develop` **진입점 기동 smoke 강제**·`/creative` **OPS REQ 선반영**(`memory/lessons/todo-toy.md`). R4a 실집행 검증(Haiku 구현·Sonnet 배포물, critic 안전망).
- **방법론 메모**: 모든 빌드는 *설명서(프롬프트) 수준* — 진짜 검증은 실제 프로젝트 실행이라야(아직 미실행). 회고→빌드→사람 게이트→커밋 단위로 진행. 비전문가 사용자 대상이라 매 단계 평이하게 설명.

## 크로스프로젝트 실사용 era — intra (2026-06-19~07-06): 레일이 배운 메타
레일의 *산출물 파이프라인*은 이 기간 실제로 안 돌았다(intra 는 external·리스킨 작업 위주). 대신 second-brain 세션에서 외부 프로젝트를 장기간 몰며 **레일·아카이브·오케스트레이션 운영의 메타 교훈**이 쌓였다. 앱 도메인 교훈은 `memory/lessons/intra.md`·auto-memory 로 갔고, 여기엔 레일 수준만 남긴다.

- **거짓완료(false-done)는 UI 만의 문제가 아니라 *모든 게이트*의 구조적 함정** — "좁은 green 신호(테스트/health/acceptance-존재)가 넓은 done 을 대신한다"는 패턴이 창작(acceptance 존재≠완전)·개발(green≠동작)·배포(health 200≠실사용)에 동형 재발. 한 표면(UI)만 고치면 나머지 표면은 그대로 → 게이트 설계는 *표면별이 아니라 계층별*로. (레일에 false-done 체크리스트 A~H·critic 8차원으로 반영.)
- **디자인 패키지 도착 시 gate-0(대조 문서)를 코딩 전에 끼워라** — 기존 REQ/SSOT 있는 프로젝트에 새 시안이 오면 `/creative` ingest *전에* "구→신 화면 델타 + 업무규칙 델타 + 모순점"을 별도 문서로 뽑아 사람 결정을 받는다. 화면 개수만 비교하면 "색만 바뀐 줄" 알았다가 뒤늦게 업무규칙 추가를 발견.
- **리스킨/재구축 갈림길 전에 *가장 어려운 화면*부터 스파이크** — 쉬운 화면(로그인·홈) 통과로 안심 말고 구조 제일 복잡한 화면(캘린더 타임라인 등)까지 통과해야 "재사용 vs 재구축" 전체 병렬 빌드로 안전하게 넘어감. (spec-author/inspect 원칙 후보.)
- **결정 트리아지**: 열린 결정이 여러 개면 동급 질문으로 다 던지지 말고 "지금 필수 1개 vs 기본값 두고 나중에 N개"로 분리 — 비전문가 사용자의 의사결정 피로 감소.
- **`/kickoff` 는 매 세션 필수가 아니라 "실제 코드 수정 착수" 시점에** — 기준은 세션 시작 여부가 아니라 *다음 액션의 리스크/판단 비중*. 읽기·분류만 하는 라운드엔 불필요, 검증게이트+운영 배포 결정 직전엔 권장.
- **auto-memory(세션별 개인)와 레일 정본 교훈(`memory/lessons/<slug>.md`)은 별개 저장소라 하나만 갱신하면 갈라진다** — 배포 교훈을 auto-memory 에만 박고 정본을 빠뜨려 `/retro`·다음 세션이 놓친 실사례. 교훈 pin 시 *두 곳 즉시* 갱신, `/retro` 까지 미루지 말 것.
- **거버넌스는 열린 결정으로 기록** — 승인채널 하드분리(권한 차단)는 "얼마나 엄격히"가 아니라 "누가 게이트를 보고 있나"에 종속: 1인·상시감독은 탐지+규약(자가승인 흔적 시 정지)으로 충분, 하드 벽은 무인/다인 전환 시에만 값어치. **벽을 안 세운 이유와 재검토 트리거를 명시적으로 적어둬야** 다음 세션이 "meta 한계!"로 또 벽을 제안하지 않는다. 프로덕션 auto-deploy(main push=LIVE) 게이트는 자연어 승인("진행해")을 신뢰하지 않고 명시 토큰(`! git push` 류)만 통과 — 로컬 커밋/머지는 자유, 배포 트리거만 별도 승인.
- **memory 시스템도 "감사·추측 금지" 대상** — 색인↔파일 양방향·깨진 링크·고아 링크·repo 참조·커버리지 diff 5축 교차검증으로 실제 결함과 오탐을 구분. "이 파일에 색인 추가" 전에 *그 파일이 정본인지*(로그 vs 진짜 패턴 라이브러리) 확인 — 아니면 엉뚱한 파일 고치는 헛수고.
- **작은 규율들**: git merge/checkout/pull *직후* 파일 편집 전엔 재-Read(fast-forward 가 디스크를 갱신해 stale Read 로 Edit 어긋남) · 의심할 때도 양방향 검증(인계를 의심하는 것 자체가 새 미검증 가정 — "파일 없다"는 첫 glob 을 재확인하니 실재) · 배치 전 감사로 균일성 가정 깨기(형제 화면이 다 같은 결함이라 가정한 일괄 재작업이 감사서 취소 — 일부는 이미 충실) · 테스트 "통과 N건"도 *실제 채택 명령*으로 몇 개 도는지 확인(지정 파일론 통과, `npm test` 론 0개 실행) · CI 빨간불 = 실패 *스테이지*부터(‌`npm install ETIMEDOUT`=인프라, 테스트 실행조차 안 됨 → job 재시도).

## 미해결 / 다음에 이어가면
- **R4 비용 라우팅 엔진** 미구현(`rails/model-tiers.yaml`+`.env` 읽어 bulk→무료/judgment→Claude). 남은 backlog 1순위.
- **레일 end-to-end 미검증**: P1·P2·P3 입구는 빌드됐으나 실제 프로젝트에 `/creative→/develop→/deploy` 를 돌린 적 없음(프롬프트 정합까지). 첫 대상 = intra 인데 **디자이너 화면 디자인 파일 대기 중이라 보류**(지금 태우면 스펙 재변동+러프 중복). 파일 도착 시 `/creative ingest intra`→게이트→`/develop intra rough`.
- **agora 원본 raw 암호화** 보류(사용자 선택). 미등록 폴더 `...AppData\Local\Temp`(15 jsonl) 감지됨 — 임시폴더라 등록 안 함.
- 타임스탬프 churn 억제, company-internal 색인 주제(topic) 추가 정제 검토.
- **`/status` 사각**: 파이프라인 산출물(`projects/<slug>/.state`)만 보고 "사람이 실제로 일하는 외부 repo"는 추적 안 함 → 루트 HANDOFF 가 멈춘 듯 보이는 착시(실제 작업은 전부 intra 에서). external-work 레지스트리 도입 후보(ideas).
- **동적 텍스트 충실도 사각**: 정적 소스-diff(fidelity-audit)는 렌더된 DOM 만 봐, 토스트 문구처럼 시안 `<script>` 의 `showToast()` 인자로만 존재하는 텍스트를 원천적으로 못 본다. feedback-audit 은 "토스트가 뜨는가(존재)"는 잡았지만 "문구가 시안과 같은가(내용)"는 안 봐 몇 주간 임의 문구를 못 잡음(사용자 발견). 데이터-의존 조건부 렌더(고정글 0건이면 핀 아이콘 부재)도 기본 시드에서 false negative → "떴다"와 "문구 일치"·"조건부 렌더"를 별개 검사축으로.

---
출처: `E:\second-brain\CLAUDE.md`·`HANDOFF.md`·`README.md`, `.claude/skills/chat-archivist/*`, `chats/INDEX.md`. 기획자 피드백 라운드 근거: `chats/raw/6ee83c8c-*.jsonl`(intra `AppShell.tsx`·`Sidebar.tsx`·`menu.ts`·`screens.json`·`HANDBACK.md` 직접 검토).
