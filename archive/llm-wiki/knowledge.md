# llm-wiki — 지식 (노하우·결정·함정)

> 원본 repo 문서(`E:\llm-wiki`, 읽기 전용)와 채팅 이력에서 distill. [tier: judgment]

## 무엇을 만든 프로젝트인가
사내 협업용 **LLM Wiki**. 여러 사람의 문서·채팅·회의록을 LLM이 읽어 markdown 위키로 **점진 정리(compounding)** 하고, 질의하면 전체 맥락을 아는 위키가 **출처와 함께** 답한다. A의 질의·답변이 위키에 누적되어 같은 팀 B가 재사용한다 — 질의 행위 자체가 협업 자산이 된다(`docs\01-concept-goals.md` §3). RAG처럼 질의마다 원본을 재검색하지 않고 한 번 정리해 누적하는 Karpathy의 LLM Wiki 패턴을 ~수천 문서 규모에 맞춰 채택. agora(예약·게시판)와 완전 분리된 신규 프로젝트로, agora 코드는 복사하지 않고 배포·인증·보안 지식만 prior art로 인용한다.

## ★지배 제약 — 무료·빠름·비공개 트릴레마 (모든 설계를 결정)
프로젝트 후반의 핵심 깨달음(`docs\MASTER-PLAN.md`). 세 제약이 모든 결정을 지배한다: ① **비용 — 추가 결제 불가**(Claude **Max 구독 ≠ API**, API는 토큰당 과금이라 대량 인제스트·질의에 폭증), ② **프라이버시 — 사내 데이터 제3자 노출·외부 학습 금지**, ③ **하드웨어 — GPU 없음**(사내 Proxmox k8s·운영자 PC 모두 CPU-only). 무료·빠름(품질)·비공개 셋 중 둘만 가능 → 무료+비공개가 둘 다 하드면 남는 칸은 **로컬 Ollama(느림)** 뿐. **법적 경계**: 개인 Max 구독 OAuth를 앱/SDK 백엔드로 자동 사용하거나 팀 요청을 프록시하면 약관 위반·밴 → Claude는 *운영자 본인이 Claude Code(CLI)로 직접* 쓰는 경로만 합법($0).

## 기술 스택 / 아키텍처 한눈에
- 스택: **Next.js 16(App Router) + TypeScript + React 19**, **Prisma + PostgreSQL 16**(Docker, 포트 5433; MVP는 SQLite로 시작), 개발 포트 4310(`package.json`, `docs\03-architecture.md` §4).
- 위키 본문 = **git-backed markdown**(`wiki-runtime/`, `simple-git`), 메타만 DB. raw/wiki/schema 3계층.
- LLM = **4공급자 추상화** `callStructured`(`lib/anthropic.ts`): anthropic(Sonnet=인제스트/Opus=질의·유료) ↔ ollama(로컬 무료·느림) ↔ **gemini**(무료·빠름·비전·웹검색·⚠외부학습) ↔ **openai-compat**(Groq 등 무료·초고속·텍스트·⚠외부전송). 구조화 JSON 강제(anthropic=tool_choice, ollama=format, gemini=responseSchema, openai-compat=프롬프트 주입). 용도별 `INGEST_PROVIDER`/`QUERY_PROVIDER` > 전역 `LLM_PROVIDER`(`docs\03` §3.1).
- **자동 폴백**(`lib/fallback.ts`): 1순위 한도(429)/오류 시 같은 역할 백업으로 재시도. **프롬프트 tier 재선택**(`callStructured`의 `build(서빙모델 tier)` 콜백): attempt마다 서빙 모델 tier(strong=Claude·Gemini / weak=ollama·openai-compat)로 SIMPLE/HEAVY·컨텍스트량 재구성 → 약한 백업에 무거운 편집셋 안 줌(`docs\PLAN-model-prompt-strategy.md`).
- 추출 레이어: pdfjs·mammoth·xlsx·turndown·officeparser·word-extractor·jszip(hwpx)·jschardet/iconv-lite(인코딩 감지), LibreOffice 변환 폴백(`docs\17-asset-extraction.md`).
- 인제스트 워커 = git **단일 라이터**(`withWikiWriteLock`=앱 내부 락), 큐 폴링(`FOR UPDATE SKIP LOCKED`), 커밋 trailer로 provenance(sha·conf·model).

## 핵심 결정 (왜 그렇게 했나)
- **git-backed 위키**: 버전·blame·머지·revert·provenance가 거의 공짜, LLM이 파일을 그대로 컨텍스트로(`docs\03` §2).
- **워커 단일 라이터**: 동시쓰기 충돌 구조적 제거, LLM 지연이 요청 경로를 안 막음(REQ-OPS-003).
- **ACL 4 강제지점**(질의입력/페이지로드/인제스트적용/누적파일링): 허용 scope 밖 경로는 LLM 컨텍스트에 절대 안 들어감(`docs\07` §2). scope = `common`/`project-*`(룸)/`personal`.
- **신뢰도 게이트 + 모순 시 무조건 사람 검토**(`docs\06` §3). 거버넌스 2차: `confidence<INGEST_T_REVIEW`도 검토 큐, 룸→공통 ADMIN 승격.
- **★안전형 큐레이션 하이브리드**(`docs\PLAN-curation-hybrid.md`·`MASTER-PLAN.md` §6): 자동·전원·팀 = Ollama(무료·로컬·합법), 고품질 = 운영자가 직접 Claude Code(Max·$0)로 `wiki-runtime` git 편집. provenance `curator: ollama|claude`로 구분. **속도 해법 = 팀 라이브 LLM을 뺀다** — 팀은 큐레이션된 위키를 검색·읽기(LLM 0·즉시), AI 종합은 운영자가 생산해 적재 → "운영자 생산→팀 재사용" 철학과 일치.
- **무료/과금 업로드 게이팅**: 무료(ollama)=txt/md만, 구조(경로)는 코드가 결정·모델은 콘텐츠만 — 소형 모델이 경로를 `/1`로 깨뜨리는 문제 회피(`docs\PLAN-free-paid-upload-gating.md`). gemini 모드는 비전·다중포맷(full).
- **웹검색 격리**: 외부 결과는 `Message.webSourced`(대화층)에만, git위키·queries·인덱스 미진입(REQ-SEARCH-003).

