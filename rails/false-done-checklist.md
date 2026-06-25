# false-done 체크리스트 — "green 인데 안 됨" 재발 함정 (성장하는 목록)

> 목적: `done`/`verification: pass`/`gate: approved` 가 **좁은 신호**(테스트 green·자가보고·health 200·게이트 승인)로 보고되는데
> 실제론 깨진 경우 = **거짓완료(false-done)** 를 **사람이 겪기 전에** 잡는다. [[verify-by-observation]] 의 운영 도구.
> ★**append-only·성장 목록**: `/retro` 가 새로 발견된 false-done 모드를 여기에 추가한다 — 다음 세션이 같은 걸 재발견(=사람이 또 겪음)하지 않게.
> 출처 표기: 🔬=실 incident/교훈 · 🧪=10렌즈 적대 sweep(2026-06-20, 47에이전트) 검증.

## 사용 규칙 (critic = adversarial-review 가 적용)

- 산출물 유형에 **해당되는 항목만** 점검한다(순수 로직/데이터 REQ엔 UI·반응형 항목 N/A) — *모든 항목을 매 REQ에 강제하지 않는다*(과한 게이트 방지).
- 각 항목은 **관찰로 통과**(실제 띄워/실행해 봄) 하거나 **명시적 N/A + 이유** 여야 한다. **조용한 건너뜀 = blocker**(= 검증 안 했는데 done).
- "테스트 green" 은 통과의 *입력 중 하나*일 뿐, **그 항목이 보는 차원**에서만 참이다. 안 보는 차원은 관찰로 메운다.

---

