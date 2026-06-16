# agora — 지식 (노하우·결정·함정)

> 원본 repo 문서(`E:\agora`, 읽기 전용)와 채팅 이력에서 distill. [tier: judgment]
> ⚠️ 회사 데이터라 **실명·사내 도메인/호스트·자격증명은 일반화**했다(`<사내도메인>` 등). 원본 채팅은 `chats/raw.tar.gpg`(암호화).

## 무엇을 만든 프로젝트인가
레거시 사내 시스템 두 개(Go/React 기반 익명 건의게시판 + Spring 기반 인트라넷)를 하나의 **사내 인트라넷 통합 플랫폼**으로 재구축한 1인 풀스택 프로젝트. 3개 서브시스템(공용 차량 예약 / 공용 회의실 예약 / 메타데이터 기반 통합 게시판)을 공통 GNB 아래 통합했고, 요구사항부터 설계·구현·테스트·실배포·개선 라운드까지 한 사이클을 완주해 `<사내도메인>` 에서 운영 중이다. 모든 요구는 `REQ-{CAT}-{NNN}` ID로 추적된다.

## 기술 스택 / 아키텍처 한눈에
- **앱**: Next.js 16 App Router + React 19 + TypeScript(strict)의 **풀스택 모듈러 모놀리스**. 백엔드는 Route Handlers + Server Actions(별도 서버 없음). RSC + Server Actions 기본, 실시간 뷰만 경량 폴링(`router.refresh()`).
- **UI**: Tailwind CSS v4 + Radix UI(헤드리스). MUI 미채택(런타임 비용·레거시 버전 공존 문제). 768px 단일 브레이크포인트로 테이블↔카드 전환, 44px 터치타깃 토큰화.
- **데이터**: PostgreSQL 16 단일 인스턴스 + **스키마 4개**(identity/vehicle/meeting/board), 스키마별 독립 커넥션 풀 4개. ORM은 **Drizzle**(얇은 SQL-우선) + raw SQL 마이그레이션. 폼/검증은 RHF + Zod(클라·서버 공유). 인증은 bcrypt + 서버 세션(쿠키 토큰은 SHA-256 해시로만 DB 저장).
- **배포**: GitLab CI(dind) → `<harbor레지스트리>` → `<사내k8s>`(rolling). cert-manager TLS, 앱 전용 Postgres 동반 배포.

## 핵심 결정 (왜 그렇게 했나)
- **DB는 PostgreSQL 전용 기능에 베팅**: 시간겹침 원천차단을 `EXCLUDE USING gist (resource WITH =, tstzrange WITH &&)` + 생성컬럼으로 구현. 레거시 MariaDB엔 range/EXCLUDE가 없어 앱 전용 PG를 함께 배포. DB가 직렬화하므로 SELECT-후-INSERT 동시성 레이스가 원천 차단됨. (`E:\agora\docs\08-database-design.md` §6)
- **모놀리스 안에서 장애 격리**: 4스키마 + 독립 풀 + 크로스모듈 import 금지(ESLint `no-restricted-imports`) + 예약 테이블에 예약자명/부서를 **스냅샷 비정규화**(identity 장애가 예약 조회를 막지 않음). (`E:\agora\docs\07-architecture.md` §3)
- **JWT 대신 서버 세션**: 30일 remember-me를 취소 가능해야 해서. JWT는 로그아웃/탈퇴 시 무효화 불가.
- **배포는 GitLab CI→레지스트리→k8s rolling**: 빌드는 CI, 최초 리소스 생성은 사람이 직접 `kubectl apply`(러너 SA는 `set image`만 가능), 이후 `:$SHORT_SHA` 태그로 자동 롤링. 자격증명은 전부 CI Variables / K8s Secret으로 외부화(레거시 평문 하드코딩 재발 방지).
- **graceful shutdown**: SIGTERM 핸들러(`instrumentation.ts`)가 모든 DB 풀을 `sql.end()`로 닫음. Next standalone은 자체 핸들러가 먼저 `exit`하므로 `NEXT_MANUAL_SIG_HANDLE=1` 필수.

