# llm-wiki — 지식 (노하우·결정·함정)

> 원본 repo 문서(`E:\llm-wiki`, 읽기 전용)와 채팅 이력에서 distill. [tier: judgment]
> 사내 호스트/IP는 이 읽기 레이어에서 일반화(`<사내Harbor>` 등). 원본 raw 는 personal+allow_internal 로 평문 유지(사용자 검토).

## 무엇을 만든 프로젝트인가
사내 협업용 **LLM Wiki**. 여러 사람의 문서·채팅·회의록을 LLM이 읽어 markdown 위키로 **점진 정리(compounding)** 하고, 질의하면 전체 맥락을 아는 위키가 **출처와 함께** 답한다. A의 질의·답변이 위키에 누적되어 같은 팀 B가 재사용한다 — 질의 행위 자체가 협업 자산이 된다(`docs\01-concept-goals.md` §3). RAG처럼 질의마다 원본을 재검색하지 않고 한 번 정리해 누적하는 Karpathy의 LLM Wiki 패턴을 ~수천 문서 규모에 맞춰 채택. agora(예약·게시판)와 완전 분리된 신규 프로젝트로, agora 코드는 복사하지 않고 배포·인증·보안 지식만 prior art로 인용한다. **2026-06-15 기준 사내 k8s에 비공개 파일럿 배포 완료**(`docs\18-deployment.md`).

## ★지배 제약 — 무료·빠름·비공개 트릴레마 (모든 설계를 결정)
프로젝트 후반의 핵심 깨달음(`docs\MASTER-PLAN.md`). 세 제약이 모든 결정을 지배한다: ① **비용 — 추가 결제 불가**(Claude **Max 구독 ≠ API**, API는 토큰당 과금이라 대량 인제스트·질의에 폭증), ② **프라이버시 — 사내 데이터 제3자 노출·외부 학습 금지**, ③ **하드웨어 — GPU 없음**(사내 Proxmox k8s·운영자 PC 모두 CPU-only). 무료·빠름(품질)·비공개 셋 중 둘만 가능. "GPU 없음 + 추가결제 0 + 100명 + 온프레미스 넷이 동시 성립 불가, 하나는 양보"로 압축 → **CPU-only 5인 파일럿**으로 시작(저동시성 감내). **법적 경계**: 개인 Max 구독 OAuth를 앱/SDK 백엔드로 자동 사용·팀 요청 프록시는 약관 위반·밴 → Claude는 *운영자 본인이 Claude Code(CLI)로 직접* 쓰는 경로만 합법($0).

## 기술 스택 / 아키텍처 한눈에
- 스택: **Next.js 16(App Router) + TypeScript + React 19**, **Prisma + PostgreSQL 16**(로컬 Docker 5433 / 클러스터 서비스 5532), 개발 포트 4310(`package.json`, `docs\03-architecture.md`).
- 위키 본문 = **git-backed markdown**(`wiki-runtime/`, `simple-git`), 메타만 DB. raw/wiki/schema 3계층.
- LLM = **4공급자 추상화** `callStructured`(`lib\anthropic.ts`): anthropic(Sonnet=인제스트/Opus=질의·유료) ↔ ollama(로컬 무료·느림) ↔ **gemini**(무료·빠름·비전·웹검색·⚠외부학습) ↔ **openai-compat**(Groq 등 무료·초고속·텍스트·⚠외부전송). 구조화 JSON 강제. 용도별 `INGEST_PROVIDER`/`QUERY_PROVIDER` > 전역 `LLM_PROVIDER`(`docs\03` §3.1).
- **자동 폴백**(`lib\fallback.ts`): 1순위 한도(429)/오류 시 같은 역할 백업으로 재시도. **프롬프트 tier 재선택**(attempt마다 서빙모델 tier로 SIMPLE/HEAVY·컨텍스트량 재구성 → 약한 백업에 무거운 편집셋 안 줌, `docs\PLAN-model-prompt-strategy.md`).
- 추출 레이어(`lib\extract.ts`): pdfjs·mammoth·xlsx·turndown·officeparser·word-extractor·jszip(hwpx)·jschardet/iconv-lite(인코딩 감지), LibreOffice 변환 폴백(`docs\17-asset-extraction.md`).
- 인제스트 워커 = git **단일 라이터**(`withWikiWriteLock`=앱 내부 락), 큐 폴링, 커밋 trailer로 provenance(sha·conf·model).

