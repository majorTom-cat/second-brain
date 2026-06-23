# 작업 가이드 (CLAUDE.md)

> 🟢 **이 프로젝트를 처음 이어받는 세션이라면 [`HANDOFF.md`](HANDOFF.md) 를 먼저 읽으세요.**
> 현재 상태(R0~R3 완료·R4 연기)·확정된 결정·다음 작업·설계 근거 위치가 정리돼 있습니다.

이 저장소(`second-brain`, 루트 `E:\second-brain`)는 **아이디어를 자동으로 프로젝트로 구성하는 레일**이다.
**창작 → 개발 → 배포** 3모듈이 게이트가 있는 산출물 파이프라인으로 동작한다. 이 파일은 이 레일을 운영하는
Claude의 **행동 규칙**이다.

## ⚠️ 외부 프로젝트 작업 시 (예: E:\intra) — 교훈을 *적용*하라 (쌓기만 하면 무의미)

이 세션의 작업 디렉터리는 `second-brain` 이라 **대상 프로젝트의 `CLAUDE.md`·`memory/lessons/<proj>.md` 는 자동 로드되지 않는다.**
그래서 거기 박은 교훈이 이 세션엔 안 떠서 *같은 실수를 반복했다*(시안 충실도·재사용 화면 미감사). **교훈은 이 파일(이 세션이
확실히 읽는 곳)에도 박는다 — 한쪽만 박으면 그쪽이 안 로드될 때 또 반복.** 대상 프로젝트 작업 시작 시 **먼저 그 프로젝트의
`CLAUDE.md` + `memory/lessons/<proj>.md` 를 Read 로 끌어와라**(자동 로드 안 됨 = 내가 명시적으로).

**화면/스펙 작업 충실도 프로토콜 (필수 — '완료' 보고 전 반드시 실행):**

> **★★하드 트리거 (교훈은 쌓는 게 아니라 적용한다):** "완료/깨끗" 보고 *전*, "이렇게 검증하자" 제안 *전* → `/inspect` 실행 또는 지배 교훈을 *호명*하고 따르는지 확인. 로드돼 있어도 *실행 중 참조 안 하면 무용*(같은 세션에도 어겼다). **이미 부정된 방법 재등장 금지**(고화질 스샷으로 아이콘·문구 잡기·"한 방법 0건=완료"·좌표 등분). 정본 [[apply-lessons-not-just-store-them]].

0. **시스템 먼저 스캔 (화면 만들기 *전*)**: 화면을 가로지르는 **공유 디자인 시스템**(색/카테고리 팔레트 = 시안 CSS `:root` 의 `--cat-N-*` 토큰·디자인토큰 · 공유 위젯 · 여러 화면 공통 데이터 모델)을 *정의하는* 화면(관리자/설정)과 CSS를 **먼저** 읽어 전역 결정을 앞단에서 확정. 화면별 발견만 하면 가로지르는 모델을 뒤늦게 발견해 헛수고. (실증: 부서 색 = 채도 정체색+파스텔 막대 '카테고리' 체계인데, 캘린더를 시드 파스텔로 먼저 만든 뒤 부서관리 swatches 때야 충돌 발견 → 캘린더 6뷰 재작업.) "발견 1패스"는 *화면 단위*가 아니라 *시스템 단위*까지.
1. 시안(`design-input/.../orbit/<screen>.html`)을 **줄 단위로** 읽고 1:1 — ①순서·배치 ②문구(토씨 그대로, 없는 문구
   만들지 마라) ③아이콘(시안=Tabler `ti-*` ≠ lucide → `@tabler/icons-react` 또는 모양 직접 대조, close-enough 금지) ④색 ⑤인터랙션 형태(모달/페이지/드로어).
2. **인계·재사용·이미 만든 화면도 추측 말고 감사** — "구조 OK니 충실할 것"·"likely faithful" = 검증 없는 거짓완료.
   전 세션 산출물도 시안과 줄 단위 대조. (실증: 익명 게시판을 추측으로 넘겨 배너 문구·아이콘·순서·게이트 문구가 다 어긋남.)
3. **페이지 + 그 안의 컴포넌트(폼 등) 둘 다 읽어라** — "없는 요소 추가" 전 다른 레벨에 이미 있는지 확인(중복 방지. 실증: 페이지 배너를 폼에 또 추가해 2개).
4. 한 화면 지적받으면 **형제(목록·작성·상세·게이트) 선제 감사** — 사용자를 영구 버그탐지기로 두지 마라.
5. **render 검증**(Playwright 로그인→goto→문구·아이콘·요소 단언) 후에만 "완료". `tsc`/테스트 green ≠ 완료.
   빠른 피드백: tsc→영향 파일만→전체는 배경/체크포인트(배경 테스트 중 src/app 편집 금지 — hot-reload가 깸).