## 개선 라운드 — v3.0 → v4.1 (CR-001, 새 핸드오프 반영)
기획팀이 프로토타이핑을 거쳐 **PRD v4.1**(요구사항+화면+디자인 통합본)을 확정해 들어온 두 번째 인테이크 라운드. "**기존 수정 vs 새로 구축**"을 물어 **기존 수정**을 택하고, 운영 `main` 격리(`redesign/v4.1` 브랜치)에서 v3.0 코드에 **델타**를 얹었다. 백엔드·정책·테스트(최종 177 green)는 진척됐다.
- ⚠️ **결말 정정(사용자 직접 진술, 2026-06-16)**: 받은 **새 디자인**을 입히는 단계에서 구현이 자꾸 **기존 v3.0 UI와 비슷하게** 흘러(기존 컴포넌트·레이아웃의 관성) 받은 디자인과 계속 어긋났고, 결국 **인플레이스 리디자인을 접고 `intra` 를 그린필드로 새로 시작**했다(→ second-brain intra). 즉 distill 초안의 "수정이 빠르다가 증명됨"은 **틀렸고**, "기존 수정이 빠르다"는 디폴트가 **전면 리디자인에서는 빗나갔다**가 정확한 결말이다. (`E:\agora\docs\changes\CR-001-prd-v4.1.md` 는 기술 진척만 기록 — 실제 의사결정은 폐기·재시작)

- **수정사항 인테이크 규약**: 기획 원본(docx/html/PPT/PNG/Figma export)은 `resource/changes/` 에 넣고, 엔진이 읽어 추적용 CR 문서(`docs/changes/CR-NNN-*.md`)로 정규화한다. **원본=`resource/`, 정본·추적=`docs/`** (원 요구사항 `resource/*.docx → docs/01` 과 동일 패턴). PPT 목업·Figma 링크는 LLM이 못 보므로 **PDF/슬라이드 PNG로도** 함께 제출. 핸드오프는 보통 4문서 세트(PRD=무엇/왜 · 프로토타입 html=어떻게 보이나 · 수용기준 명세서=완성조건 · 전달노트=커버).
- **REQ-ID 체계 전면 재정의**: 구 `REQ-INT/CAR/MT/BD` → 신 `REQ-CORE/RES/CAR/MEET/VAL/BOARD/UI`. 정본은 신체계, 코드·테스트는 **매핑표(크로스워크)로 점진 이행**(조용한 누락 방지). 매핑 정본은 CR-001 §4. ★`REQ-INT-006`(완전 익명·무로깅)/`REQ-INT-007`(단방향 해시)는 절대 준수 항목이라 신 `REQ-BOARD-001`/`REQ-CORE-001` 안에 **반드시 계승**.
- **주요 정책 변경 4건**: ① **비밀번호 발급 모델 전환** — 관리자 공통 초기비번 발급+강제변경 → **발급 안 함, 본인 메일 1회용 링크로 자가설정**(최초/재설정/임원 공용 화면). `password_hash` **nullable** 모델 + 1회용 토큰 테이블(해시만 저장). 임원 비번은 관리자가 권한만 부여·발급/조회 불가(REQ-CORE-001/002, SMTP 인프라 전제). ② **익명글 본문 봉투암호화** — 평문+표시마스킹 → **AES-256-GCM 암호문만 저장**(`content=NULL`+`content_enc`), 열람권한 확인 후에만 복호화, fail-closed 키, 글단위 5회 실패→5분 잠금(누가 아니라 몇 번 — 익명성 유지), 관리자 열람 불가(REQ-BOARD-001, KMS/HSM or 키 env 폴백). ③ **부서/차량 색의 데이터화** — 색이 디자인 토큰(`cat-*`)이 아니라 **관리자가 운영 중 지정하는 마스터 DATA** 가 됨. 캘린더 색 규칙: 블록 채움=부서색, 자산 헤더 점=차량색, 상태=명도(REQ-CORE-004/CAR-005/UI-001). ④ **회의실 예약 참석인원 필드 제거**(정원=마스터 표시 전용, REQ-MEET-001).
- **함정(이번 라운드 발견)**: "주행거리 보정"을 v3.0이 이미 했다고 가정했으나 grep 확인 결과 **미구현 신규기능** → 단순화가 아니라 신규 화면(보정 모달+이력 audit)으로 재배치. **요구가 "변경"인지 "신규"인지는 코드 grep으로 그라운딩하고 가정하지 말 것.**

