# second-brain — 아이디어 / 백로그 / 미실현 스파크

> 진행 중 떠올랐지만 아직 안 한 것들. 향후 `/creative` 의 prior-art 입력이 될 수 있다.
> ⚠️ company-internal 분류(대화에 agora 언급) — 평문 raw 는 미푸시.

## 하려다 만 것 (backlog)
- **R4 — 비용 라우팅 엔진**: `[tier: bulk]`→무료(로컬 qwen/Gemini), `[tier: judgment]`→Claude 소액. `rails/model-tiers.yaml`+`.env`+일 예산. llm-wiki `lib/anthropic.ts`/`cost.ts` 포팅 대상.
- **레일 1바퀴 검증**: 작은 아이디어로 `/creative`→게이트→`/develop`→`/deploy`→`/retro` 한 사이클(첫 교훈으로 루프 닫기). _(아직 — 입구는 다 빌드됨, 실행 대상 미정)_
- ✅ **외부 프로젝트 레지스트리 + 경로 해석** (P1, 2026-06-16 빌드): `rails/projects.yaml` + `rails/project-paths.md`. external=docs/+루트 코드+.rail/, 미등록=하위호환. _(intra에서 도출 → `memory/lessons/rail.md`)_
- ✅ **`/creative` 인제스트(수렴) 모드** (P2-a, 2026-06-18 빌드): `/creative` 발산/수렴 자동 판별 + `spec-author` greenfield/change-ingest. 발산 경로 유지. _(intra)_
- ✅ **rough/full rigor 2단계** (P2-b, 2026-06-16 빌드): `/develop <slug> [rough|full]`, rough=테스트·critic·worktree 생략·빌드만·HANDBACK 산출. _(intra)_
- ✅ **핸드백 단계 라벨 + 권장 전달방식** (P3, 2026-06-16 빌드): `rails/handoff/HANDBACK.template.md`(단계 라벨·정지 PNG 금지·실행 링크). _(intra 기획자 피드백)_
- ✅ **screens 명세에 `menu_visible` 플래그** (P3, 2026-06-16 빌드): `req-implementer` 가 `menu_visible: true` 화면만 메뉴 노출. _(intra)_
- **미등록 프로젝트 자동 등록 보조**: `/archive all` 이 미등록 폴더를 발견하면 repo 경로 추정 + 민감도 기본값(안전쪽=company-internal)으로 yaml 초안 제안. _(이번 `...Temp` 폴더 감지로 재확인 — 단 임시폴더는 제외 휴리스틱도 필요)_
- **distill 자동 트리거**: `newSinceDistill` 가 임계 넘으면 재정리를 자동 제안(현재는 표시만).
- **크로스-cwd 세션 경고**: 대상 프로젝트 폴더 세션 수가 비정상적으로 적으면(작업이 second-brain cwd 에 섞임) archive 엔진이 second-brain 자체 세션도 후보로 제안. _(intra 아카이브가 세션 1개 빈 껍데기로 드러남)_
- **`/handoff-external <project-path>` 제너레이터**: 크로스레포 재개 세팅(대상 repo `docs/TODO.md` 스캐폴드 + 양쪽 repo 에 이름 맞춘 재개 커맨드)을 매번 손으로 재구성 말고 한 번에 생성. _(intra `/goal` 을 손으로 양쪽 등록한 경험)_
- **`/status` 외부작업 레지스트리**: `rails/archive-sources.yaml` 처럼 가벼운 `rails/external-work.yaml`(project-path·HANDOFF/TODO 경로·마지막 활동일)을 두고 `/status` 가 파이프라인 상태 + 이 레지스트리를 같이 보여줘, 루트 HANDOFF 가 멈춰도 "진짜 최근 작업 위치"를 세션이 바로 알게.
- **레일 QA-ingest 모드**: QA CSV(화면·TC-ID·점검항목·기대·결과·비고)를 읽어 ①라우트/역할/시드 매핑 확인 ②케이스 성격별 자동화 가능 여부 분류 ③가능한 건 inspect 배터리로 즉시 실행해 Pass/Fail 채움 ④원본과 같은 컬럼 구조로 병합(BOM 단일 확인). 결과는 자동Pass/사람확인/확인필요 **3분류 컬럼**으로. _(intra QA 를 수작업으로 한 과정의 표준화)_
- **QA-문서→루트코즈 매핑 스킬**: "TC 목록 + 코드베이스 → 공통 코드 뿌리(R1~R10)→소비 화면 매핑 문서"를 병렬 Explore 로 근거 수집해 만드는 절차를 일회성 문서 아닌 재사용 스킬로 승격.
- **pre-push 사내마커 스캔 게이트**: `/archive` 인제스트뿐 아니라 *모든* second-brain 푸시(pre-push hook)로 확장 — 세션이 직접 쓴 lessons/patterns/docs 의 사내 호스트명을 사람이 매번 수동 grep 하는 대신 기계 게이트화.
- **크래시-복구 체크 스크립트**: HEAD vs origin/main·최근 커밋 diff·HANDOFF 최신 항목 vs `git log` 대조를 매번 손으로 말고 짧은 스크립트/체크리스트로. git-op 직후 자동 재-Read 도 훅/체크리스트로.
- **"Bash 막힘 → 원인 분기표"**: ① permission allow/deny/ask 규칙 확인 → ② 그래도 막히면 auto-mode 안전 분류기(settings 로 못 끔) 의심 → ③ 대응은 설정 변경 아니라 요청 구체화(누가/어디서/무엇을/어떻게). `update-config` 스킬에 "분류기는 permission 계층과 별개" 주석 추가.