6. **★★러프 ≠ 실시안: 러프 위에 실시안을 *덧입히지(재스킨)* 말고 *재구축*하라.** 러프 프로토타입 → "나중에 진짜 디자인으로" 라고 했는데, 진짜 시안이 오면 **러프 마크업 위에 CSS만 덧입혀**(인플레이스 재스킨) 러프의 *단순화된 구조·로직*이 그대로 남는 게 "계속 다르게 → 전수조사 → 재작업" 루프의 **근본 원인**. (실증: car-trips 가 시안엔 *차량별 세무 운행기록부*인데 *전 차량 평면 목록*으로 남음 — veh-tabs·과세기간·업무사용비율·표 컬럼 누락.) → **실시안 도착 시 각 화면을 시안 소스에서 처음부터 마크업+로직 재구축**, 러프는 폐기 대상으로 격리.
7. **★★인터랙션·로딩 *체감* UX도 충실도의 일부(빠뜨린 것도 실수).** 정적 시안은 즉시 반응(`:checked`/JS)하는데 서버컴포넌트·서버액션으로 옮기면 즉시성을 잃기 쉽다 → 사용자가 "뻣뻣/버벅"으로 겪음. ① 라우트 그룹마다 **`loading.tsx` 스켈레톤**(없으면 모든 네비가 빈 화면 블록). ② 서버액션 토글/제출은 **`useOptimistic`/`useFormStatus`** 로 즉시 반영(transition CSS 있으면 상태만 즉시 바꿔도 부드럽다). (dev 콜드 컴파일 느림은 본질적 — prod 가 진짜 속도, loading 은 체감 개선.) 정본 [[interaction-loading-ux-completeness]].
8. **★★done 게이트 = 구조 *전수* diff(기억·반응적 대조 말고 *도구*).** "시안 봤다"는 대화에 나온 부분만 고치는 부분 대조라 갭이 남아 사용자가 매번 잡아야 했다. → **시안 HTML ↔ 실제 렌더를 같은 방식으로 토큰화(표 컬럼·버튼/탭·셀렉트옵션·필드라벨·섹션클래스)해 '시안엔 있는데 구현에 없는 것'을 기계로 뽑는 감사 도구**(intra: `scripts/fidelity-audit.mjs <screen|all>`)를 **화면 done 전 반드시 실행, 누락 0 까지**. 디자이너 샘플값(숫자/이름=td)은 토큰서 자동 제외 — 구조만 본다. **시안 있는 프로젝트면 이 도구는 일회성 아닌 누적 자산**(매 화면·매 변경 재사용 — 프로젝트마다 비슷하면 패턴으로 승격).

9. **★★★capstone — 위 방법들을 *하나씩 재발견* 말고 *검사 묶음으로 한 번에 앞단에서*.** (**검사 묶음 = 서로 다른 결함층을 잡는 독립 검사 여러 종을 한 데 모아 같이 돌리는 것** — 영어 "battery of tests". 한 종만으론 못 잡으니 묶어서.) (실증 2026-06-23: 스샷대조→HTML소스diff→인터랙션시뮬→가로폭전수, *방법 하나당 사용자 버그 한 라운드씩* 깨달으며 11건이 질질 나왔다. 느린 건 방법 실행이 아니라 *어떤 방법이 필요한지의 발견*이었다.) 단일 마법 검사는 없다([[verification-is-layered-zero-isnt-clean]]) — 정답은 그 **검사 묶음**을 *프로젝트 시작부터·화면 1번부터·매 변경마다* 전수로 돌리는 것. UI 충실도 묶음 = ①**소스 diff**(시안 HTML/CSS ↔ impl 토큰화 — 구조 + **아이콘이름(ti-*)·문구토씨·색토큰**) ②반응형 불변식(브레이크포인트 동작) ③**가로넘침 전수**(body.scrollWidth>vw + 클립조상 거른 per-element — overflow 는 ①②를 다 빠져나감) ④인터랙션 시뮬(드래그·토글·모바일solo 좌표→자원) ⑤실패계열 grep(하나 찾으면 같은 CSS/패턴 형제 전수). **병렬로 한 번에 돌려 갭 카탈로그 → 배치수정**([[harvest-gaps-with-parallel-audit]]).
   **★순서·속도(검사 자체가 느리면 안 돌린다):** 싼 *정적* 검사 먼저(브라우저 없이 소스 diff=초), 그다음 *한 세션* 으로 전 라우트 순회하며 페이지당 `page.evaluate` 한 번에 ②③단언(브라우저 재기동·재로그인 반복 금지), 뷰포트는 병렬. **스샷은 *검출 방법*이 아니라 *실패 증거* — 전 화면 fullPage 찍지 말 것(그게 '하루 종일'의 주범), 단언 깨진 화면만 고화질.** 아이콘·문구는 *고화질 스샷이 아니라 소스 diff* 로(화질 올려도 그 사각은 그대로 — [[compare-design-source-not-screenshots]]).
   **발견비용은 한 번만** — 검사 묶음을 harness(돌아가는 스크립트: intra `responsive-audit.mjs`+`fidelity-audit.mjs`)로 물려주고, *새로 만난 실패모드는 즉시 묶음에 영구 추가*(harness 가 복리로 자라 반응적 라운드→0). 절차 스킬 = `/inspect`(`.claude/skills/inspect` — 레일 일반판 + 프로젝트 실행 인스턴스). 보고는 "완료/0건" 대신 **"검사 N종 소진, 안 돌린 방법은 여기"** 로. 도메인이 다르면 묶음 항목도 다르다(API=스키마+계약테스트+퍼즈+부하+보안스캔) — *"검사 묶음을 앞단에 물려 한 번에 돌린다"* 원칙은 동일.

> 정본 교훈: `memory/lessons/intra.md` · auto-memory `done-means-observed-working`·`audit-inherited-work-dont-assume`·`icon-fidelity-tabler-not-lucide`·`fast-feedback-not-timeouts`·`fix-the-failure-class-not-the-instance`·`rebuild-from-real-design-not-reskin`·`fidelity-audit-by-structural-diff`·`verification-is-layered-zero-isnt-clean`·`run-checks-upfront-not-one-by-one`.

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