## 노하우 / 재사용 패턴
- **무중단 롤링 레시피**: `replicas:2` + `RollingUpdate(maxSurge:1,maxUnavailable:0)` + `minReadySeconds` + `preStop sleep 10`(엔드포인트 드레인) + `terminationGracePeriodSeconds:30` + `readinessProbe /api/health` + `PodDisruptionBudget(minAvailable:1)`. (`E:\agora\docs\14-deployment-runbook.md` §5)
- **probe 분리**: readiness는 DB 핑(`/api/health`), liveness는 `tcpSocket`(DB 비의존) — DB 블립에 전 파드가 동시 재시작되지 않게.
- **다중 replica 첨부 공유**: RWO 블록 스토리지로는 불가 → RWX(공유 파일시스템) PVC로 전환.
- **DB 초기화**: 초기 스키마+시드 SQL을 ConfigMap으로 `/docker-entrypoint-initdb.d`에 마운트(빈 볼륨 최초 1회만 실행).
- **cert-manager TLS**: 공용 와일드카드 인증서 SAN에 호스트가 없으면 재사용 불가 → Ingress 어노테이션(`cluster-issuer`)으로 호스트 전용 인증서 자동 발급(`Ingress→Certificate→Secret` 흐름).
- **운영 DB 점검**: 외부 미노출 + `kubectl port-forward`(+SSH 터널) + tmux `send-keys`로 환경변수 살린 채 상시 터널.
- **standalone 절대 리다이렉트**: `req.url`에 바인딩 호스트(0.0.0.0)가 박히므로 리다이렉트는 `x-forwarded-host`/`host`로 구성.
- **Design-ready 스킨 흡수**(CR-001 §6): 비주얼 변경에 강한 4중 구조 — ① 색 2종 분리(디자인 토큰=`globals.css :root` 단일 출처 ↔ 운영 데이터 색=DB 마스터 필드), ② 컴포넌트는 `var(--token)`만 참조(색·치수 하드코딩 0), ③ `[data-theme="v4"]` 스킨 레이어로 새 디자인을 오버라이드 먼저 입혀 비교 후 `:root` 승격(롤백 안전), ④ "디자인 이미지→토큰명" 빈 매핑시트를 docs에 미리 배치. → 최종 이미지 도착 시 **토큰값 교체 1패스**로 전 화면 일괄 반영, JSX 거의 불변. (= "구조 먼저, 비주얼은 나중에 이미지로" 핸드오프 전제와 정합)
- **무중단 expand/contract 마이그레이션**: 스키마 변경은 **확장 먼저**(`ADD COLUMN IF NOT EXISTS`, 멱등) 적용 → 코드 배포 순. fresh용 `0000_init` 정본과 기존DB용 증분(`0007`)을 **둘 다** 동기화하고, 스크래치 DB로 fresh적용·2회 멱등·구→신 업그레이드 경로를 실DB 검증한 뒤 진행.