## 노하우 / 재사용 패턴
- 본문=git / 메타=DB 분리는 버전·provenance를 공짜로 얻는 강력한 패턴.
- LLM은 **JSON 편집셋만** 반환하고 코드가 git에 적용 — LLM이 git을 직접 만지지 않음.
- 단일 ACL 계산처(`lib/acl/scope.ts`)를 4지점이 공용 호출 — 권한 로직 분산 방지.
- 공급자 추상화로 `.env`만 바꿔 하이브리드(질의=Gemini·인제스트=로컬) 무코드 전환. **폴백은 서빙모델 tier로 프롬프트 재선택**해야 정합.
- 약한 모델엔 task 단순화(구조는 코드)가 모델 교체보다 효과적. 적대적 6차원 리뷰로 결함 self-catch.
- 토큰 효율화: 질의 컨텍스트 한정(전 공급자)·질의 재사용 캐시·Claude `cache_control`·로컬 임베딩(`nomic-embed-text`) 페이지검색. 단 **답변 재사용엔 임베딩 미적용**(의도 다른 동일엔티티 질문이 패러프레이즈만큼 유사해 위험).

## 함정 / 다시는 안 할 것
- **Windows 셸에서 `curl -d` 인라인 한글 금지** — U+FFFD 손상. node로 payload/파일 작성(`HANDOFF.md` §0). 초기 깨진 한글은 DB·위키파일에서 사후 제거함(현재 깨짐 0).
- **LAN 공유 시 `localhost`로 박힌 절대 URL** — `http://<ip>:4310`로 접속하면 채팅·초대링크가 동작 안 함. origin을 요청 호스트 기준으로 생성해야 함.
- **자료 업로드 max-tokens 도달** — 큰 자료가 한 번에 컨텍스트 초과. 토큰 상한(`DAILY_TOKEN_LIMIT` 429)·컨텍스트 한정·요약 업로드로 완화.
- cross-scope 경로탈출(`common/../personal/..`) — `assertInScope`로 `..` 차단 필수(OVERNIGHT-STATUS 3b, CRITICAL).
- PDF를 `readAsText`로 읽어 깨지던 버그 — 타입별 텍스트/바이너리 업로드 분기 필요.
- 소형 로컬 모델은 깨끗한 md조차 위키 구조화 실패 — 게이팅만으론 품질 안 됨. GPU 없는 CPU 질의 ~4분은 모델 교체로 해결 안 됨(하드웨어 한계).
- `dev-login` 게스트는 비밀번호 없음 → **신뢰된 사내망 전용**(외부·인터넷 노출 금지).

## 미해결 / 다음에 이어가면
- **SSO 실배포 HOLD**: SP 코드 완료, secret 주입·IdP 공동배포 사람 신호 대기(순서 IdP→SP, `docs\sso-cowork-agents.md`·`docs\intranet-sso-prompt.md`).
- **큐레이션 레이어**: `curator` provenance 표시(작은 변경)·큐레이션 후보 뷰·운영자 런북·외부 Claude Code 편집과 앱 단일라이터 순차 조율(`docs\PLAN-status-verification.md` §3).
- **열린 결정**(`MASTER-PLAN.md` §10): 팀의 "라이브 AI 질의"가 꼭 필요한가(A 검색·읽기형=권장 / B Gemini 무료=프라이버시 양보 / C 유료=비용 양보)? 프라이버시 강도(전송 자체 금지 vs 학습만 금지)?
- pgvector 의미검색(외부 임베딩 의존 연기), 개인위키 BYO Hermes/Obsidian(연기). 100명 동시성은 현 구조 불가(GPU/유료 외 합법 경로 없음) → Phase C 재논의.
- LibreOffice 변환 happy-path는 soffice 설치 배포 컨테이너에서 실문서 검증 필요.

---
출처:
- `E:\llm-wiki\README.md`, `CLAUDE.md`, `HANDOFF.md`, `OVERNIGHT-STATUS.md`, `package.json`
- `E:\llm-wiki\docs\01·03·06·07·09·17`, `MASTER-PLAN.md`, `PLAN-curation-hybrid.md`, `PLAN-status-verification.md`, `PLAN-gemini-provider.md`, `PLAN-model-prompt-strategy.md`, `PLAN-local-llm-operation.md`, `PLAN-free-paid-upload-gating.md`
- `chats/INDEX.md`(세션 색인)

관련: second-brain `rails/model-tiers.yaml`(tier 라우팅) ← 이 프로젝트의 공급자 추상화·tier 폴백이 직접 영감.