## 핵심 결정 (왜 그렇게 했나)
- **git-backed 위키**: 버전·blame·머지·revert·provenance가 거의 공짜, LLM이 파일을 그대로 컨텍스트로(`docs\03` §2).
- **워커 단일 라이터**: 동시쓰기 충돌 구조적 제거(REQ-OPS-003). 배포에도 직결 → **replicas:1 + `strategy:Recreate`**(2파드 동시쓰기가 git 충돌). 진짜 무중단은 쓰기락을 Postgres advisory lock으로 크로스파드화 후 RWX+replicas2가 필요(후속, `docs\18` §0).
- **ACL 4 강제지점**(질의입력/페이지로드/인제스트적용/누적파일링): 허용 scope 밖 경로는 LLM 컨텍스트에 절대 안 들어감(`docs\07` §2). scope = `common`/`project-*`(룸)/`personal`. 관리권한은 단일 계산처 `lib\acl\scope.ts`(`canManageScope`=ADMIN·룸OWNER·개인본인).
- **신뢰도 게이트 + 모순 시 무조건 사람 검토**(`docs\06` §3). `confidence<INGEST_T_REVIEW`(0.5)도 검토 큐, 룸→공통 ADMIN 승격(`Promotion`).
- **★안전형 큐레이션 하이브리드**(`MASTER-PLAN.md` §6): 자동·전원·팀 = 로컬/무료, 고품질 = 운영자가 Claude Code(Max·$0)로 직접 git 편집. **속도 해법 = 팀 라이브 LLM을 경로에서 뺀다**(검색·읽기형 + 운영자 생산).
- **웹검색 격리·완화**: 외부 결과는 `Message.webSourced`(대화층)에만, git위키·검색·위키질의 컨텍스트 미진입(REQ-SEARCH-003). 단 2026-06-14부터 웹 Q&A는 **`QueryLog.webSourced`에 저장→재사용 캐시**로 토큰 절감(부분완화 = DB 재사용만 허용, `docs\15` §6).
- **★배포 = agora 인프라 일반화(복사 아님)**: 사내 Harbor 레지스트리(`<사내Harbor>/<사내ns>`)·GitLab CI(`docker-build→release` 자동, `service-deploy` 수동)·nginx ingress+cert-manager·네임스페이스 `<사내ns>`. 인증은 SSO HOLD 동안 **임시 PILOT_AUTH(이름/패스코드)**. 스키마는 **클러스터 내 migrate-job**(`prisma db push`, 서버에 node 불필요).

## 노하우 / 재사용 패턴
- 본문=git / 메타=DB 분리는 버전·provenance를 공짜로 얻는 강력한 패턴. LLM은 **JSON 편집셋만** 반환하고 코드가 git에 적용.
- 단일 ACL 계산처를 여러 지점이 공용 호출 — 권한 로직 분산 방지. 공급자 추상화로 `.env`만 바꿔 하이브리드 무코드 전환. **폴백은 서빙모델 tier로 프롬프트 재선택**해야 정합.
- 약한 모델엔 task 단순화(구조는 코드)가 모델 교체보다 효과적. 적대적 6차원 리뷰로 결함 self-catch.
- 토큰 효율화: 질의 컨텍스트 한정(전 공급자)·질의/웹 답변 재사용 캐시·Claude `cache_control`·로컬 임베딩(`nomic-embed-text`) 의미 페이지검색. **답변 재사용엔 임베딩 미적용**(의도 다른 동일엔티티 질문이 패러프레이즈만큼 유사해 위험).
- **모델별 컨텍스트 예산**(`lib\query.ts ctxBudgetFor`)으로 무료 TPM에 맞춰 페이지 수를 줄임(Gemini/Claude 14p / Groq 소형 8p·대형 4p). 위키 페이지 아카이브=점-디렉터리(`.archive/`) 이동만으로 트리·검색·질의에서 자동 제외(추가 필터 불필요).
- **2단계 업로드**: 업로드=스테이징(토큰0) → '분석' vs '원본 그대로(토큰0)' 선택. 사전정제 .md/.txt는 frontmatter 감지로 토큰0 파일링.