## 함정 / 다시는 안 할 것
- **Edge 미들웨어(proxy) 인증 핑퐁**: 쿠키 "존재"만으로 `/login→/` 리다이렉트하면 무효 세션 시 서버 레이아웃과 무한 리다이렉트(`ERR_TOO_MANY_REDIRECTS`). Edge는 쿠키 유무만 보고 `/login`은 항상 통과시킬 것. 최종 판단은 서버의 실제 세션 검증.
- **익명성 누수 경로**: 전 테이블 audit 트리거/ORM 자동 created_by 스탬프/ingress access_log/APM user 귀속이 익명 작성자 신원을 재유입시킴 → 익명 경로를 명시적 예외로. IP 컬럼 자체를 스키마에서 제거(없는 필드는 새지 않는다).
- **빌드 시 DB 의존**: 풀을 첫 쿼리 시점에 lazy 생성해야 `next build`/서버리스에서 import-time 연결 실패가 없음.
- **CSI 미등록 노드**: 특정 노드에서 `FailedMount`/`unbound PVC` → nodeAffinity로 제외(네임스페이스 한정 권한으론 cordon 불가).
- **레거시 안티패턴 계승 금지**: 양방향 비번 암호화, 하드코딩 자격증명, CORS `*`, 클라 페이징.
- **★기존 코드 관성(gravity)이 새 디자인을 옛 UI로 끌어당긴다 — 전면 리디자인을 인플레이스로 하지 말 것**: 새 프로토타입을 받아 "수정이 빠르다"며 기존 v3.0 코드에서 진행했더니, 산출 화면이 **계속 기존 레이아웃과 비슷하게** 나와 받은 디자인과 어긋났다. 원인 = 기존 컴포넌트·레이아웃·내비 골격을 재사용하는 손이 새 디자인보다 **익숙한 옛 패턴을 자동 재생산**. **실제 결말: 회의에 그치지 않고 인플레이스 리디자인을 폐기→`intra` 그린필드 재시작.** ⇒ 규칙: ① **설계 거리부터 판정** — 점진 델타(필드·정책·백엔드)면 인플레이스 수정이 맞고, **전면 비주얼/IA 리디자인이면 그린필드(또는 셸·IA를 새 디자인에서 처음부터)**. "수정이 빠르다"는 디폴트를 리디자인엔 적용 금지. ② 인플레이스를 택했다면 **디자인-퍼스트**(새 디자인 토큰·레이아웃에서 시작, '기존 컴포넌트 맞추기' 반사 금지), 화면별로 **옛 화면이 아니라 받은 디자인과 대조**하고 깊이 들어가기 전에 "이게 새 디자인처럼 보이나?"를 조기 게이트로. 비주얼은 토큰으로 나중에 흡수하더라도 **셸+골격(GNB·레이아웃·정보구조)은 프로토타입에 맞춰 먼저 가시화**해 방향 확인을 받을 것.

## 미해결 / 다음에 이어가면
- **CR-001(v4.1) 잔여**: T9 디자인-레디 스킨(`data-theme` + 토큰 매핑시트) → T10 최종검증(lint/build) → **디자인 이미지 도착 시 토큰 교체 1패스** → `dev→main` 무중단 머지. 캘린더 **그리드 깊이**(일=세로 시간축 비례블록·주=7일×트랙·월=다일 관통 막대)는 일간까지 재작성, 월/주 잔여. 운영 시크릿(`SMTP_*`·암호화 키)은 k8s Secret 외부화 후 배포 필요.
- E2E(Playwright) 정식화(현재 단위+통합 177건), 익명 무로깅의 **운영 레벨**(ingress access_log off) 실적용 검증.
- 구조적 로깅(Request ID·익명경로 deny-list), Drizzle 마이그레이션 추적 테이블·역방향 전략, DB 백업 CronJob, 커넥션 풀 모니터링.
- 매니페스트/시크릿/스키마 변경의 CI 자동화(현재 이미지 교체만 자동 — 좁은 patch Role 필요).

---
출처: `E:\agora\README.md`, `E:\agora\docs\01-requirements.md`, `07-architecture.md`, `08-database-design.md`, `09-ui-design-spec.md`, `10-implementation-status.md`, `12-deployment.md`, `13-improvement-roadmap.md`, `14-deployment-runbook.md`, `16-deploy-guide.md`, `E:\agora\docs\changes\CR-001-prd-v4.1.md`, `E:\agora\docs\changes\README.md`, `E:\agora\docs\legacy-services-brief.md`, `E:\agora\agora\package.json`
민감정보(실명·사내 도메인/호스트·자격증명) 일반화·제거됨. second-brain 배포 프로파일 `intranet` 의 prior art.
