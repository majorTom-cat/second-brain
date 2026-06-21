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