## 함정 / 다시는 안 할 것
- **Windows 셸에서 `curl -d` 인라인 한글 금지** — U+FFFD 손상. node로 payload/파일 작성(`HANDOFF.md` §0). 초기 깨진 한글 사후 제거(현재 깨짐 0).
- **LAN 공유 시 `localhost`로 박힌 절대 URL** — `http://<사내IP>:4310`로 접속하면 채팅·초대링크가 동작 안 함. `APP_BASE_URL`/요청 호스트 기준으로 origin 생성해야 함.
- cross-scope 경로탈출(`common/../personal/..`) — `assertInScope`로 `..` 차단 필수(CRITICAL).
- PDF를 `readAsText`로 읽어 깨지던 버그 — 타입별 텍스트/바이너리 업로드 분기 필요.
- 소형 로컬 모델은 깨끗한 md조차 위키 구조화 실패, GPU 없는 CPU 질의 ~4분은 모델 교체로 해결 안 됨(하드웨어 한계).
- `dev-login`/`PILOT_AUTH` 게스트는 비밀번호 없음 → **신뢰된 사내망 전용**(외부·인터넷 노출 금지).
- **무료 TPM 413**(Groq 대형모델 8K TPM 등): brain/TOC 오버헤드 합산이 한도 초과. 해법 = **같은 모델로 축소-재시도**(`isRequestTooLarge`, scale 0.35), ★Gemini로 캐스케이드 금지(안 쓴 Gemini 한도가 소진되던 버그). 대용량 ai-edit 잘림(maxOutputTokens) JSON 누수 → non-retryable 처리.
- **사용량 막대가 1회 업로드 후 100% 표시** = 오인. `DAILY_TOKEN_LIMIT=0`(무제한)이라 "오늘 최다사용 모델 기준 상대치"로 그려진 탓 → **요청수/무료등급 한도 기준**으로 교체. 로컬·배포 카운터는 DB 분리라 별도, Groq RPD/RPM/TPM은 모델별 독립.
- 운영 DB **port-forward 함정**: `tmux new -d 'cmd'`/`nohup`은 맨 셸이 PATH/KUBECONFIG 미로딩이라 즉사 → **빈 tmux 세션 + send-keys**. 로컬 DB(5433)와 터널 DB(포워드 로컬포트) 혼동 금지.
- CI 러너 SA가 secret 생성권한 없음 → 최초 셋업은 `deploy/first-setup.sh`로. `APP_DATABASE_URL` 안 비번 == `APP_POSTGRES_PASSWORD`(다르면 접속 실패), `@/:`는 URL 인코딩.

## 미해결 / 다음에 이어가면
- **SSO 실배포 HOLD**: SP 코드 완료, secret 주입·IdP 공동배포 사람 신호 대기(순서 IdP→SP, `docs\sso-cowork-agents.md`). 가동 시 `SSO_*` 주입 + `PILOT_AUTH` 끄기로 코드 무변경 전환.
- **진짜 무중단**: 현 replicas:1+Recreate는 배포 시 수 초 blip. 쓰기락 크로스파드화 후 RWX+replicas2 확장(`docs\18` §0).
- pgvector 의미검색(외부 임베딩 의존 연기), 개인위키 BYO Hermes/Obsidian(연기). 100명 동시성·GPU 파일럿은 Phase C 재논의.
- LibreOffice 변환 happy-path는 soffice 설치 배포 컨테이너에서 실문서 검증 필요. 위키 서브탭 간 스크롤 보존 연기.

---
출처:
- `E:\llm-wiki\README.md`, `CLAUDE.md`, `HANDOFF.md`(§0: 2026-06-14·06-15), `OVERNIGHT-STATUS.md`, `package.json`
- `E:\llm-wiki\docs\01·03·06·07·09·15·17·18`, `MASTER-PLAN.md`, `PLAN-curation-hybrid.md`, `PLAN-model-prompt-strategy.md`, `PLAN-local-llm-operation.md`, `PLAN-free-paid-upload-gating.md`
- `chats\INDEX.md`(세션 색인)

관련: second-brain `rails/model-tiers.yaml`(tier 라우팅) ← 이 프로젝트의 공급자 추상화·tier 폴백이 직접 영감.
