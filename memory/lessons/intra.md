# 교훈 — intra (Phase 1.5 Orbit 스킨 + Phase 2 ①②③+④슬라이스) · 2026-06-19

> intra(외부 repo `E:\intra`) 디자인 회수→스펙(change-ingest)→전35화면 스킨→DB→인증→예약 한 흐름 실연결까지. 여기 모은 건 **막혔던 지점/실패와 그 해소**(다음 세션이 같은 데서 안 막히게). 관련 [[rail]] · [[bns-intranet]] · [[design-ready-skin]] · [[ingest-convergence]].

## 무엇이 잘 됐나
- **change-ingest + critic**: 화면 33→35 크로스워크(누락0)·불변식 상속·온보딩 모순 해소를 critic 1회 루프백으로 봉합.
- **design-ready-skin 실증**: base.css/orbit.css 토큰을 globals 단일출처로 이식 → 35화면 그룹별(sonnet 병렬) 리스킨이 시안 픽셀충실. "샘플 먼저(login·home·car-day) 보여주고 전략 확정"이 비전문가 검수에 잘 맞음.
- **불변식을 DB가 강제**: 예약 중복차단(EXCLUDE gist)·거리 단조성(CHECK)·보정 append-only(트리거) — UI 우회해도 안 뚫림(테스트로 거부 확인). agora 패턴 실현.

## ★막혔던 지점 / 실패 (다음에 같은 데서 안 막히게)
1. **dev DB 리셋이 DROP SCHEMA → 떠 있는 dev 서버 커넥션이 stale**. 증상은 엉뚱하게 *서버액션에서 세션을 못 읽음→로그인으로 튕김*(RSC 읽기는 됨). 원인 = 풀의 기존 커넥션이 옛 OID/prepared 캐시. **해소: 리셋을 `TRUNCATE … RESTART IDENTITY CASCADE`(스키마 유지)로**(테이블 없으면 마이그레이션). DROP/CREATE 스키마는 dev 재시작 동반해야.
2. **서버액션 폼 E2E에서 `button[type=submit]` 셀렉터가 엉뚱한 버튼 클릭**. 메인 셸(AppShell)에 *로그아웃 form(submit)* 이 있어서, 콘텐츠 폼 대신 로그아웃이 눌림 → "세션 사라짐"으로 오인. **해소: 버튼을 텍스트로 지정**(`button:has-text("예약 확정")`). 교훈: *로그인 화면으로 튕긴다 = 인증 버그*라고 단정 말 것(잘못된 버튼=로그아웃일 수 있음).
3. **DB 드라이버 예외가 `e.cause`로 감싸짐**. Postgres exclusion(23P01)이 `e.code`엔 없고 `e.cause.code`/`e.cause.message`에 있어, catch가 못 잡아 **500**(친절한 "이미 예약됨" 대신). **해소: `e.code ?? e.cause?.code` + message도 cause까지** 검사.
4. **CJS top-level await 불가**: `"type":"module"` 없는 repo에서 tsx로 `.ts` 스크립트의 top-level await → esbuild "cjs" 에러. **해소: async IIFE 또는 `.mjs`**.
5. **CSS @import 순서**: 디자인 시스템 `base.css` 최상단의 `@import url(pretendard)` 가 globals로 인라인되며 *다른 규칙 뒤로* 밀림 → "@import must precede all rules". **해소: 폰트 @import를 globals.css 최상단으로**(중첩 CSS의 @import는 진입 CSS 맨 위로).
6. **Git Bash(MSYS) 경로 변환**: curl/스크립트의 선행 `/route`가 `C:\Program Files\Git\route`로 둔갑. **해소: `MSYS_NO_PATHCONV=1`**.
7. **포트 충돌(내가 안 켠 것)**: 3000은 **agora Docker 컨테이너**가 점유(부팅 잔류) — "agora1234" 로그인 스샷으로 발각. **교훈: 포트 점유·도커 상태를 먼저 확인**(내가 안 켠 걸 내가 켰다고 가정 말 것). intra dev는 4210, DB는 5433로 분리.
8. **서버액션 리다이렉트 E2E는 `waitForURL`로 대기**(`waitForLoadState`는 리다이렉트 전 상태를 캡처해 오판). **redirect()는 try 밖에서**(NEXT_REDIRECT를 catch가 삼킴).
9. **위임(sonnet) 산출 함정**: lucide 설치버전에 일부 아이콘 없음(MailForward/ShieldLock) → 에이전트가 dev 200 자가검증으로 대체. **각 에이전트에 "dev로 자가검증" 지시가 이걸 잡음.** 그룹별 CSS는 `bns-<group>.css`를 page에서 import(globals 충돌 회피).
10. **Next 16 deprecation**: `middleware.ts` → `proxy.ts` 권고(현재 동작하나 경고). backlog.