## A. UI/화면 (`REQ-SCR-*`)
- [ ] **시안 충실도** — 렌더가 `design-input` 과 레이아웃·컴포넌트 일치(뭉뚱그림·근사 ❌). 관찰: 화면 띄워 시안과 나란히. *(critic dim 7)* 🔬
- [ ] **인터랙션 배선** — 모든 버튼·링크·폼이 실제 동작(죽은 링크 0). 관찰: 전부 클릭. *(critic dim 7)* 🔬
- [ ] **요소 순서·배치 충실도** — 시안의 요소 *배치 순서*(위→아래 DOM 순서)를 그대로 옮겼나. 같은 컴포넌트가 다 *있어도* **위치가 뒤바뀌면**(예: 주차위치를 안내박스 *위*에 둬야 하는데 *아래*로) 거짓완료 — "존재"만으로 부족, "배치"까지 1:1. 관찰: 시안과 위→아래 순서를 한 줄씩 대조. 🔬(intra 2026-06-20: 반납화면 주차/안내박스 순서 어긋남)
- [ ] **아이콘 충실도** — 시안의 *그 아이콘 모양*을 쓰나. ⚠️**반복 함정**: 시안과 구현이 *다른 아이콘셋*(예: 시안 Tabler `ti-*` ↔ 구현 lucide)이면 **이름만 비슷한 다른 모양**을 집기 쉽다 — 'close enough'(lucide `Network`↔Tabler `sitemap`, `MessageSquare`↔`message-2`) **금지**. → 시안 아이콘셋을 쓰거나(`@tabler/icons-react` 추가) 시안 렌더와 *모양을 직접 대조*해 고르고 확인. 🔬(intra 2026-06-20: 헤더 키커 아이콘 반복 누락 — lucide≠Tabler)
- [ ] **인터랙션 패턴 충실도** — 시안이 지정한 인터랙션 *형태*(팝업/모달·드로어·인라인 편집·토스트·아코디언·탭·확장)를 그대로 구현했나. 버튼이 *동작은 하지만 형태가 다르면*(예: **모달/팝업을 별도 페이지로** 구현) "버튼 다 클릭·테스트함"이 거짓완료 — 클릭은 되니 배선 green·테스트 green 인데 명세와 다른 UX. 관찰: 클릭 후 "무엇이 *어떻게* 뜨나"를 시안의 인터랙션 *종류*와 1:1 대조(모달이어야 할 게 페이지 전환인지, 인라인이어야 할 게 모달인지). 🔬(intra 2026-06-20)
- [ ] **데이터 상태** — 빈/로딩/에러/대량(0행·다수 행) 상태가 안 깨짐. 시드데이터로만 보면 0행·10k행에서 깨짐. 관찰: 각 상태 재현. 🔬
- [ ] **반응형/뷰포트** — 모바일·좁은 폭에서 안 깨짐("내 화면에선 됨" ≠ 됨). 정적 PNG 전달은 반응형을 가려 오해(rail.md #5). 관찰: 폭 줄여 확인. 🔬
- [ ] **실데이터 경로 vs mock** — 화면이 mock 이 아니라 실제 API/DB 에 배선됨. mock 으로만 "됨"=미배선('뭉뚱그려 개발'의 일종). 관찰: 실데이터 왕복. 🔬
- [ ] **낙관적 UI vs 서버 진실(실패경로)** — `useOptimistic`/로컬 state 가 서버 응답 전·무관하게 '저장됨'을 표시하면 서버 거절을 삼켜 거짓완료(toast=성공인데 DB엔 0). 관찰: 서버를 의도적 실패(DB off·400)시킨 뒤 액션 → UI가 실패를 *명시적으로* 표시하나 + **DB 직접 조회로 데이터 실재 교차검증**(테스트는 action mock 이라 항상 green). *(dim 7 을 '서버 결과 반영'까지 확장)* 🧪
- [ ] **폼 검증 이중성(클라이언트≠서버)** — (1)클라이언트 통과인데 서버가 거부하는 경계값 제출 시 actionable 에러 표시되나(서버거부 UX 미정의=거짓완료) (2)클라이언트가 막은 입력을 devtools 로 submit replay(우회) 시 서버가 재검증/거부하나(앱검증 의존이면 우회로 통과 — C '구조적 강제'의 폼판). 🧪
- [ ] **타임존/로케일 렌더(i18n)** — 날짜·시간·예약/만료시각·통화/숫자 포맷이 서버·파드 TZ(보통 UTC) 기준 의도대로. dev=KST 한 환경만 보면 배포 후 -9h 어긋남(자정경계 전날 표시)이 안 보임. 관찰: `TZ=UTC` 강제(또는 서버TZ≠브라우저TZ) 후 자정 전후 경계값. (날짜/시간 없으면 N/A) 🧪
- [ ] **SSR/hydration 불일치**(Next.js App Router 등 SSR `REQ-SCR-*`만; CSR·순수로직 N/A) — 서버렌더 HTML↔클라 hydration 차이(window 의존·로그인 분기·동적 날짜)로 첫 로드 1-2초 잘못된 레이아웃 flash. jsdom 테스트는 hydration 없이 DOM 직접 조작해 못 잡음. 관찰: Network throttle(Slow)로 gap 벌려 flash + 콘솔 hydration 경고 0. 🧪
- [ ] (낮음) **접근성/키보드** — 폼 있는 `REQ-SCR`은 조용한 N/A 금지(N/A 시 이유). 관찰: 마우스 없이 (1)Tab 으로 모든 입력·제출 도달 (2)Enter/Space 활성 (3)포커스 outline 가시. 마우스 클릭 배선 통과 ≠ 키보드 도달(dim 7 은 마우스 관찰). 🧪
- [ ] **라벨드 컨트롤이 라벨대로 동작** — 버튼/메뉴가 *존재·클릭됨*인데 **라벨이 약속한 일과 다른 일**을 함 → "배선 green" 거짓완료. (intra 2026-06-21: "이미지 삽입" 버튼이 본문 인라인 삽입이 아니라 *파일 첨부 input* 만 열었음 — 본문 평문 저장이라 이미지가 사라짐.) 관찰: 라벨이 약속한 *결과*를 end-to-end 로 — "이미지 삽입"이면 저장·재열람 후 본문 *중간*에 그 이미지가 영속·렌더되는지(첨부 목록 아님). 🔬🧪
- [ ] **새 오버레이/레이어가 기존 클릭을 *조용히* 막음** — 드래그/클릭용 투명 레이어(z-index 오버레이)·전면 패널을 깐 뒤, 그 아래 기존 *클릭 가능 요소*(링크·막대·버튼)가 더 이상 안 눌림. 새 기능 테스트는 green 이고 기존 클릭은 *수동으로만* 깨진 게 보임 → 회귀 거짓완료. ★**CSS z-index 규칙이 dev HMR 에서 안 먹어** 안 올라가는 함정도(=inline/JS 로 박아야). 관찰: 새 레이어 도입 후 (1)`document.elementFromPoint(x,y)` 로 기존 요소 위 최상위가 무엇인지 (2)기존 요소 클릭→기대 동작(상세 이동 등) 회귀 1회. (intra 2026-06-21: DayDragLayer·MonthCell) 🧪
- [ ] **폼이 열리지만 기본 상태가 제출 불가** — 폼/모달이 *렌더는 되는데* 기본 선택/기본값이 충돌·busy 라 열자마자 제출 버튼 비활성 → 사용자는 "이 기능 안 됨"으로 인식. 데이터 감사선 "정합"이어도(시드 유효) **폼 기본값 vs 데모 데이터 충돌**이 멀쩡한 기능을 깨져 보이게 함. (intra 2026-06-21: 회의실 예약 폼이 첫 방을 기본선택하는데 시드가 그 방을 기본시간 14:00 에 예약 → 예약 버튼 막힘.) 관찰: 폼/모달을 *기본값 그대로* 열어 즉시 제출 가능한 상태인지(기본 선택이 가용·비충돌인지); 기본 선택은 busy/충돌 자원을 피해 고르게. 🔬🧪
- [ ] **진입점 기동** — 실제 진입점이 기동·listen·시그널 처리(테스트는 함수 직접호출이라 못 봄; Windows ESM main-guard, todo-toy). 관찰: `node <entry>`+curl / 실인자 실행. 🔬
- [ ] **표준 명령으로 테스트가 실제 실행** — `npm test` 가 0개 실행하지 않음(intra: 글로브 안 맞아 0개인데 "pass"). 관찰: 실행 카운트 확인. 🔬
- [ ] **데이터/입력 경계(service·API·CLI — `REQ-DAT-*`/비-`REQ-SCR`)** — happy-path('N개→200+data')만 적혀 경계 미실행 → 운영 500. 각각 then 절로: (1)빈 결과셋→200+[] (2)없는 ID→404(500 아님) (3)null 필드 직렬화 형태 (4)잘못된 입력(NaN·특수문자·음수)→400(`Number(쿼리)`는 isInteger 가드 — intra: NaN→eq(id,NaN)→500) (5)offset>count·page=999→200+[]. UI(REQ-SCR)로만 보고 API 엔 조용히 N/A 금지(critic 침묵=blocker). 관찰: `curl 'page=999'`·`id=abc` 응답코드(5xx=fail). 🔬🧪
- [ ] **오류경로 → 친절오류(500 아님)** — 불변식이 DB제약으로 막힐 때(동시쓰기·unique·exclusion) 사용자가 500 아닌 409/422+친절메시지를 받나. 함정: 드라이버가 예외를 `e.cause`에 감싸 `catch(e){e.code}` 가 못 잡고 500 누출(Postgres 23P01·23505). 관찰: 실제 제약위반 오류경로 테스트로 상태코드·메시지 확인 + catch 가 `e.code ?? e.cause?.code` 쓰는지. (intra §3) 🔬
- [ ] **assertion 깊이 = acceptance then 검증** — REQ 테스트가 green·존재단언(`toBeDefined`/`count>0`/`isVisible`)만으로 통과 금지 — **then 의 핵심값(반환값·상태코드·필드(JWT sub=userId)·이동 URL·표시 텍스트)이 assertion 에 구체적으로 등장**해야(dim2 'REQ↔test 연결'은 통과해도 본문이 then 을 안 보면 거짓완료). E2E 는 리다이렉트/로딩 *후* 단언(`waitForURL`; `waitForLoadState`는 전 상태 캡처). 관찰: critic 이 테스트 본문을 SPEC then 절과 나란히 대조(조용한 존재단언=blocker). 🧪🔬
- [ ] **HTTP acceptance 의 테스트 수단** — acceptance 가 'METHOD /api/x → 코드'면 **HTTP 클라이언트(supertest/fetch)로 실제 경로** 호출. `handler(mockReq,mockRes)` 직접 호출은 라우트 등록·미들웨어(인증·body-parser·CORS) 우회해 함수 로직만 green. 관찰: supertest 로 등록 경로를 치고, 무인증 요청이 그 경로에서 막히는지 1회. 🧪

## C. 권한/불변식
- [ ] **차단 경로** — "허용되는 사람"뿐 아니라 **"차단돼야 하는 사람"** 도 테스트(intra: admin 차단·exec 허용 둘 다). 보고만 믿으면 누수. 🔬
- [ ] **불변식의 모든 마스터** — 한 케이스가 아니라 같은 불변식이 걸리는 *모든* 대상(intra: employee FK 만 보고 차량 누락=거짓안심). 다형참조는 FK 없음→트리거. 🔬
- [ ] **구조적 강제** — 핵심 불변식이 앱 로직이 아니라 DB 제약/단일 라이터로 강제([[constraints-as-truth]]). 앱 로직 의존이면 UI 우회로 뚫림. 🔬
- [ ] **동시쓰기 경쟁(선점성 REQ)** — 공유자원 뮤테이션(예약·잔액차감·재고/큐 선점)은 순차 acceptance('첫 성공→둘째 409')만으론 green 이 거짓 — SELECT-후-INSERT 앱가드를 동시 2요청이 동시 통과해 둘 다 INSERT(이중예약/500). 관찰: 동시 N개(2~5) 요청 동시 발사(`curl & curl &`) + 성공 row 수=1(정원) 단언; `DEPLOY.manifest.concurrency_probe` None 이면 ops_gaps 명시; dim 1 에서 선점성 REQ 가 app-logic 의존이면 warn→**blocker**. ([[constraints-as-truth]] 레이스) 🧪
- [ ] **픽스처 진정성** — 테스트 전제(역할=admin·status=X)를 **앱 생성경로가 아니라 DB 직접 INSERT**로 세팅하면 (1)앱이 못 만드는 상태를 검증해 거짓안심 또는 (2)역할부여·상태전이 경로가 미검증. 직접-write 픽스처는 '허용'만 단언해도 green → admin 익명누수 안 보임(intra ④). 관찰: 그 상태가 **앱 계층(가입/승급/전이 액션)으로도** 만들어지는지 별도 테스트 + '차단' 픽스처도 같은 경로로. 🧪🔬

## D. 통합/배포
- [ ] **REQ 간 통합** — REQ 격리(worktree) 통과가 통합 앱 동작을 보장 안 함. 관찰: 통합 후 핵심 플로우 1회. 🔬
- [ ] **통합 후 cross-REQ 계약 왕복 + critic 재실행** — per-REQ critic(§4)·`build`/`test` green·단일 `/health` 200 은 **타입 밖 공유계약**(REST body·DB쿼리/스키마·env 변수명)의 REQ 간 불일치를 못 잡음(provider REQ-A·consumer REQ-B 가 각자 mock 으로 green→병합 후 잠복). 관찰: 병합 후 **실제 provider→consumer 왕복 1개 이상** 실행을 GATE.md 에 명시(없으면 blocker) + **통합앱 기준 critic/체크리스트 D 1회 더**. (intra ④) 🧪
- [ ] **병합 후 REQ 구현 생존** — worktree 병합/충돌해소가 한 REQ 파일을 다른 브랜치 버전으로 덮어도 그 테스트가 mock 우회·글로브 미실행이면 전체 green 유지('병합 green'≠'모든 REQ 구현 생존'); 핵심플로우 smoke 는 비핵심 REQ(엣지·admin전용) 드롭을 못 봄. 관찰: 병합 *전* worktree `git diff` 요약 → 병합 *후* HEAD 에 각 REQ 핵심 파일·diff 생존 대조(누락 0). 🧪
- [ ] **실 사용자 여정(배포)** — `health 200` ≠ 사용 가능. 배포(또는 로컬 기동) 후 **실제 로그인 + 핵심 액션 1회**. 🔬
- [ ] **standalone 이미지 미실행 done 금지(배포 전)** — `tsc`·`npm run build`·CI typecheck 초록 ≠ 이미지가 실제로 뜸. 프로덕션 standalone 이미지에서만 터지는 함정(① import-time throw[env 미설정 시 모듈 평가 실패] ② 네이티브 모듈[sharp]의 top-level import ③ 번들 밖 스크립트[migrate]의 의존성 누락[dotenv] ④ 크로스플랫폼 lock[`npm ci`])은 `dev`·`build` 가 *전부* 못 보고 **실제 `docker build`+`run` 만** 본다 → 배포하면 CrashLoop. (intra 2026-06-22: 이 4개로 클러스터에서 4연속 발견.) 관찰: 배포 전 **이미지 빌드+실행+`/api/health` 200**(throwaway DB로 엔트리포인트 migrate 포함) 1회 — 예: `scripts/preflight-deploy.sh`. 미실행이면 'done' 금지. 정본 [[standalone-image-preflight-smoke-test]]·[[bns-nextjs-deploy-starter]]. 🔬🧪
- [ ] **dry-run smoke ≠ 라이브 smoke(배포·intranet)** — 크레덴셜 없이 로컬 기동 smoke 는 TLS·인그레스·cert-manager·인증미들웨어·CORS·런타임시크릿(k8s Secret)·클러스터 고유 제약(CSI/MariaDB/dind)을 *전혀* 안 거침 → `health 200` 라도 클러스터 검증 아님(bns 6연속 실패가 전부 이 사각); 보안 REQ(401·HTTPS강제·429)는 로컬 미들웨어 비활성으로 검증 불가. 관찰: `smoke[].result` 를 로컬이면 반드시 `dry-run`(≠pass) + GATE.md 에 dry-run 비율 노출 + intranet 에서 전부 dry-run 이면 critic 'live 미완→ops_gaps+warn', 보안 REQ 는 `partial`. '실 사용자 여정'은 dry-run 시 `N/A — 라이브 미완` 명시. 🔬🧪
- [ ] **빈 DB cold-start(배포)** — smoke·acceptance 가 시드된 환경(initdb+기존 레코드)에서만 green → 신규 테넌트의 **완전 빈 DB**에서 참조데이터 부재 FK 오류·null 역참조 NPE 로 500; health 200 은 빈 DB 에서도 통과(initdb 는 빈 볼륨 최초 1회만). 관찰: smoke 에서 DB 완전 빈 상태(TRUNCATE ALL)로 리셋 후 핵심 플로우 1회, 또는 acceptance 에 '빈 DB 첫 실행' 1개. *(local 단일운영 N/A 가능)* 🧪
- [ ] **기동시 자동 migration(B전략) × 롤링 동시성**(intranet, replicas≥2 + 기동시 db push/Flyway) — ①두 파드 동시 migration → DDL 레이스(단순 도구는 동시안전 미보장) ②서버가 migration 완료 전 listen + readiness(/health DB핑)만 통과 → 없는 컬럼 참조 500. 관찰: migration 이 advisory lock/initContainer 단일 Job 으로 직렬화되나 + 완료 후에만 listen 하나; dry-run 은 docker-compose 두 컨테이너 동시 기동으로 재현. 🧪
- [ ] **매니페스트 델타 vs set image** — 배포에 env/볼륨/configmap/secret 추가·변경이 있으면 `set image`(태그만 교체)로는 *반영 안 됨* → `kubectl apply -f` 강제. 파이프라인 exit 0 은 '이미지 교체 성공'일 뿐 새 config 적용 보장 아님(구 env 재시작→새 기능 런타임 오류). 관찰: `manifest_changed: bool` 기록 + true 면 apply 했는지 + 파드 실제 env/마운트 조회. (intranet-deploy.md) 🧪
- [ ] **롤링 혼재구간 호환(expand/contract)** — RollingUpdate 중 구·신 파드 동시 가동 → 신코드가 구스키마 참조·파괴적 변경(컬럼 삭제·타입변경)이 구파드를 깨뜨림; smoke 는 *롤아웃 완료 후* 돌아 이 구간을 못 봄. 관찰: 스키마 변경이면 추가형(안전)/파괴형(위험) 분류 + 파괴형은 expand 먼저·코드 나중 2단계. (agora 무중단, bns ddl-auto:validate) 🧪
- [ ] **롤백 실행됨(명시 ≠ 실행)** — `rollback` 명령을 *적어둔 것* 만으로 통과 금지 — 실제로 이전 상태(이미지/env/스키마) 복구하는지 1회 행사. 관찰: local=이전 이미지 재기동 후 health+smoke; intranet=`kubectl rollout undo` 실행을 smoke 와 기록; `DEPLOY.manifest.rollback_tested: <true|N/A+이유>` — false/공란이면 blocker. (rail §retro 가 직접 제안) 🧪
- [ ] **health 엔드포인트 DB-aware**(배포·`REQ-OPS-*`) — `/api/health` 본문이 DB 등 핵심 의존 상태 포함(`{status:ok, db:ok}`)하고 DB 끊기면 비정상 반환해 readiness 가 파드를 트래픽에서 뺌. status 키만 보는 smoke 는 DB 죽은 상태도 200 통과시켜 readiness 가 영구 ready(이후 DB 요청 전부 500). 관찰: health 코드에 DB 핑 + DB 일시 차단해 비정상 전환 1회. (정본=intranet-deploy.md) 🧪
- [ ] **smoke 시나리오 충실도** — 각 REQ smoke 가 SPEC acceptance given/when/then 을 *의역·약화 없이* 검증하나. 함정: given/when/then(구조)→smoke 자유텍스트(curl)로 옮기며 복합조건(특정역할 when 특정행위 then 특정거부)을 단순 200 으로 의역하면 `result:pass` 인데 critic dim2 는 'smoke 존재'만 봐 통과. 관찰: smoke 를 acceptance 와 1:1 대조 — given 전제(역할/상태)가 셋업되고 then 기대결과가 단언에 그대로. 🧪
- [ ] **재개·매핑유지 done 재검증(stale-done)** — /develop §1 재개·change-ingest 크로스워크에서 REQ-ID 유지로 `status:done` 건너뛴 REQ 는, acceptance 가 **현재(변경된) 코드에서 재실행돼 green** 인지 확인 전엔 신뢰 금지(옛 빌드 green·'변경 없음 선언'은 새 코드 충족 보장 안 함). 관찰: inherited/skipped REQ 는 통합 후 acceptance 1회 재실행(또는 명시 N/A). 🧪

## E. 동시성/멱등성 (쓰기·뮤테이션 REQ — `REQ-CORE-*`·결제·예약·포인트·생성 POST)
- [ ] **요청 멱등성** — 동일 body POST 가 더블클릭·타임아웃·retry 로 2회 도달해도 레코드/사이드이펙트 1개. acceptance '요청 1회' 기준이라 단일호출 green 이지만 실제 재시도는 중복(결제 2건). 레이스([[constraints-as-truth]])와 **별개** — 자연 unique key 없는 create-POST 는 UNIQUE/EXCLUDE 로도 안 잡힘. 선언: SPEC.manifest 쓰기 REQ 에 `idempotency: required|n/a|explicit(key)`; required 인데 key/dedupe 없으면 blocker. 관찰: 동일 body 2회 연속 POST 후 row 수=1. (read·GET·자연멱등은 명시 N/A) 🧪

## F. 비명백 출력/주입 표면 (메일·파일·CSV/엑셀·파일명·경로·셸인자)
- [ ] **출력표면 입력 이스케이프/새니타이즈** — '발송됨'·'다운로드됨' 은 *생성 성공* 신호일 뿐 안전 보장 아님. 적대 페이로드로: (1)메일/HTML 본문·제목 → `<script>` 주입 후 메일 소스가 `&lt;`(이스케이프)인지 `<`(raw)인지(intra: 공지 미이스케이프 시 전직원 raw 렌더, esc()로 해소) (2)CSV/엑셀 셀 → `=`·`@`·`+`·`-` 시작 값이 수식 아닌 텍스트로 저장(CSV 인젝션) (3)파일명/경로 → `../../`·공백·`;`·`|` 가 400/sanitized 거부(경로순회). 관찰: smoke 를 '성공'으로 끝내지 말고 산출물 소스 직접 확인. *(critic dim 4 보강)* 🔬🧪
- [ ] **평문→리치(HTML) 본문 전환 = 저장형 XSS 표면** — 사용자 본문을 평문(`textContent`)에서 *HTML 저장*으로 바꾸면(인라인 이미지·서식) 그 자체가 저장형 XSS 표면. "이미지 보임"만으론 거짓완료. 필수: ①검증된 sanitizer(`sanitize-html` 등) **화이트리스트**(손수 파서 금지) ②업로드 이미지 `sharp` 재인코딩(raster→webp, EXIF/스크립트 제거; 위장 파일은 디코딩 실패로 거부) ③`<img src>` 를 **내부 엔드포인트만** 허용(외부/data/js 제거) ④**저장·렌더 양쪽** sanitize ⑤프라이버시 게이트된 본문(익명)은 이미지 URL 추측 가능 → 인라인 제외. 관찰: 본문에 `<script>`·`<img onerror>`·외부 `src` 주입→저장·재렌더에서 *전부 제거*되고 실행 0(document.title 미변조). (intra 2026-06-21: 본문 인라인 이미지) 🔬🧪

## G. 게이트/프로세스 무결성 (process — 레일 자신·오케스트레이션; 모든 단계)
- [ ] **골든 샘플 먼저 (병렬 팬아웃 전 검증)** — 유사한 N개(화면·팝업·REQ·컴포넌트)를 *동시에* 만들면 패턴/이해가 한 번 틀릴 때 **N개로 복제**돼 고칠 양이 N배. **미검증 이해를 병렬 탐색하지 않는다** — 하나를 먼저 시안/명세대로 만들어 *관찰로 검증*(사람 ✅) 후, 그 검증된 패턴을 나머지에 병렬 적용. 병렬은 *검증된 패턴 복제*엔 OK·*미검증 탐색*엔 위험. 함정: 빠른 "전부 동시"가 사실은 오류 N배 복제(intra: 팝업을 페이지로 만든 오해를 병렬로 여러 팝업에 복제 → 워크플로 폭주, 사람이 일일이 중지). 정합: [[design-ready-skin]] "샘플 먼저(login·home·car-day)", req-implementer 병렬 REQ. 🔬(2026-06-20)
- [ ] **게이트 승인 출처(자가승인 금지)** — `pipeline.yaml`의 `gate:approved` 는 *사람 검수*를 뜻해야 하나 산출 세션이 같은 파일에 쓰기 권한 → self-approve 가능(파일 값이 사람 검수를 대체). 함정: "승인하고 바로 다음" 한줄 요청에 세션이 `pending→approved` 를 스스로 쓰고 §0 하드거부(값만 읽음)를 통과. 관찰: 같은 세션 로그에서 사람 개입 없이 approved 로 바뀌었는지. *(critic dim 8)* 🧪
- [ ] **critic 발견 충실 전사** — GATE.md 'critic 결과' 칸이 {차원,심각도,위치,고칠방법}을 그대로 옮겼나, 아니면 '경고 없음'으로 의역(soft-pedal)했나. 루프백 후 '경고 없음'만 쓰면 사람이 거짓요약 위에서 approve. 관찰: GATE.md 칸과 critic 발견 목록을 나란히 + HANDOFF §3 루프백과 일치. 🧪
- [ ] **done 근거 (a)/(b)/(c) 분리** — GATE.md REQ별 표가 done 을 (a)acceptance pass/fail/skip · (b)critic pass/fail/루프백수 · (c)통합·기동·UI·배포 smoke real/dry-run/미실행 로 분리했나. 단일 'verification' 칸이면 (a)만 채우고 (b)(c) 생략해도 'done' 으로 보임 — 하나라도 '미실행/skip'이면 blocker 표시. 🧪
- [ ] **열린 결정 미해소 통과** — 직전 GATE.md '⚠️ 열린 결정'에 항목이 남았는데 `gate:approved` 만 써서 다음 §0 통과(스택·불변식·보안 미해소가 하류로 샘). 관찰: 다음 §0 이 직전 GATE 열린결정 수를 읽어 0 아니면 가시화; GATE.template 에 `[ ] 열린 결정 검토 완료` 칸. 🧪
- [ ] **회고 입력(루프백 로그) 무결성** — `/retro`·lesson-distiller 가 읽는 HANDOFF §3 은 세션 자가기록이라 누락·모호 시 '루프백 없음'으로 오판돼 학습 손실. 관찰: DEV.manifest partial→done 전환 수 vs §3 루프백 이벤트 수 교차대조(전환 있는데 §3 없으면 누락). 🧪
- [ ] **distill outcome 그라운딩**(`memory/lessons/*`) — lesson-distiller 가 '수정됨/완료/통과' 를 lessons 에 옮길 때 좁은 자가보고일 뿐 실제 반영이 아닐 수 있음(틀린 done 이 lessons→prior-art 로 전파; chat-archivist 엔 [P-C] 있으나 distiller 엔 없음=비대칭). 관찰: 단정 전 DEV/DEPLOY.manifest·pipeline.yaml grep 으로 그라운딩, 불가하면 `⚠️확인요망`. 🧪
- [ ] **스펙 문서 산출물 시크릿/내부호스트 누수**(`02-requirements.md`·`SPEC.manifest.yaml`·`creative/*` — intranet·company-internal) — 코드만 점검하면(req-implementer·dim4 는 코드 한정) acceptance 예시의 실 API키(sk-...)·내부 도메인(app.*.co.kr)·사설 IP 가 plain 커밋돼 이후 재스캔 0. 관찰: `gate:approved` 직전 창작 산출물을 chat-archivist SECRET_PATTERNS/사내마커(ingest.mjs)로 1회 스캔 — 환경변수 *이름*만 허용, 실값·호스트는 blocker. 🧪
- [ ] **검증 fixture 진정성(거부=정상 vs fixture 불량 구분)** — 검증/테스트가 실패할 때, *기능 버그*가 아니라 **fixture 가 불량**이라 *올바른 거부*를 한 것일 수 있음 → 멀쩡한 기능을 "버그"로 오인해 디버깅 낭비. (intra 2026-06-21: 손상 PNG 업로드→415 인데 기능 버그로 오인; 실은 sharp 가 위장/손상 이미지를 *정상적으로* 거부=보안 기능.) 관찰: 검증 실패 시 *fixture 가 유효한지부터* 확인(유효 입력은 통과해야; 거부가 명세상 올바른 동작인지) — 유효 fixture 는 가능하면 생성기로(예: `sharp` 로 실제 PNG 생성). 🔬

- [ ] **VRT 베이스라인 진정성(틀린 모습을 정답 삼음)** — "VRT 추가/통과" 보고인데 *베이스라인 자체가 틀린 화면*이면 회귀를 영영 못 잡거나(틀린 걸 정답화) 매번 오탐. 실증(intra 2026-06-25): 모달 VRT 를 ⓐ 페이드인 *전환 중*(반투명) ⓑ `locator.screenshot` *element-clip 배경비침* 으로 두 번 잘못 캡처 — 눈으로 봐야만 드러남. 또 풀페이지 텍스트는 *환경 간 폰트 AA* 로 0.1~0.3% 항상 diff(threshold 0.2 + 실패기준 백분율 >0.5% 로 흡수 안 하면 거짓FAIL). 관찰: 베이스라인은 *생성 즉시 1회 눈검토*(풀페이지·불투명·안정상태) 후에만 커밋; 동적값(이름·시각)은 마스킹; 환경 바뀌면 재생성(베이스라인은 환경별). 🔬
- [ ] **정적 카탈로그 "0 미매칭=충실" 거짓안심** — 시안↔impl 문자열 대조가 "미매칭 0" 이어도 *추출이 빠뜨린* 게 있으면 거짓. 실증(intra 2026-06-25): ⓐ 변수/맵 공급(`placeholder={MAP[k]}`)이 `placeholder="…"` 리터럴 스캔을 빠져나가 거짓갭/오통과 ⓑ 개행 포함 정규식이 JSX 를 통째 삼켜 거짓갭 ⓒ JSX **보간 본문**(`{name} …`)은 정적 리터럴이 아니라 스캔 밖. 관찰: impl 은 *단일행 일반 리터럴*까지 보조 haystack; 다중행 패턴 금지; 본문 보간 텍스트는 정적 범위 밖(렌더-상태로 별도)임을 명시 — "정적 0" 을 "본문까지 충실" 로 과대보고 금지. 🔬

- [ ] **시드만 검사 — 생성(CRUD) 라이프사이클·동적 라우트 미검**(seed-only) — 테스트/감사가 *시드 데이터의 읽기*만 보면 사용자가 *새로 만든* 엔티티의 흐름(생성→네비 즉시반영→동적 라우트 진입→하위 CRUD 가 자기 컨텍스트로)이 통째로 빠진다. 외부 검색에도 잘 안 나오는(=놓치기 쉬운) 계열. 실증(intra 2026-06-25, 사용자 발견): 게시판 *추가* → ① 사이드바 즉시 미반영(생성 액션이 *레이아웃* revalidate 안 함) ② 진입 **404**(기명 커스텀 보드 `/board/[slug]` 동적 라우트 부재) ③ 글쓰면 자기 보드 아닌 notice 로(listPath 하드코딩) — "시드 3개 읽기"만 검사해 *생성 흐름*을 한 번도 안 밟음. 관찰: *사용자가 만들 수 있는 모든 엔티티*에 대해 '생성→네비 즉시반영→진입 200→하위 CRUD 자기 컨텍스트' 를 1줄 검사(seed-only 금지). 동적 라우트는 *시드 slug 말고 새로 만든 slug* 로 200 확인. [[crud-lifecycle-and-dynamic-routes]] 🔬

- [ ] **운영화/시드제거를 한 화면만 — 형제 진입 폼 미감사**(fix-the-class 의 인증폼 인스턴스) — 운영화(시드 더미·개인값 제거)·보안 처리를 *한 화면*만 하고 같은 계열 형제를 빠뜨림. 실증(intra 2026-06-25, 사용자 발견): 로그인은 더미 `hong` 제거했으면서 *비밀번호 찾기*의 `useState("hong")` 를 놓침(+ 그 더미가 '보냈습니다' 화면이 입력값 아닌 더미를 echo 하던 버그를 가림). 관찰: 운영화·시드제거·보안가드는 *그 계열 형제 전수*(인증/진입 폼 login·forgot·reset·set-password 전부) — 검사로 *모든* 진입 폼의 시드 프리필=빈값 단언(한 화면만 X). 메일 등 SMTP 는 백그라운드(`after()`) — 동기면 토스트/응답을 막음(운영 실측 ~3.8s). [[fix-the-failure-class-not-the-instance]] 🔬

- [ ] **앱이 선언한 한도 ↔ 프레임워크/인프라 기본 한도 불일치**(경계값에서만 조용히 터짐) — 앱 코드가 한도를 정해도(첨부 10MB·업로드 N개) *그 아래 계층*(프레임워크 요청 본문 한도·프록시 body·DB 컬럼·타임아웃)이 더 작으면, 경계 구간 입력만 *액션 실행 전*에 거부돼 cryptic 에러로 터진다. 실증(intra 2026-06-25, 사용자 발견): 첨부 허용 10MB 인데 **Next.js Server Action `bodySizeLimit` 기본 1MB** → 1~10MB 첨부 글 등록이 "데이터를 가져오지 못했습니다"+글 미생성. 작은 파일·텍스트로만 테스트해 *경계 위* 입력을 한 번도 안 보냄. 관찰: *한도를 선언한 곳마다* 그 값을 받쳐줄 하위 계층 설정(serverActions.bodySizeLimit·nginx client_max_body_size·DB 타입·timeout)을 같이 확인 + **테스트는 한도 *근처/초과* 입력으로**(small-only 금지). 🔬

## H. ★시간축·비기능·정합성 (게이트 통과 *후* / acceptance 가 안 적는 차원 — 완전성 비평 2026-06-20, 아직 표면 얕음)
> 단발 게이트가 '지금 이 시점'만 봐서 구조적으로 못 잡는 범주. 해당 프로젝트면 REQ/acceptance 단계에서 미리 다루고, 아니면 명시 N/A.
- [ ] **시간축 거짓완료(time-decay)** — '지금 done' 이 N일 뒤 거짓이 됨: TLS 인증서 만료(cert-manager 갱신 실패)·시크릿/토큰 로테이션 후 401·디스크/볼륨 가득·로그/DB 증가로 점진 성능 붕괴·의존성 CVE. 단발 smoke 는 못 봄. 관찰: 만료·로테이션·용량 경보가 ops_gaps/모니터링에 잡혀 있나(없으면 명시). 🧪
- [ ] **비기능 요구(성능·용량·관측성)** — acceptance·smoke 가 전부 기능적 then(상태코드·값·렌더)이라 p95 응답·N+1 쿼리·타임아웃·메모리누수/OOM·'실패가 로그에 보이나'가 REQ 로도 표현 안 됨. health 200·기능 green 이어도 응답 10초·OOM 재시작 루프면 사용 불가. 관찰: 핵심 REQ 에 비기능 acceptance(p95·동시 N·메모리 상한) 1개라도 있나. 🧪
- [ ] **사후 데이터 정합성(backfill·부분실패)** — cold-start·migration race 외에, 운영 중 기존 row 가 새 스키마/불변식을 위반하는 상태로 남음(backfill 누락)·부분실패 후 orphan·멱등 재시도가 남기는 중간상태 = '쓰기는 됐는데 데이터가 반쪽'. 관찰: 스키마/불변식 추가 시 기존 데이터 마이그레이션·정합성 점검 1회. 🧪
- [ ] **R4a 위임 품질·tier 준수** — bulk→Sonnet 위임이 '품질 저하 없이 done' 인지, judgment 단계가 실제 Opus 로 돌았는지 검증하는 렌즈가 없음(싼 모델이 조용히 품질 떨어뜨려도 critic 이 못 봄). 관찰: 위임 산출은 자가보고 말고 호출자가 경계로 직접 검증([[verify-by-observation]]). 🧪

## ★ 생성형 프리모템 (목록 밖 — 목록이 스스로 자라는 길)

체크리스트는 *이미 겪은* 함정이다. critic 은 위 점검에 더해 **항상** 묻는다:

> **"이 산출물이 보고는 `done` 인데 실제로 깨졌다면, 어떻게 깨졌을까?"** (적대적 전제 = 숨은 결함이 있다)

목록에 없는 모드가 떠오르면 → (a) 해당 REQ 루프백 + (b) **`/retro` 가 그 모드를 이 파일에 append**(표면 분류 + 관찰법 + 출처). 이렇게 해서 *사람이 직접 겪고 명령하지 않아도* 새 함정이 레일에 축적된다.

---
근거: `lessons/rail.md`(4·5·7·8회차), `lessons/todo-toy.md`, `lessons/intra.md`, `lessons/bns-intranet.md`, auto-memory `intranet-ops-debug-lessons`. 🧪=10렌즈 적대 sweep(2026-06-20, 47에이전트·32확인갭). 패턴: [[verify-by-observation]].