## 떠오른 스파크 (다른 프로젝트로 분화 가능)
- **archive 엔진을 독립 도구로**: "Claude Code 트랜스크립트 → 마스킹·색인·암호화 백업"은 second-brain 밖에서도 쓸 범용 유틸.
- **archive 지식 → /creative prior-art 자동 주입**: 새 아이디어 창작 시 `archive/*/knowledge.md` 를 자동 검색해 관련 노하우를 컨텍스트로.
- **회고 루프 보상의 정량화**: `/retro` 교훈이 템플릿/명령을 개선해 "N번째 프로젝트가 1번째보다 빠르다"를 실제로 측정.
- **토스트/동적 텍스트 전수 대조 도구**: 시안 `<script>` 내 `showToast`/`toast(...)` 문자열 리터럴을 파싱·카탈로그화하고 실행 후 실제 뜬 토스트와 diff 하는 `toast-audit` 을 inspect 배터리 표준 항목으로 승격.
- **다중에이전트 감사 결과 자동 압축기**: 장문 JSON 갭 목록을 스캔 가능한 체크리스트 줄로 요약하는 스크립트/스킬(레일 비대화 방지).
- **병렬 워크플로 kill-switch**: 한 명령으로 백그라운드 워크플로를 확실히 멈추는 절차(현재는 `/workflows` 수동).
- **sweep 사전 견적기**: "렌즈 수 × 검증 라운드"로 토큰을 미리 추정(실제가 추정의 3~9배였음).
- **"골든 샘플 검증 → 배치 복제"를 정식 레일 게이트로**: 현재는 체크리스트 한 줄 — UI 스케일 작업의 게이트 단계로 승격.
- **승인 하드분리 자동 제안 트리거**: cron 예약 배포 등 무인/다인 운영 전환 신호 감지 시 하드 벽을 제안(1인 상시감독 땐 조용).

## 개선 아이디어 (이 프로젝트를 다시 한다면)
- **타임스탬프 churn 제거**: README/SECRETS 의 생성시각을 내용 해시 변경 시에만 갱신(매 실행 diff 방지).
- **PS 스크립트 처음부터 ASCII** (PS5.1 UTF-8 오독을 도구 규약으로 박기).
- **민감도 분류를 인제스트 첫 단계 게이트로**: 신규 프로젝트는 분류 확정 전엔 raw 를 항상 gitignore(안전 기본값).
- **배포 스타터 패턴 정비**: 사내 Next.js 배포 스타터에 ①preflight "네이티브/옵셔널 의존성 실제 태우기" 표준 항목 ②빌드 산출물(`.node`) vendoring 기본 권장 ③"prod push=자연어 승인 불가, 명시 토큰만" 컨벤션을 박아 매 배포 같은 실랑이 반복 줄이기.
- **"대량 배치 수정 추적" 레일 템플릿**: HANDOFF 번호 블록 + 항목 체크리스트 + 커밋당 1항목 — QA 라운드뿐 아니라 develop/deploy 의 REQ 배치에도 일반화 검토.
- **memory 5축 교차검증을 `/retro` 또는 별도 스킬로**: 색인↔파일·깨진/고아 링크·repo 참조·커버리지 diff 를 세션 다수 누적 시 주기 재사용.
- **fidelity-audit 에 모달/드로어 vs 페이지 의도 축**: 시안 소스에서 버튼이 다이얼로그를 여는지 네비게이션하는지 자동 판별해 구조 불일치 사전 검출. 클릭-스루 죽은컨트롤 감사도 프로젝트 초기부터 상시 포함.
- **시간한정 프로모션 모델은 `model-tiers.yaml` 에 즉시 박지 말 것**: 만료되는 프로모션을 영구 tier 에 묶으면 만료 후 깨짐 — "프로모션 감지 시 판단 보류·정밀 작업엔 기본 모델 유지" 원칙만 일반화(구체 모델명 시효성 주장 배제).