## 레일 수정 제안 (승인 대기)
- **[T1] `/develop` DB 단계 표준**: "리셋은 TRUNCATE(스키마 유지)·`db:up/reset/check` npm 스크립트·`.env` gitignore·EXCLUDE/CHECK/트리거는 SQL 마이그레이션 정본(Drizzle 밖)" 을 develop 체크리스트에. 이유: 위 #1·#3은 반복될 풀스택 함정.
- **[T2] 서버액션 E2E 표준**: "셸에 자체 form(로그아웃)이 있으니 버튼은 텍스트로 지정 + `waitForURL`로 리다이렉트 대기 + redirect는 try 밖" — `req-implementer`/verify 노트에. (#2·#8)
- **[T3] design-ready-skin 보강**: "디자인 시스템 CSS의 원격 @import(폰트)는 globals 최상단으로", "그룹별 화면 CSS는 page-level import로 충돌 회피". (#5·#9)

## 승격 후보 (2+ 프로젝트 반복 시)
- **"불변식은 DB 제약으로 강제(EXCLUDE/CHECK/append-only 트리거), UI는 보조"** — agora·intra 2회 → [[constraints-as-truth]] 보강 후보.
- **"DB 드라이버 예외는 e.cause까지"·"dev 리셋은 TRUNCATE"** — 풀스택 일반 함정, `patterns/` 후보.

## ★Phase 2 ④ — 적대적 검증이 잡은 것 (ultracode: 에이전트 보고를 믿지 말 것)
전 화면 DB연결을 sonnet 위임 + **그룹별 독립 적대적 검증**(불변식·영속성)으로. 위임 에이전트 자가보고는 "정상"이었으나 실제 경계를 테스트하니 결함:
1. **★[major·불변식 누수] 게시판 익명 본문을 관리자에게도 열어줌.** 에이전트 보고 "익명 보기는 admin/exec만 — 정상"인데, 스펙은 "**시스템 관리자도 불가, 임원(exec)만**". 코드 `canView = isExec(user) || user.role === "admin"`. → `isExec(user)` 로 수정. **경계 테스트**(admin 차단·exec 허용)로만 발견 — 보고만 믿었으면 익명성 누수. *교훈: 권한 불변식은 "허용되는 사람" 뿐 아니라 "차단돼야 하는 사람"까지 적대적으로 테스트.*
2. **[major·일관성] 마이페이지 비번변경이 기존 세션 무효화 안 함.** auth `setPasswordAction` 은 `destroyAllSessions`+재발급 하는데, mypage `changePassword` 는 hash update 만. → 같은 코드베이스에 *동일 동작의 두 경로*가 있으면 한쪽만 고쳐진 일관성 갭을 의심. destroyAllSessions 추가.
3. **[minor·견고성] 비정수 쿼리파라미터 → 500.** `Number("abc")=NaN`, `id != null` 가드가 NaN 통과 → `eq(id, NaN)` → Postgres "invalid input syntax". → `Number.isInteger(id)` 가드. *교훈: Number(쿼리파라미터)는 항상 isInteger 가드.*
4. **[minor] 조기종료 end_at 클램프** — `GREATEST(now(), start+1m)` 가 과거 예약을 *연장*(now>원래끝). → `LEAST(원래끝, GREATEST(...))`.
- **검증된 풀스택 패턴(재사용)**: 반납=트랜잭션(trip insert + status=returned), 출발거리=서버권위(직전 trip/차량init, 폼 입력 무시), 거리 단조성은 DB CHECK(23514) 친절오류, 보정 append-only는 DB트리거. EXCLUDE에 status 미포함은 **버그 아님**(쓴 시간은 재예약 불가가 정상).

## ★Phase 2 ⑤엑셀·⑥메일·⑦테스트 — 적대적 검증이 잡은 것
워크플로(그룹별 wire→적대적검증)로. ⑤ exceljs 운행기록부(차량별 다운로드)·⑥ nodemailer+**Mailpit**(개발 SMTP, 실발송+웹확인)·⑦ node:test(DB불변식 6 + E2E 8). 결함:
- **[보안] 메일 템플릿이 사용자 입력 미이스케이프** → 공지 제목/본문에 `<script>` 주입 시 전직원 메일에 raw 렌더. → `esc()` 추가(Mailpit으로 `&lt;script&gt;` 확인). *교훈: 메일 HTML도 XSS 표면 — 입력 이스케이프.*
- **[버그] 엑셀 다운로드 링크를 차량 *이름*으로 필터** → 동명 차량시 오링크. → 차량 id 기준(TripRow에 vehicleId 추가).
- **★[테스트 신뢰성] `node --test tests/`(폴더인자)가 Node22에서 0개 실행**(MODULE_NOT_FOUND). → 글로브 `"tests/**/*.test.mjs"`. *교훈: 'tests pass'를 믿기 전에 프로젝트 표준 명령(`npm test`)으로 실행되는지 확인 — 명시 파일경로로만 돌면 CI에서 0개.*
- **★[거짓안심] 차량 영구삭제 차단이 DB강제 아님**(reservation.resource_id 다형참조라 FK 없음 — employee/부서/게시판은 FK RESTRICT인데 차량만 누락). 테스트가 employee만 검증해 "DB가 막는다" 착각. → `0002_delete_guards.sql` 트리거(23503)로 DB강제 + 테스트에 차량 케이스 추가. *교훈: 다형참조는 FK 가드가 없다 — 트리거로 보강. 테스트는 한 케이스가 아니라 같은 불변식의 모든 마스터를 확인.*
- **[테스트 격리] 파일간 잔류 데이터** — db-invariants가 남긴 예약이 e2e와 충돌. `--test-concurrency=1` + 파일당 `before(resetDb)`(TRUNCATE라 dev커넥션 안깸)로 직렬화·청소. *교훈: 공유 DB 테스트는 결정적 리셋 + 직렬화.*

## ★야간 자율 세션 — 인터랙션 충실도가 핵심 교훈 (사용자가 반복 지적)
"테스트 green인데 눌러도 안 됨"이 반복 노출됨. **근본 원인 = 스킨/위임이 데이터·CRUD는 만들고 시안의 세부 인터랙션을 뭉뚱그림**, 내 테스트는 URL 직접접근 happy-path만 봐서 *죽은 버튼/누락 모달*을 못 잡음. → [[done-means-observed-working]] 강제.
- **해결 도구 = 인터랙션 충실도 감사**(자동): 화면별 ① 시안 HTML 의 모든 인터랙티브 요소 ↔ 구현 wiring(Link/form-action/모달) 정적 대조 + ② Playwright 로 실제 클릭해 URL/모달/DB 무반응(dead click) 탐지. 이게 수동 눈검사 없이 갭을 체계적으로 잡음. **3라운드**(감사→수정→재감사) 돌림.
- **잡힌 실제 갭(누적 ~20+)**: 사이드바 3메뉴가 전부 `/board`(공지·자유 오연결)·자유게시판 **라우트 자체 없음**→named board 미러 생성; 관리자 4화면 **수정모달(연필) 전무**→사원 패턴 복제; 게시판 **순서▲▼ 죽은버튼**; 익명 **답변 컴포저 없음**(임원이 답변 못 씀=핵심기능)·**비번게이트 우회**(고아 password 페이지); 공지 **댓글 미연결**(시드 allow_comment=false가 시안과 불일치)·자유 댓글이 **공지 URL로 리다이렉트**(하드코딩); 차량 **수정 폼 정적**(updateReservation 부재)·상세 링크 **id 미전달**(엉뚱예약 반납 위험)·주간/월간 막대 **클릭불가**(div, 회의실만 Link); **고아 Phase1 프로토타입**(useStore 페이지·menu.ts 죽은 nav).
- **교훈**: (1) *시안 = 정본이면 시안의 인터랙션 인벤토리 전체를 wiring 했는지 화면별로 대조*해야 함(부분구현 위험). (2) **메서드/액션 복제 시 하드코딩 경로**(addComment 가 항상 /board/notice)·**비대칭 누락**(day는 Link, week/month는 div) 의심. (3) **고아 라우트**(직접 URL 도달, nav 미연결)는 dead-click 원천 — 주기적 grep 청소. (4) **시드값이 시안과 모순**(notice allow_comment=false)이면 시안 우선.

## ★야간 — 부가기능·backlog·보안 (워크플로 + 적대적검증)
- ⑤좋아요(post_like UNIQUE 토글)·조회수·글고정(admin)·페이지네이션·첨부(bytea+**EXIF제거 sharp**)·로고업로드 — 순차 워크플로(DB공유라 병렬불가)로. 0003(첨부·좋아요·조회수·고정)·0004(로고)·0005(재설정토큰) 마이그레이션.
- **★[보안] 로고 SVG = 저장형 XSS**: `image/svg+xml` 허용+무정제 저장+`/api/company/logo`(공개·CSP無) 서빙 → 악성 SVG `<script>` 동일출처 실행. → **SVG 제외(PNG/JPEG만, sharp 재인코딩)** + nosniff. *교훈: 업로드 이미지에 SVG 허용 금지(래스터만), 사용자 업로드를 공개 라우트로 inline 서빙 주의.*
- **재설정 플로우 완성**: 토큰 미저장→링크 검증불가였음. sha256 해시 저장·30분·1회용·GET 선검증(서버컴포넌트)+POST 재검증·세션무효화. middleware→**proxy.ts**(Next16) 전환(페이지 requireUser 2차방어라 안전).
- **리치에디터 본문**: execCommand 굵게/목록은 편집중 동작하나 **평문 저장**(서식 미영속) — HTML 저장=XSS표면이라 **의도적 안전선택**(sanitizer 도입은 후속).
- **테스트 함정**: 콜드스타트(dev 재시작 직후) 첫 서버액션이 컴파일하느라 느림 → 메일 대기는 **고정 sleep 말고 Mailpit 폴링**. 라우트 삭제 후 `.next` stale → dev 재시작.

## 상태 (다음 세션 재개점)
- Phase 2 ①~⑦ + **부가기능(좋아요·조회수·고정·페이지네이션·첨부+EXIF·로고)** + **backlog(proxy전환·재설정플로우완성)** + **반응형 스캐폴드(시안 대기)** 완료. **`npm test` 38/38**(DB불변식6·E2E8·인터랙션8·부가5·재설정2·자유게시판 등). 인터랙션 3라운드 감사로 갭 ~20건 수정.
- 남은 갭 = **사양 밖(시안>gate0 합의: 회사 9필드 vs 확정2·사원검색/필터·reserve 종일/메모/대리예약·trips 과세기간·mypage 라이브강도·댓글 답글/좋아요/비밀·글 수정삭제)·익명성 충돌(작성자 글삭제=author_id NULL)·deferred(리치에디터 서식영속·드래그생성·반응형 시안)**. 전부 문서화(은닉 아님).
- 다음 = **⑧ k8s 배포만 남음**(보류). 배포 인프라 **전무**(health·graceful·Dockerfile·k8s·CI 미생성) — 공개망 TLS/인가/rate-limit/보안팀 사인오프 필요. 데이터모델 확장(회사필드·메모·업무구분 등)은 사양 결정 후.
- 인프라: dev 4210·DB intra-pg(5433)·메일 intra-mail(Mailpit 1025/8025). 재현 `npm run db:up→db:reset→db:check`, `npm test`. 계정 hong=admin·lee=exec·park=general·kim=임시·익명열람비번=설정됨. (실 데모 비번 3종은 보안상 **마스킹** — 로컬 `reset.mjs`/seed 에만 존재, 푸시 금지.)

## ★시안 충실도 — 가장 큰 교훈 (2026-06-20, 사용자가 손 뗌)
사용자가 모달/팝업·익명성 모델을 **연달아** 잡아줬고, 결국 **상세/폼 화면이 시안 마크업과 1:1이 아님**(=DB연결 때 시안 구조에 데이터만 바인딩하지 않고 *단순화해 새로 짬*)이 드러나 손을 뗐다.
- **예: car-detail 시안 = 상태 스테퍼(예약→반납)+fact-grid(일자·시간·사용자·업무구분·목적·메모)+주행거리(출발/반납/거리)+보정패널** / 구현 = 일시·사용자·목적·상태 **4줄 dl**. 모달 동작은 OK인데 *내용이 딴판*.
- **모달 CSS(.fact-grid·.stepper-h·.modal·.odo·.st-badge)는 프로젝트에 이미 있음** → **시안 HTML 구조를 1:1로 옮기고 데이터만 끼우면** 됨(원본 `design-input/.../orbit/<screen>.html` + inline style + base/orbit.css).
- **교훈**: ① *"버튼이 눌리나/라우트가 뜨나"(기능)와 "시안 마크업·레이아웃과 1:1인가"(충실도)는 다른 검증*이다. 내 인터랙션 감사는 기능만 봐서 충실도 갭을 통째로 놓침 → [[done-means-observed-working]] 를 **"시안과 픽셀/마크업 대조"** 까지 확장. ② *design-ready-skin = 시안 마크업 보존하고 데이터만 바인딩*. DB연결한다고 화면을 새로 짜면 충실도가 증발한다. ③ 모달 vs 페이지 같은 **구조/레이아웃도 시안 정본**(인터셉트 `@modal` 패턴은 components/Modal.tsx).

## 인계 상태 (검증 세션용 — 손 뗀 시점)
- **깨지지 않음**: tsc clean·14화면 200·`npm test` **39/39**. 모달 전환(차량/회의실/게시판상세/관리자5폼)·익명 본인삭제(비번=작성자)·proxy·재설정플로우 완료. 마이그 0001~0005. 미커밋(139파일).
- **인계 정본 = `E:\intra\HANDOFF-verify.md`** — 시안 모달/페이지 1:1 분류표 + 사용자 검증 프로토콜([1]표 [2]함정6 [3]결과, ❌0까지 done금지) + 단골함정 + 미반영 시안항목. 다음 세션은 **시안 충실도 검증·수정**이 main.

## ★2026-06-20 (이어받은 검증세션) — 충실도 교훈을 *적용* 못 한 메타 실패 (사용자: "교훈만 쌓으면 뭐해, 또 반복")
캘린더 날짜nav(6뷰)·게시판 기명글 CRUD(수정/삭제+편집모드)·익명 게시판 충실도까지 진행. **익명 게시판(전 세션 산출물)을 "구조가 페이지니 likely faithful"이라고 추측만 하고 시안 대조를 안 해** → 배너 문구 누락("열람 비밀번호로만…"·"본문은 암호화…"·"분실 시 본인 글이라도…")·shield-check→shield-lock 아이콘(또 [[icon-fidelity-tabler-not-lucide]])·page-head↔배너 순서·비번게이트 문구(제목/안내/버튼"열람"→"열람하기"/help) 전부 어긋남. 사용자가 "교훈을 또 무시했냐, 아니면 뭉뚱그린 걸 또 활용한거냐"고 지적.
- **★근본 원인 = 교훈의 *위치***: 작업 디렉터리가 `second-brain` 이라 `intra/CLAUDE.md`·이 `lessons/intra.md` 가 **자동 로드 안 됨.** 시안 충실도 교훈(위 §시안 충실도)이 *기록만 되고 이 세션 컨텍스트엔 안 떠서* 적용 안 됨 → 반복. **해소: `second-brain/CLAUDE.md`(이 세션이 확실히 읽는 곳) 최상단에 "외부 프로젝트 충실도 프로토콜"을 *능동 지시*로 박음** + 대상 프로젝트 작업 시작 시 그 `CLAUDE.md`/`lessons` 를 Read 로 먼저 끌어오기. **교훈은 *로드되는 위치*에 둬야 의미 있다(기록 ≠ 적용).** 양쪽(대상 + second-brain)에 박는다.
- **새 교훈**: [[audit-inherited-work-dont-assume]](재사용/인계 화면도 추측 말고 감사) · 페이지+컴포넌트 둘 다 읽기(페이지 배너를 폼에 또 추가해 배너 2개로 실증).
- 검증: 익명 4화면(상세 5/5·목록 4/4·작성 7/7·게이트 6/6) + `npm test` **39/39**. 캘린더 날짜nav·게시판 기명글 CRUD도 render 검증 완료. 다음 = 관리자 폼 색상 swatches(시드색 팔레트 정렬 결정 후).

## ★2026-06-21 (이 세션 후반) — 시안 충실도 *방법 전환* + 대규모 재작업
사용자: "게시판 상세/관리자/글쓰기가 여전히 시안과 다르다, 스샷 대조한다며 왜 못 찾냐, 아이콘이 작아 비교 힘드냐. 시안 그대로가 그렇게 어렵나?" **핵심 통찰(사용자): 시안이 HTML 소스인데 스샷 찍어 눈으로 보는 건 손실 round-trip — 소스에 ti-아이콘·문구·색·글꼴이 박혀 있다.** → 방법 전환 [[compare-design-source-not-screenshots]](시안 소스 파싱 diff 가 주 방법, 스샷은 최종 sanity).
재작업(전부 tsc 0 + npm test 39/39 + 고해상 스샷 sanity):
- 게시판: 댓글 시스템(좋아요·대댓글·비밀·작성자badge — 마이그 0007 comment.parent_id/secret + comment_like raw SQL + 클라 CommentSection) · 글쓰기 **게시 옵션 박스**(상단고정·댓글허용 — 통째로 빠져있었음) · 상세 수정버튼(무스타일 `<a>`→`.owner-act a` CSS) · 상세 고정버튼 제거(시안=글쓰기 옵션) · 목록 댓글수 badge(.cmt CSS 있는데 미사용이었음) · `post.allow_comment`(0008) · 첨부·좋아요·댓글 풍부한 시드.
- 관리자 대시보드 **100% 하드코딩이었음**(김운영·차량3대·사원48명·가짜 회사) → 실데이터 배선. 사원 검색·필터3.
- **전 화면 아이콘 lucide→Tabler**(시안 셋): import alias 트릭(사용처 불변) + 시안 ti-* 어휘로 결정적 매핑표 → 일부 병렬 에이전트. size 도 시안과 맞춤. ([[icon-fidelity-tabler-not-lucide]] 의 전면 적용.)
- flaky 2건(익명답변·사원삭제)=`Promise.all([waitForLoadState,click])`→`waitForURL`. 풀스위트 실패는 타깃 재실행으로 flaky/실버그 판별([[fast-feedback-not-timeouts]]).
- 메일: sendBroadcast 구현됨(nodemailer, dev=Mailpit 1025/8025). 실 배달엔 운영 SMTP env.
- 진행중: 전 화면 소스-diff 감사+수정(ultracode 워크플로) + 메일 실송 테스트(yskim).

## ★2026-06-21 (이어받기 세션) — 충실도 마감 + 검증 인프라 + 전이 가능한 교훈
사용자가 화면을 직접 보며 갭을 연달아 짚음. STRICT 재감사(8영역 병렬) → 배치 수정. **전부 tsc 0 + npm test 39/39 + Playwright 렌더/스샷 검증.** 한 것: 사이드바 동적화(차량 4대 DB+3단 관리자콘솔+홈 다펼침) · 검색 통일(라이브+입력칸끝 X, 게시판·사원관리 공용 `LiveSearch`) · 시드 2페이지(공지15·자유13)+페이지네이션 테스트 견고화 · 환각 '중요 토글' 제거 · 관리자 저장버튼(변경 사항 저장+플로피) · 회의실 일/주 회의제목(.purp) · 메일 시안화+로고 CID · author-bar 부서명 · live 코드 lucide 완전 제거(Tabler) · 사원 권한 select→토글2개 · **활성/노출 토글 켠상태 버그** · 모달 너비. 정본 목록 = `E:\intra\docs\FIDELITY-GAPS.md`(✅완료/⏳다음).

### 전이 가능한 교훈 (★다른 프로젝트에도)
1. **정본 소스가 진짜 최신인지 먼저 확인.** 감사 대상(`design-input`)이 *복사본*이라 낡았을 수 있다 — 원본(Downloads/handoff)과 **diff로 동일 확인** 후 감사. (이번엔 동일했지만 안 했으면 낡은 걸 봤을 위험.) 관련 [[compare-design-source-not-screenshots]].
2. **"시안 없는 추가도 갭"(STRICT).** 1차 감사가 시안에 없는 요소(중요 토글·검색해제 등)를 "정당한 union"으로 면죄 → 사용자가 "환각"이라 지적. 충실도 정본이 있으면 *임의 추가도 갭*. 예외는 **확정된 결정**(사번·임시비번·익명성·보안)뿐. "union이라 OK"는 사용자 확인받기 전엔 자기면죄. 관련 [[audit-inherited-work-dont-assume]].
3. **공유 토글 CSS + 인라인 knob = 이중 손잡이.** 공유 `.tgl .track::after`가 knob을 그리는데 버튼 토글이 인라인 knob까지 그려 **켠 상태에서 손잡이 2개**로 깨짐. → input 없는 토글은 `.track.on` 클래스로(중복 금지). *교훈: 공유 컴포넌트가 pseudo-element로 뭔가 그리면, 같은 걸 인라인으로 또 그리지 마라(중복 렌더 버그).*
4. **`.env` = 테스트·런타임 결합.** 메일을 Mailpit→Gmail로 바꾸니 Mailpit에서 토큰 읽는 테스트 3건 실패 + `.env`는 기동 시 로드라 **dev 재시작** 필요(HMR 아님). → 임시 override는 쓰고 **복원**, 결합 인지. 시크릿(앱비번)은 .env(gitignore)에만·쓰고 삭제.
5. **메일 이미지는 CID 내장 또는 공개 URL.** Gmail은 이미지를 *구글 프록시*가 대신 가져와서 `localhost`(개발기)엔 접근 불가 → 로고 깨짐. CID 첨부(`attachments:[{path,cid}]` + `src="cid:..."`)면 어디서든 렌더. *우클릭 새탭은 보이는데 인라인은 깨짐 = 프록시 접근불가 신호.*
6. **인터랙션 요소는 진짜 작동해야.** 검색 돋보기가 `pointer-events:none`(장식)이라 클릭 불가 → 사용자 "검색 안 됨". 시안이 "입력 전용"이면 **라이브 검색**(디바운스 라우팅)으로, 입력 즉시 동작+X. *장식처럼 보이는 컨트롤도 사용자는 누른다.*
7. **시드↔테스트 동시 수정**(재확인). 시드 글 추가가 페이지네이션 테스트의 카운트 단언을 깸 → 테스트에 **클린업 + 시드 무관 단언**(견고화)을 함께. [[fast-feedback-not-timeouts]].
8. **대량 편집 후 "깨짐"은 캐시부터 의심.** 사용자 "상단 아이콘 깨짐"이 코드 아니라 브라우저/빌드 캐시 — `Ctrl+Shift+R`/`rm .next + dev 재시작`이 해법. 코드 디버깅 전에 캐시 배제.
9. **무거운 변경은 컨텍스트 여유 있을 때.** 세션이 길어진 상태에서 DB 마이그레이션/새 패턴을 무리하면 검증 부실 위험 → 정직히 체크포인트하고 새 세션 권고(깨진 채 안 넘김 [[dont-hand-back-broken-state]]). "green ≠ 동작" [[done-means-observed-working]].
10. **기능 ≠ 화면만.** 충실도 작업이 많아도 기능(라이브검색 라우팅·동적 사이드바 쿼리·권한 도출 로직·메일 발송)도 병행. 사용자가 "화면만 그리냐" 물으면 = 기능 진척을 *보이게* 보고 안 한 신호.

### 재사용 자산
- 공용 `LiveSearch`(`src/components/`) — 검색 있는 화면 전부 동일(라이브+X). 새 검색은 이거 재사용.
- Playwright 검증 스크립트군(`scripts/verify-*.mjs`) — 로그인→화면→단언+스샷. 새 화면 검증 시 복제.

## ★2026-06-21 (이어받기2 세션) — 모달·드래그·인라인이미지·성능·버그 (전이 교훈)
사용자가 연달아 요청·버그제보(삭제확인 모달 → 차량 마이그/필드 → 드래그 예약 → 데이터정합성·회의실 예약버그·성능·미구현 → 본문 인라인 이미지). **전부 tsc 0 + npm test 45/45 + Playwright 렌더/클릭/드래그/주입 검증.** 커밋 9개(b730a51~dfa0958). 정본 = `E:\intra\docs\FIDELITY-GAPS.md`·`HANDOFF.md §0`.

### 전이 가능한 교훈 (★다른 프로젝트에도 — 결정·계기·트레이드오프)
1. **확인/삭제(destructive)는 인터랙션 형태도 시안 정본.** 배너·즉시삭제·disabled 로 뭉갠 걸 시안 모달로 복원. **화면마다 모달 스타일이 다름**(dept=중앙 `.confirm`, emp/room/car=`.modal` aside, 게시판=`.notice-confirm`) → 제네릭 하나로 뭉뚱그리지 말고 화면별 줄단위 대조. *행별 'blocked' 판정은 서버가 실제 차단하는 FK 집합과 일치시켜라*(emp 는 reservation·correction·post·comment·comment_like·post_answer 6개 RESTRICT 합산 — 한둘만 세면 모달이 del 띄웠는데 서버가 막는 불일치).
2. **토스트 URL정리: `router.replace` ≠ `window.history.replaceState`.** 성공 쿼리키(?saved/?deleted)를 지우려 `router.replace` 쓰면 **서버 컴포넌트 재렌더로 prop 이 사라져 토스트가 깜빡이고 즉시 사라짐**(실증). → `window.history.replaceState`(서버 재렌더 없음)로 URL 만 정리 + 문구를 **로컬 state 로 캡처**(prop 변화에 불변). Next.js App Router 일반 함정.
3. **새 인터랙티브 오버레이는 기존 클릭을 *조용히* 막는다.** 드래그(일간)·클릭(월간) 레이어가 기존 예약 막대(.evt) 클릭을 가로챔 → 기존 요소를 오버레이 위로(`evtStyle` **inline** `zIndex:2`) 또는 셀 핸들러가 `closest("a")` 면 통과. ★**진단법 = `document.elementFromPoint(x,y)`** 로 그 픽셀 최상위 요소 확인. ★**CSS z-index 규칙(`.cal-day .evt{}`)이 dev HMR 에서 안 먹어** inline/JS 로 박아야 했다(스타일이 안 먹으면 HMR 의심 + inline 으로 확정).
4. **폼 기본 선택은 'busy' 자원을 피하라.** 예약 폼이 *첫 자원*을 기본 선택하는데 시드가 그 자원을 *기본 시간(14:00)* 에 예약 → 열자마자 제출 비활성("이 방은 예약이 안 됨"으로 보임). → **기본 시간대에 빈 자원을 기본 선택**. *데모 데이터 vs 폼 기본값 충돌 = 멀쩡한 기능이 깨져 보인다*(데이터 감사선 "정합"이어도 UX 버그). 단, 기존 e2e 가 '기본=특정자원'에 의존하면(차량) 그쪽은 두고 테스트 보존.
5. **리치 본문(인라인 이미지)=HTML 저장 → 저장형 XSS 표면.** 평문→HTML 전환 시 **반드시**: ① 검증된 sanitizer(`sanitize-html`) 화이트리스트(손수 금지) ② 이미지 `sharp` 재인코딩(raster→webp, EXIF/메타·스크립트 제거 — 위장 파일은 디코딩 실패로 거부됨) ③ `<img src>` 를 **내부 엔드포인트만** 허용(외부/data/js 제거) ④ **저장·렌더 양쪽** sanitize(방어 심화) ⑤ **주입 테스트**(script/onerror/외부 img)로 검증. 익명 본문은 게이트되지만 이미지 URL 은 추측 가능 → 인라인 이미지 **익명 제외**.
6. **의존성 없는 새 테이블은 DROP SCHEMA 없이 적용.** 마이그가 FK/의존 없는 신규 테이블만 추가하면 그 SQL 만 직접 실행(멱등) → dev 커넥션 유지(DROP SCHEMA 재시드·재시작 회피). DROP SCHEMA 는 *기존 테이블에 컬럼 추가*(reset.mjs 가 truncate-only 라 못 잡음) 같은 변경에만. **새 테이블은 reset.mjs TRUNCATE 목록에 추가**(리셋 시 정리).
7. **"느림" 진단: dev 컴파일이 큰 몫 + 매 네비 중복 쿼리.** next dev 는 라우트 첫 방문에 컴파일 → 체감 느림의 큰 부분(prod 빌드면 빠름 — 먼저 이걸 사용자에게 알릴 것). 진짜 비용은 **레이아웃+페이지가 둘 다 `requireUser`** 호출(매 네비 2× 세션조회) → `getCurrentUser` 를 React `cache()` 로 디듀프(요청당 1회), 레이아웃 쿼리 `Promise.all` 병렬. (auth 캐시는 요청 스코프라 안전.)
8. **테스트 fixture 가 틀리면 멀쩡한 기능이 '버그'로 보인다.** 손상 PNG 업로드 → 415(서버가 *정상적으로* 거부)인데 "기능 버그"로 오인 → 디버깅 낭비. → **유효 fixture(sharp 생성)로 재검증**. *거부가 올바른 동작인지 fixture 문제인지부터 구분*(sharp 가 위장/손상 이미지를 거부하는 건 보안 기능).
9. **멀티갈래 요청 = 병렬 진단 + 직접 수정 혼합.** 사용자가 데이터정합성·성능·미구현을 한 번에 물음 → Explore 에이전트 3종 병렬(결론만 회수) + 구체 버그(회의실)는 직접 재현·수정. 에이전트는 "데이터 정합" 했지만 *기본값 충돌* UX 버그는 직접 프로브로만 잡힘(에이전트 결론 + 직접 검증 병행).

### 재사용 자산 (추가)
- `AdminToast`(성공 토스트, history.replaceState 패턴) · `DayDragLayer`(일간 드래그-예약 오버레이) · `MonthCell`(월간 클릭-예약) · `reserve-prefill.ts`(URL→폼 initial) · `sanitize-body.ts`(본문 HTML 정제) · `board-image.ts`(인라인 이미지 sharp 재인코딩 저장).
- 검증 스크립트: `scripts/verify-{del-modals,board-del,car-admin,drag,inline-image}.mjs` + e2e `tests/{drag-reserve,month-reserve,inline-image}.test.mjs`.

## ★2026-06-22 (배포 LIVE 세션) — 사내 k8s 배포 (전이 교훈)
intra 를 https://intranet.bns.co.kr 로 실배포(사내 k8s bnspace, agora/llm-wiki 패턴). **배포 중 같은 부류로 4번 시행착오 + port-forward 안내 2번 거꾸로** → 사용자 "배울 거 배워 다음엔 한 번에 하자 했는데 또". 정본 = `E:\intra\docs\DEPLOY.md`·`HANDOFF.md §🚀`. 승격 패턴 = [patterns/bns-nextjs-deploy-starter.md](../patterns/bns-nextjs-deploy-starter.md).

### 전이 가능한 교훈 (★결정·계기·트레이드오프)
1. **standalone 이미지 함정은 전부 "dev 통과 / 프로덕션 이미지에서만 터짐" → 배포 전 *로컬 이미지 스모크*가 정답.** 4개(① `npm ci` 크로스플랫폼 lock→`install` ② `@/db` import-time throw(DATABASE_URL)→placeholder lazy ③ `sharp` top-level import→지연 import+`serverExternalPackages` ④ 번들 밖 `migrate.mjs` 의 `dotenv` 정적 import→동적+try/catch)가 *전부* `npm run dev`·`npm run build` 로 안 잡히고 **실제 `docker build`+`run` 만 잡는다**. → `scripts/preflight-deploy.sh`(이미지 빌드→throwaway DB→엔트리포인트 migrate→/api/health 200) 배포 전 1회. 정본 [[standalone-image-preflight-smoke-test]]. *트레이드오프: 로컬 Docker 필요(없으면 최소한 CI 실패를 한 번에 다 보게 묶어 매번 1개씩 발견을 피하라).*
2. **capture≠apply, 또(rail 6회차 재발).** 포트·시크릿·엔트리포인트 패턴이 [[bns-cluster-deploy-notes]] 산문에 있었으나 **이 세션(작업디렉터리=second-brain)에 자동로드 안 돼 잊었고**, 사용자가 "agora/llm-wiki 어떻게 했는지 봐라" 떠밀어서야 맞췄다. **산문 교훈은 예방을 못 한다** → 함정은 *복사용 템플릿 + 실행하는 체크(preflight)* 로 굳혀야 다음이 한 번에. ★*다른 프로젝트 배포 시작 시 그 프로젝트 정본(llm-wiki/agora `docs`)을 먼저 Read* — 메모리 산문 신뢰 말고 실파일 대조.
3. **사내 k8s Node앱 인프라 패턴**(처음부터 이대로): 인클러스터 DB 포트 프로젝트마다 구분(agora5432·llm-wiki5532·intra5632) · **시크릿=서버 `k create secret` 직접**(CI변수 아님=동료 비노출; 트레이드오프=서버 1회 타이핑 vs CI변수 Maintainer 열람 vs SealedSecret) · **스키마=이미지 *엔트리포인트* 가 파드 기동마다**(CI SA 가 Job 권한 없음→별도 Job 금지, 다중 replica advisory lock) · CI release=`set image` 만, 최초 리소스=운영자 `k apply` 또는 `ci-rbac.yaml` 1회. 정본 [[bns-cluster-deploy-notes]] §6~10.
4. **DBMS port-forward 는 *서버 tmux* 로 1회 = 사용자 로컬 재부팅과 무관**(Termius 닫아도 서버에서 계속 돔; 재실행은 *서버 재부팅/파드 재시작* 때만). ★llm-wiki 문서에 박혀 있었는데 "재부팅하면 죽으니 재실행"으로 **두 번 거꾸로** 안내 → 사용자 지적(capture≠apply 의 또 다른 실증).
5. **prod 시드 ≠ dev 데모 시드.** intra `SEED=1` 가 dev 데모(홍길동·테스트 차량/예약)를 운영 DB 에 넣고, 비번세팅(`setpw.ts`)은 *dev 전용*이라 시드 계정이 **로그인 불가**(비번 해시 없음)였다. → prod 부트스트랩(관리자 1명·비번 env/서버 세팅·데모 0)을 dev 시드와 분리. *언제 같게: 파일럿이면 데모 유지도 선택(이번 사용자 선택). 실서비스 전환 시 분리.*

### 메타 (레일 되먹임)
- 이번 재발(배포마다 N번)의 근본 = ① 산문 교훈은 자동로드·적용이 안 됨 ② 배포 전 *실행 가능한 게이트*(이미지 스모크) 부재. → 승격 [[bns-nextjs-deploy-starter]](복사용 스타터) + [[standalone-image-preflight-smoke-test]](실행 체크). false-done 후보: **"배포=CI 초록"인데 실제 CrashLoop**(이미지 런타임 미검증) → `rails/false-done-checklist.md` 에 "standalone 이미지 미실행 done 금지(이미지 build+run+health 후에만)" 추가.

### 재사용 자산 (배포)
- `scripts/preflight-deploy.sh`(배포 전 이미지 스모크) · `docker-entrypoint.sh`(migrate→server) · `db/migrate.mjs`(forward-only·advisory lock·dotenv 동적) · `k8s/{app,postgres,configmap,secret.example,ci-rbac}.yaml` · `.gitlab-ci.yml` · `docs/DEPLOY.md`. 다음 사내 앱 = 이걸 복사([[bns-nextjs-deploy-starter]]).

---

## ★2026-06-22 (이어받기 세션) — 디자인 change2(빈·예외 상태)·change3(모바일 반응형)
사용자가 배포 후 "조금 수정된 디자인"(change2)·"모바일 포함"(change3)을 연달아 줌. **시작 시 양쪽 교훈 전수 로드**(요약만 훑지 말고 — 사용자가 "또 반복" 우려) + **소스-diff 스캔**으로 델타 전수 추출. **전부 tsc 0 · npm test 46/46 · Playwright 렌더(데스크톱+모바일390px) 관찰.** 미커밋.

### 전이 가능한 교훈 (★결정·계기·트레이드오프)
1. **★빠른 스캔 ≠ 대충 — *방법*이 다르면 빠른 게 정답.** 사용자가 "왜 이리 빨라, 대충 한 거 아냐?"라고 의심(과거 스샷-눈대조 트라우마). 답 = `diff`로 41화면 전수 비교가 빠른 건 **사용자가 시킨 소스-diff 방법** 때문(느린 건 틀린 방법이었음). 신뢰 회복 = *주장*이 아니라 **전수 diff를 까서 증명**(형제 추측 금지 — 캘린더 6개 "같겠지" 대신 6개 다 깠더니 맞았지만 *확인*했다는 게 핵심). [[compare-design-source-not-screenshots]].
2. **★시스템 정의 화면 먼저(프로토콜 #0).** change2/3 둘 다 *가로지르는 시스템*(`.empty` 공통 컴포넌트·반응형 미디어쿼리)을 정의하는 신규 spec 화면(`spec-empty-states`·`spec-responsive`)이 핵심. 화면별 발견 전에 이걸 정독 → 공유 컴포넌트 1개 만들고 형제 재사용([[spec-screen-build-efficiency]]). 키트=`<EmptyState>`(5변형)·`bns-responsive.css`.
3. **★★인라인 스타일이 미디어쿼리를 이긴다(반응형 침묵 실패).** 풀페이지 모달(`.scrim:has(>.modal)`)이 폰에서 안 먹음 — Modal.tsx 가 `style={{padding,width,maxWidth…}}` **인라인**을 박아 스타일시트 미디어쿼리가 *조용히* 무력화(인라인 > 시트). 진단=실측 폭 390-56=334(scrim 패딩 잔존). → **모바일 전용 규칙에 `!important`로 인라인 덮음**(또는 인라인→클래스 이관). *컴포넌트가 인라인 스타일이면 반응형 CSS가 안 먹는다고 먼저 의심* — HMR-CSS-안먹음([[interaction-loading-ux-completeness]] 친척)과 한 부류. 정본 [[inline-style-beats-media-query]].
4. **★프레임워크 버전 API는 *설치된 docs*로 확인(기억 금지).** Next16 `error.tsx`의 retry prop = `reset`이 *아니라* `unstable_retry`(v16.2.0). 기억대로 `reset` 썼으면 "다시 시도" 버튼이 죽음. AGENTS.md("This is NOT the Next.js you know — read node_modules/next/dist/docs")대로 **`node_modules/.../error.md` 읽고** 잡음. [[consult-prior-art-first]] §4(grep 말고 실파일).
5. **반응형 = CSS(레이아웃) + 소수 동작만 클라(JS).** 시안이 `orbit.css(@media) + responsive.js(드로어/리다이렉트/솔로picker)`로 분리 → **그 분리를 그대로**: 레이아웃·보임숨김·풀페이지는 미디어쿼리, JS 필수 동작(클래스토글·뷰포트판정이동·DOM주입)만 React 클라 컴포넌트. *Next 앱에 raw `<script>` 주입은 hydration/SPA네비에서 취약 → responsive.js를 React로 포팅*(AppShell 드로어·`MobileViewRedirect`·`CalendarSoloPicker`). "작은 화면을 React로 새로 짓는" 게 아니라 같은 페이지+미디어쿼리.
6. **권한없음 = 화면 vs redirect(시안 정본).** 기존 admin layout 은 비관리자를 조용히 `redirect("/")` 했는데 시안(`.is-denied`)은 "접근 권한이 없습니다 + 홈으로" *화면 표시*를 원함 → requireAdmin→requireUser+denied 화면. *조용한 redirect도 "시안과 다른 인터랙션 형태"라 갭*(B2 모달=배너 갭과 같은 부류).
7. **배너→토스트는 URL키 기반 e2e면 안전.** 성공 배너를 `.toast`로 바꿔도 e2e가 *배너 텍스트*가 아니라 *`?saved=1` URL*을 단언하면 안 깨짐(확인 후 진행). 공유 토스트는 `AdminToast`(SUCCESS_KEYS 확장)로 예약/반납/취소/수정/종료/익명까지 재사용.

### 신규 기능 요구(텍스트 전달) — 다일·반복 예약
8. **"기능이 없다"는 사용자 말 = 먼저 감사(있는데 안 보일 수 있다).** 사용자가 "회의실도 from/to 있었으면"이라 했지만 **이미 완전 구현·동작**(폼 From/To+백엔드+종일밴드)이었다 — 못 본 이유 = 주간뷰가 *방별 탭*이라 다른 방 탭을 봄. → 추측("없구나, 만들자") 전 **실제로 해보고 관찰**([[audit-inherited-work-dont-assume]]·[[done-means-observed-working]]). 발견이면 만들 일이 아니라 *발견 가능성(discoverability)* 문제일 수 있다.
9. **★캘린더-카운트 검증은 TZ 일경계로 flaky → DB로 확정.** 반복/시리즈취소를 `?day=` 막대 수로 세니 UTC날짜문자열↔KST일경계 off-by-one 으로 before/after 가 어긋남. → **DB 직접 쿼리**(`SELECT count(*) WHERE title=...`)로 "0행 남음" 확정(done=관찰의 *정확한* 관찰면). 시간축 얽힌 단언은 화면 카운트 말고 데이터로.
10. **반복 예약 패턴(재사용).** 빈도(매일/매주/매월)+종료일 → **회차를 개별 row 로 펼쳐 생성**(가상 확장 아님 — 각 회차가 일반 예약이라 캘린더·충돌·개별취소 공짜) + `series_id` 로 묶음. **충돌은 회차별 DB EXCLUDE(23P01) catch→건너뜀**(insertSeries). 시리즈취소=`scope=series` 로 seriesId 일괄삭제. 월말 없는 일자(31일)는 건너뜀. 단일일 시간예약만(종일/멀티데이·수정모드 배타). `crypto.randomUUID()`(앱코드는 OK — 워크플로 스크립트만 random 금지).

### 재사용 자산 (change2/3 + 다일·반복)
- `lib/recurrence.ts`(회차생성·insertSeries 충돌건너뜀) · 마이그 0016 reservation.series_id · 반복 폼섹션(차량·회의실 ReserveForm) · 상세 "반복 전체 취소" · `scripts/verify-{recurrence,series-cancel,meeting-multiday}.mjs`.

### 재사용 자산 (change2/3)
- `<EmptyState>`(5변형 빈·예외 상태, 시안 `.empty`) · `(main)/error.tsx`(오류 안전망, Next16 unstable_retry) · `MobileViewRedirect`(폰 주월→일간) · `CalendarSoloPicker`(폰 일간 단일대상, responsive.js setupSolo 포팅) · AppShell 드로어 · `bns-responsive.css`(반응형 정본) · `scripts/verify-{empty-states,responsive}.mjs`(데스크톱 빈상태·모바일390px 드로어/모달/리다이렉트/솔로 검증).

## ★2026-06-22 (라이브 검수 라운드) — 사용자가 브라우저로 직접 보며 잡은 버그들 (전이 교훈)
사용자가 띄운 헤드풀 모바일 브라우저(S24 360px)로 *직접 클릭*하며 충실도·동작 버그를 연달아 제보. 코드-리딩 감사(에이전트)는 "동작함"이라 했는데 사용자는 "안 됨"을 봄 — [[visual-compare-not-code-reading]] 의 생생한 재실증(코드 존재 ≠ 실제 동작). 전부 tsc0 + npm test 46/46 + Playwright/스샷 관찰로 수정.

### 전이 가능한 교훈 (★결정·계기·트레이드오프)
1. **★★반복되는 in-place 서버액션은 `redirect`+토스트가 아니라 `revalidatePath`.** 관리자 토글(활성/노출)이 *첫 클릭만* 되고 이후엔 DB는 바뀌나 화면이 stale("켜졌다 다시 꺼짐"). 근본원인 = 성공 토스트의 `window.history.replaceState`(URL 정리용)가 **App Router 를 desync** → 같은 페이지로의 다음 server-action redirect 가 서버 재렌더를 안 함. → 토글류는 redirect/토스트 빼고 **`revalidatePath`로 제자리 재렌더**(토글은 시각상태가 곧 피드백, 토스트 불필요). *one-shot(저장/삭제 후 이동)엔 redirect+토스트 OK, 같은 화면 반복 액션엔 revalidatePath.* 단일클릭 테스트론 안 잡힘 → **연속 N회 테스트로 잡음.** 정본 [[revalidate-not-redirect-for-repeated-actions]].
2. **★페이지별 import CSS가 globals @import 를 *순서로* 이긴다(반응형 침묵 실패 2).** 모바일 reflow(`.fb-head{display:none}` 등)가 안 먹음 — `bns-board/admin.css` 는 *페이지 컴포넌트에서 import* 라 globals 의 `bns-responsive.css` 보다 **나중 로드**, 동일 특이도(0,1,0)면 나중이 이김. 미디어쿼리는 특이도 안 올림. → 모바일 reflow 선언에 **`!important`**(모바일 전용이라 안전) 또는 특이도 상향. [[inline-style-beats-media-query]] 의 순서판 친척. *CSS가 안 먹으면: 인라인>시안 / HMR / 셀렉터오타 / **로드순서** 4종 의심.*
3. **★틀린 셀렉터로 reflow = 조용히 무효.** mypage 1열 reflow 를 `.fgrid` 로 했는데 구현은 `.mp-fgrid`/`.fcell` → 아무 효과 없음. *시안 클래스명과 구현 클래스명이 다를 수 있다 — reflow 대상은 구현 DOM 의 실제 클래스로 grep 확인.*
4. **Tailwind preflight 가 `ul/ol` list-style 을 전역 리셋.** 에디터 '목록'(execCommand insertUnorderedList)은 동작하나 **불릿이 안 보임**(에디터·읽기뷰 둘 다) — 시안 정적HTML은 브라우저 기본 불릿이라 보였던 것. → `.editor/.post-body ul{list-style:disc}` 명시 복원. *Tailwind 쓰는 프로젝트의 리치텍스트/prose 는 list-style 명시 필수.*
5. **하드코딩된 `.on`(선택표시) = 죽은 인터랙션.** 게시판 유형(기명/익명) 라디오 카드가 서버렌더 시 기명에 `.on` 고정 → 클릭해도 시각 안 바뀜("안 눌린다"). 라디오는 숨겨져 *값은* 바뀌나 사용자는 모름. → 클라이언트 state 로 `.on`+체크마크 갱신(`BoardTypeSelect`). *선택 UI 의 시각상태는 클라 state 로 — 서버렌더 고정값이면 인터랙션 죽음.*
6. **월간(month) 이벤트 버킷은 *덮는 모든 날*에.** 다일/종일 예약을 `byDay[startDay]` 한 곳에만 넣어 월간에 시작일만 표시(드래그 3일 예약이 1일만 보여 "안 된 것처럼"). → start~end(배타 -1ms) 모든 KST 날에 add. 차량·회의실 월간 동일. *다일 표시는 시작일 버킷이 아니라 span.*
7. **"기능 없다"는 제보 = 먼저 *해보고 관찰*.** 회의실 멀티데이·월간드래그는 *이미 동작*(예약 생성됨)이고 **표시만** 누락이었다. 사용자 제보를 "미구현"으로 단정 말고 실제 경로를 밟아 *어디서* 끊기는지(생성? 표시? 검증?) 분리. 모바일에서 월간이 일간으로 리다이렉트되는 등 *맥락*도 원인일 수 있음.

### 재사용 자산 (라이브 검수)
- `BoardTypeSelect`(클라 라디오카드) · 토글 `revalidatePath` 패턴 · `bns-responsive.css` reflow `!important` · 에디터/본문 list-style · 월간 byDay span 로직 · `scripts/verify-{sidebar-toggle,admin-fixes2,recurrence,series-cancel,meeting-multiday}.mjs`.

## ★2026-06-22 (라이브 검수 2라운드) — 캘린더 span·주간드래그·모바일 드로어 스크롤
사용자 브라우저 직접 검수 계속. 추가 전이 교훈:
1. **월간 다일 예약 = 주 행 절대배치 *연속막대*(span), per-day 박스 아님.** 시안 `.span-ev`(left=startCol/7, width=span/7 + cont/contr 주경계 직각). 구현: 단일일=셀 버킷, 다일=주별 컬럼범위+레인(가로겹침 greedy)+spacer(단일일 이벤트 아래로 밀기). 1차에 "모든 날 셀에 넣기"로 고쳤다가(분리 박스) 사용자가 "이어져야" 지적 → span 으로 재구현. 차량·회의실 공통.
2. **모바일 드로어 스크롤 = 사이드바 `overflow-y:auto` + 본문 스크롤 락.** 드로어 열고 스크롤하면 *본문*이 내려갔다 → ① `.app>.sidebar{overflow-y:auto; overscroll-behavior:contain}` ② `body:has(.app.nav-open){overflow:hidden}`. 오프캔버스 드로어는 이 둘 없으면 "사이드바 대신 뒤가 스크롤".
3. **주간 드래그 = 열이 *날짜*(일간은 열=자원).** DayDragLayer 재사용 불가(열 의미 다름) → `WeekDragLayer`(dates[7]+고정 assetId). 기존 막대(.evt)는 `zIndex:2`(드래그 레이어 z:1 위)라야 클릭 유지. *시안 week 는 `.drag-hint`(장식, pointer-events:none)만 있고 실제 드래그 미구현 — 힌트가 약속한 동작을 우리가 채움.*
4. **하드코딩 점검: 실데이터 vs 템플릿 프리뷰 구분.** "사내메일이 하드코딩 같다"=실은 `editEmp.email`(실데이터, disabled라 그래 보임). 진짜 하드코딩은 메일 *미리보기* 페이지(템플릿이라 별개). *"하드코딩 같다"는 비활성/프리뷰 착시일 수 있음 — grep 으로 확인.*

## ★2026-06-22 — 익명 콘텐츠 at-rest 암호화 Phase 1(본문+답변)
사용자 "익명 글/비밀번호가 평문 아니냐, 암호화 설계해라". **조사로 추정 정정**(거짓작업 방지): 사용자 비번·익명 열람비번은 *이미 scrypt 해시*(평문 아님, 해시가 정석). 진짜 갭 = **익명 글 본문이 평문**인데 시안 배너가 "본문은 암호화되어 저장" 약속. → 서버키 AES-256-GCM at-rest 암호화로 구현. 정본 설계·결정 = [[field-encryption-server-key-not-e2e]].
- **불변식이 키 방식을 강제**: 임원 무비번 열람(REQ-BOARD-001) → 비번파생키·E2E 불가 → 서버 보관키. 비번 게이트는 접근통제로 그대로.
- 좌표 좁음: 쓰기=`createAnonPost`/`createAnonAnswer`/`editAnonAnswer`, 읽기=`getAnonPostDetail` 유일(목록은 본문 미select, 검색 대상도 아님 → 안 깨짐). grep 으로 *전수* 확인 후 배선.
- 신규 `src/lib/crypto-field.ts`(encrypt/decrypt/isEncrypted, 봉투 `enc:v1:`, 평문 공존) + 멱등 백필 `db/encrypt-anon-bodies.ts`(`npm run db:encrypt-anon`) + 검증 `scripts/verify-anon-encrypt.ts`. 키=`BODY_ENC_KEY`(.env dev + k8s Secret, **영구성=최대위험** secret.example/DEPLOY 명시).
- **DB-직접-단언 테스트 1건(interactions 익명답변)을 강화**: 평문 매칭→`enc:` 단언 + 화면 평문 렌더 단언(at-rest+복호화 둘 다). **tsc 0 · npm test 46/46 · 백필 멱등 확인.**
- **운영 함정 재확인**: `.env`는 기동 시 로드(HMR 아님) → 키 추가 후 **dev 재시작** 필요(안 하면 running 서버가 키 없어 throw). [[cache-and-config-before-code]].
- 작업: `feature/anon-content-encryption` 브랜치(라이브 main 보호), **미커밋·미푸시**.

### Phase 2 (익명 첨부 + 인라인 이미지) — 완료
- **첨부(attachment)**: post→board_id 있어 *익명만* 암호화(`saveAttachments(...,encrypt=true)` from createAnonPost, named 평문 유지). 다운로드는 `getAttachmentForDownload`에서 복호화. `size_bytes`=평문 크기 유지.
- **인라인 이미지(board_image)**: 글 연결이 없음(토큰만). 처음엔 *전부 암호화*로 했다가 사용자가 "익명만" 요청 → **익명만으로 스코프 변경**: 신규=익명 작성화면(AnonWriteForm)·답변(AnswerComposer)이 업로드 시 `fd.append("anon","1")` → 라우트가 그때만 `saveBoardImage(file,true)`. 기존(백필)=익명 본문/답변 HTML의 `/api/board/image/<token>` 역추적해 그 이미지만. `getBoardImageByToken` 은 매직 감지 복호화(기명 평문 통과). 회귀가드=anon-inline-image(DB BNSENC01 단언)·inline-image(DB 평문 단언) — *렌더 통과는 암호화를 증명 못 함*(복호화가 평문도 통과)이라 DB 매직을 직접 단언.
- 바이너리 봉투(매직 `BNSENC01`|iv|tag|ct) `crypto-field.ts`에 추가(encryptBytes/decryptBytes/isEncryptedBytes), 복호화는 매직 감지(평문/named/레거시 공존). 백필 스크립트를 `db/encrypt-anon-content.ts`(본문+답변+익명첨부+board_image 전부)로 확장·개명(`npm run db:encrypt-anon`). 검증 `scripts/verify-anon-encrypt.ts` 확장.
- **기존 테스트가 그대로 회귀 검증**(수정 0): named 첨부=DB data 직접검사(평문이라 통과), 익명 첨부=다운로드(복호화) bytes 검사, 인라인이미지=렌더 img 로드. tsc 0. (전이교훈 [[field-encryption-server-key-not-e2e]] Phase2 절: 분기키 없으면 전부 암호화 / size는 평문크기 / 수동 node --test는 --test-concurrency=1 필수.)

### 강화 라운드(사용자: "당연히 해야지" + "다른 기능도 구멍 많을 듯")
- **복호화 결정을 접두어/매직 sniff → 행별 플래그 컬럼(0017 `*_enc`)으로.** 평문이 우연히 `enc:v1:`/`BNSENC01`로 시작하는 모호함 제거. 읽기=`flag?decrypt:raw`. 마커는 유지(버전/구조). dev엔 0017 직접 `docker exec psql`로 멱등 적용(reset.mjs는 TRUNCATE라 컬럼 안 만듦). 정본 [[field-encryption-server-key-not-e2e]].
- **종합 테스트 `npm run test:crypto`(31케이스)**: 변조탐지(GCM)·잘못된키·fail-closed·키길이·라운드트립(빈/한글/HTML/100KB/바이너리/1MB)·평문공존·IV무작위·**실데이터 백필**(시드에 없어 미검증이던 ③첨부④이미지)·멱등. 정상경로 e2e가 못 잡던 보안속성·백필경로를 메움.
- **문서**: `docs/encryption.md`(위협모델·봉투·플래그·키관리·좌표·백필·검증·한계).
- **플레이키 주의**: 풀스위트에서 예약 VAL-001/RES-006 1건 간헐 실패 → 타깃 재실행 15/15 통과(암호화 무관·콜드스타트/날짜경계 환경 flake). *풀스위트 단발 실패는 타깃 재실행으로 flaky/실버그 판별*([[fast-feedback-not-timeouts]]).
### 최종 상태 + 커버리지 감사
- **커밋 4개**(`feature/anon-content-encryption`, 미푸시): 57b372a(본문·답변·첨부·이미지)·4562fc8(인라인 익명한정)·a9d27a9(test:crypto)·bc983d0(플래그컬럼+docs). tsc0·npm test 46/46·test:crypto 31/31. 메인 세션으로 푸시+검증+보강 핸드오프 작성.
- **커버리지 감사 완료**(읽기전용 3에이전트 병렬): 정본 `E:\intra\docs\test-gaps.md`. **핵심 발견 = 가드 코드는 있는데 '차단돼야 하는 사람을 막는지' 음성 테스트가 거의 없음**(정상경로만). P0 후보: AUTH-1 임시비번 만료 미강제(🐞가능)·INJ-1 actions 비정수 ID 가드 누락(🐞가능, data.ts엔 있음)·PERM 음성 e2e(/admin·createAnonAnswer·예약 소유권)·퇴사 active=false. *에이전트 결론도 오탐 있음(익명첨부 admin차단은 이미 테스트됨) → 실행 확인 후 done.*
- **★전이 교훈 — 두 Claude 세션이 같은 repo/DB/dev 를 쓰면 격리 아님.** 메인 세션이 intra 테스트 중일 때 내가 `db:reset`(공유 DB 비움)·`npm test` 돌리면 *서로 깸*. "영향 없다"는 *그 순간 내가 아무것도 안 돌릴 때*만 참 — 커밋·코드읽기·문서쓰기는 안전, *테스트 실행·db:reset·src 편집*은 충돌. 동시 작업 시 격리 DB(다른 포트)거나 한쪽이 idle. 정본 [[shared-repo-db-sessions-not-isolated]].

## ★2026-06-23 ③ (익명암호화 배포 후 라이브 사용성 라운드) — ★★sharp 6번 시행착오: 환경 전용 버그 진단 규율
익명암호화 LIVE 배포(main ff-merge+push, BODY_ENC_KEY 주입=사용자) 뒤, 사용자가 LIVE 를 직접 쓰며 사용성 문제 연달아 제보. UX 5건 + 테스트 4개 + **sharp 이미지 업로드 수정(6번 시행착오)**. 전부 main 배포·검증. 인계정본 = `E:\intra\HANDOFF.md` 이어가기 ③ · 배포정본 = `intra/docs/DEPLOY.md` "sharp 네이티브 모듈" 섹션.

### ★★최대 교훈 — "로컬 docker 빌드 OK · CI/런타임만 실패" = 환경 전용 버그 → 실환경 계측 먼저(추측 금지)
LIVE 이미지 업로드가 *전부* decode-fail("이미지를 읽을 수 없습니다"). **6번 추정이 다 빗나간 이유 = 실패가 전부 CI/런타임 환경 전용이라 로컬 docker 빌드엔 재현 안 됨.** 빗나간 추정: ①크기 ②HEIC ③sharp `failOn` ④libvips .so 누락 ⑤Docker 캐시 ⑥lockfile 오염. **진짜 원인(pod 계측으로 확정)**: (a) **CPU=`Common KVM processor`(가상, x86-64-v2 미노출) → sharp 0.33+ @img prebuilt 가 v2 요구해 거부**(sharp.cjs `_isUsingX64V2()==false`→바이너리 버림) + (b) **사내망이 node-gyp Node 헤더(`unofficial-builds.nodejs.org`) 차단 → CI 소스빌드도 불가**.
- **해결 = vendoring**: 로컬 alpine 에서 시스템 libvips 로 소스빌드한 `sharp-linuxmusl-x64.node`(342KB)를 `intra/docker/` 에 커밋 → Dockerfile 이 `npm install`(JS) 후 COPY. **CI 는 복사만 = 빌드·네트워크·v2 전부 무관 → 로컬 검증=CI 결과 보장**(환경차 0). sharp 0.34.3 핀(alpine vips 8.18.2 호환; 0.35.x 는 8.18.3+ 요구).
- **★전이 규율(다음에 같은 데서 안 막히게)**: ① **"로컬 빌드 통과·실서버만 실패"는 환경 전용**(CPU 기능·네트워크·시스템 lib) → 로컬 무한추측·재배포 말고 **실환경 계측 FIRST**(`k exec ... node -e "require('x')"` 로드에러·`k logs|grep` catch 로그·CI 빌드로그). 5번 추측 < pod exec 1번. ② **환경 의존 단계(네이티브 빌드)를 *제거*해 로컬==CI 로** 만들면 로컬 검증이 신뢰됨(vendoring). ③ **침묵 catch 가 진짜 원인 가림** — 디코드 catch 의 `console.warn(err)` 가 진단 열쇠(없었으면 "decode-fail"만 보고 영영 헤맴). ④ **배포 검증에 *기능*(이미지 업로드)을 넣어라** — health+로그인만 보면 잠복(첫 배포부터 안 됐는데 아무도 안 올려봐서 몰랐다). 정본 [[bns-cluster-deploy-notes]]·[[standalone-image-preflight-smoke-test]].

### 가상화 인프라 = x86-64-v2 마스킹 (다음 사내앱도 동일)
bns 사내 k8s KVM 게스트 CPU 가 v2 미노출 → **v2-요구 prebuilt 네이티브 모듈(sharp 0.33+ 등)은 이 인프라에서 못 돈다**. 다음 사내앱이 sharp/이미지/네이티브 모듈 쓰면 **같은 함정** → 처음부터 vendoring 또는 시스템-lib 소스빌드. 패턴 [[bns-nextjs-deploy-starter]] 에 박음.

### 그 밖의 라이브 UX 수정(전이 교훈)
1. **내부이동 `<a href="/...">` = 전체 새로고침** → Next 는 `<Link>`(소프트내비). "팝업 닫으면/탭 바꾸면 새로고침"의 정체(인라인 searchParam 모달·폼취소·탭이 raw `<a>`였음). `/api/*` 다운로드·외부·이메일HTML 은 `<a>` 유지. 한 곳 고치면 형제 전수(grep `<a .*href=`).
2. **느린 서버액션(메일 전체발송)은 `next/server` `after()` 로 응답 뒤 실행** + `useFormStatus`(PendingSubmit). 동기 await 면 "클릭→무반응→한참뒤". 같은화면 반복은 revalidatePath([[revalidate-not-redirect-for-repeated-actions]]).
3. **사용자 업로드 이미지 재인코딩은 `failOn:"none"`** — 멀쩡한 PNG/JPG(스크린샷·앱저장: iCCP·sRGB·CRC)도 `failOn:"error"`면 거부. webp 재인코딩이라 관대 수용 안전, 비-이미지는 디코드 실패로 거부.
4. **테스트 셀렉터가 제품 속성에 강결합되면 변경에 깨짐** — `input[accept="image/jpeg,..."]`(정확문자열)가 HEIC accept 추가로 깨짐 → `accept^="image/jpeg"`. 제품 변경 시 셀렉터도 같이.
5. **prod 엔 dev 픽스처 없다(재확인)** — `setpw.ts`(dev전용)가 박는 비번이 운영 DB 엔 없음 → hong/lee/park/kim·secret99 전부 DBeaver `UPDATE password_hash`(scrypt `salt:hash`, `node -e` 생성) 수동 세팅.

### 추가 음성 테스트(견고화) — 전체 suite 57/57
DB-1(부서/회의실명 UNIQUE 23505)·DB-2(부서 삭제가드 FK 23503; emp/veh 은 CORE-002 커버)·LIKE-1(post_like·comment_like UNIQUE 23505) → `db-invariants` 9/9. PERM-3(본인 비활성 토글=disabled+폼부재; 서버 `error=self` 는 심층방어) → `security` 8/8. 잔여 ATT-1·MAIL-1·모바일/PC 전수 재감사 = `intra/docs/test-gaps.md`.

### ★★★메타 성찰 — 시안 갭은 "기본 아닌 상태"에 숨는다 (2026-06-24 라이브 검수 2~3차)
사용자가 시안과 다른 점을 *계속* 직접 찾아줬다: 사원등록 **사번 required**(시안엔 사번 필드 자체가 없음)·로그아웃 문구·**죽은 사이드바 링크**(차량/회의실 전환 무반응)·**일간 3열 고정**(자원 4대 줄바꿈)·**월간 깨짐**(예약 많은 주만 키 큼)·**"+N건 더" 무동작**. 매번 "또 놓쳤네 → 검출기 추가"의 반응적 루프.
- **공통 패턴**: 찾은 갭 *전부* **디폴트 렌더가 아닌 상태**에 숨어 있었다 — 모달 열림(사번 폼)·인터랙션(죽은 링크·드래그·+N더)·데이터 개수(4대)·뷰포트(로그아웃)·잠금(BF-1). 감사를 *화면당 디폴트 1상태*에만 돌려 나머지 상태차원이 통째로 사각. **"감사 돌림(디폴트)=봤다"가 근본 착각.**
- **고침(상태차원 매트릭스)**: 화면 done 전 ①뷰포트 ②모달/오버레이 열림(`?create`/`?edit`/state — 폼 필드·required·문구) ③호버/포커스/인터랙션 ④데이터 개수 0·1·N ⑤상태 플래그(빈/에러/토스트/잠금/종료) ⑥역할 ⑦chrome — *각 칸을 호명·렌더·diff*. 감사 SCREEN 매핑에 상태변형 등록 → harness 가 매트릭스를 돈다. **사용자가 갭을 찾는 사건 = 내 프로세스 실패(상태차원 한 칸 안 봄)** → 0으로 몬다.
- 정본 auto-memory: `fidelity-gaps-hide-in-non-default-states`(통합 메타)·`audit-form-modals-and-required-fields`·`dynamic-layout-matches-data-count`·`dead-controls-distinct-destination`. `/inspect` ③·⑩·⑪ + intra `CLAUDE.md` 충실도 프로토콜에 반영.
- **BF-1 곁가지 교훈**: "테스트 실패=내 회귀"로 단정 말고 *직접 관찰*로 기능 정상 확인 후 원인 분리(5회→잠금 동작은 정상; dev 37h+대량편집 degraded 가 트리거 → 재시작이 근본, 테스트는 rapid클릭 타이밍 레이스 견고화). [[cache-and-config-before-code]]·[[done-means-observed-working]].

### 세션 ⑦ — 토스트 충실도 마무리 + 검사 묶음 확장(정적 텍스트 카탈로그·VRT·CI 게이트) (2026-06-25)
A(토스트, 시안 그대로): 삭제 토스트 이름+"영구"(4 delete 액션이 삭제 전 name 조회→`?deleted=<이름>`)·회사정보 취소(`CompanyCancelButton` reset+`bns:toast`)·**로고 즉시저장→미리보기-후-저장**(`updateCompany`가 `logoAction` new/reset로 적용). 3건 브라우저 관찰검증. LIVE 배포(CI 재시도 1회=npm install ETIMEDOUT 네트워크, 코드 무관).
B(검사 묶음 확장 — 근본 사각 "동적·조건부·속성 텍스트는 렌더-DOM diff를 빠져나감"):
- **정적 텍스트 카탈로그** `text-fidelity.mjs`(toast-fidelity 일반화): placeholder + confirm/empty/error **헤딩** 축. 수확 → 게시판 검색 문구·예시 토씨 수정 + **★다이얼로그 축이 게시판 *무확인 삭제* 구조 갭을 잡음**(차량/회의실/부서/사원엔 확인모달 있는데 게시판만 즉시삭제 → `BoardDeleteButton`+`getBoardPostCounts` 보강). 정적 카탈로그 **경계**: 변수/맵 공급값은 단일행 일반리터럴 보조스캔으로, **JSX 보간 본문은 범위 밖**(렌더-상태로).
- **VRT 동작-후 상태**(`vrt.mjs`): 게시판삭제 모달·취소 토스트. **함정 다 밟음** → 풀페이지(element-clip 배경비침)·환경간 폰트AA(threshold 0.2+실패 백분율>0.5%)·눈검토(전환중/clip 반투명 베이스라인 2번 걸러냄)·동적값 mask. 정본 [[vrt-baseline-discipline]].
- **CI 필수 게이트**: `.gitlab-ci.yml` text-fidelity job(`--ci` 미승인 갭=빌드 차단). design-input 이 gitignore → **커밋 스냅샷**(`scripts/.fidelity/*.json`)으로 비교(순수 node).
- **환경 우선 진단**: 장기가동 dev sharp `decode-fail`(네이티브 노화)로 인라인이미지 e2e timeout=코드회귀 아님, *재시작이 근본*(별도 프로세스 sharp는 정상=노화 확정).
게이트: tsc 0 · npm test **58/58**(fresh dev) · inspect 7단계 전부 통과 · preflight PASS. 미푸시 0(A·B·tooling 전부 푸시·배포). 정본 패턴 [[inspect-battery]](5·6층 추가)·false-done(VRT 베이스라인 진정성·정적카탈로그 거짓안심).
