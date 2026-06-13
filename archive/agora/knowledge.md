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

## 노하우 / 재사용 패턴
- **무중단 롤링 레시피**: `replicas:2` + `RollingUpdate(maxSurge:1,maxUnavailable:0)` + `minReadySeconds` + `preStop sleep 10`(엔드포인트 드레인) + `terminationGracePeriodSeconds:30` + `readinessProbe /api/health` + `PodDisruptionBudget(minAvailable:1)`. (`E:\agora\docs\14-deployment-runbook.md` §5)
- **probe 분리**: readiness는 DB 핑(`/api/health`), liveness는 `tcpSocket`(DB 비의존) — DB 블립에 전 파드가 동시 재시작되지 않게.
- **다중 replica 첨부 공유**: RWO 블록 스토리지로는 불가 → RWX(공유 파일시스템) PVC로 전환.
- **DB 초기화**: 초기 스키마+시드 SQL을 ConfigMap으로 `/docker-entrypoint-initdb.d`에 마운트(빈 볼륨 최초 1회만 실행).
- **cert-manager TLS**: 공용 와일드카드 인증서 SAN에 호스트가 없으면 재사용 불가 → Ingress 어노테이션(`cluster-issuer`)으로 호스트 전용 인증서 자동 발급(`Ingress→Certificate→Secret` 흐름).
- **운영 DB 점검**: 외부 미노출 + `kubectl port-forward`(+SSH 터널) + tmux `send-keys`로 환경변수 살린 채 상시 터널.
- **standalone 절대 리다이렉트**: `req.url`에 바인딩 호스트(0.0.0.0)가 박히므로 리다이렉트는 `x-forwarded-host`/`host`로 구성.

## 함정 / 다시는 안 할 것
- **Edge 미들웨어(proxy) 인증 핑퐁**: 쿠키 "존재"만으로 `/login→/` 리다이렉트하면 무효 세션 시 서버 레이아웃과 무한 리다이렉트(`ERR_TOO_MANY_REDIRECTS`). Edge는 쿠키 유무만 보고 `/login`은 항상 통과시킬 것. 최종 판단은 서버의 실제 세션 검증.
- **익명성 누수 경로**: 전 테이블 audit 트리거/ORM 자동 created_by 스탬프/ingress access_log/APM user 귀속이 익명 작성자 신원을 재유입시킴 → 익명 경로를 명시적 예외로. IP 컬럼 자체를 스키마에서 제거(없는 필드는 새지 않는다).
- **빌드 시 DB 의존**: 풀을 첫 쿼리 시점에 lazy 생성해야 `next build`/서버리스에서 import-time 연결 실패가 없음.
- **CSI 미등록 노드**: 특정 노드에서 `FailedMount`/`unbound PVC` → nodeAffinity로 제외(네임스페이스 한정 권한으론 cordon 불가).
- **레거시 안티패턴 계승 금지**: 양방향 비번 암호화, 하드코딩 자격증명, CORS `*`, 클라 페이징.

## 미해결 / 다음에 이어가면
- E2E(Playwright) 정식화(현재 단위+통합 158건만), 익명 무로깅의 **운영 레벨**(ingress access_log off) 실적용 검증.
- 구조적 로깅(Request ID·익명경로 deny-list), Drizzle 마이그레이션 추적 테이블·역방향 전략, DB 백업 CronJob, 커넥션 풀 모니터링.
- 매니페스트/시크릿/스키마 변경의 CI 자동화(현재 이미지 교체만 자동 — 좁은 patch Role 필요).

---
출처: `E:\agora\README.md`, `E:\agora\docs\01-requirements.md`, `07-architecture.md`, `08-database-design.md`, `12-deployment.md`, `13-improvement-roadmap.md`, `14-deployment-runbook.md`, `16-deploy-guide.md`, `E:\agora\agora\package.json`
민감정보(실명·사내 도메인/호스트·자격증명) 일반화·제거됨. second-brain 배포 프로파일 `intranet` 의 prior art.
