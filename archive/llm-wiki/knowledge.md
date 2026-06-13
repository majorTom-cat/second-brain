# llm-wiki — 지식 (노하우·결정·함정)

> 원본 repo 문서(`E:\llm-wiki`, 읽기 전용)와 채팅 이력에서 distill. [tier: judgment]

## 무엇을 만든 프로젝트인가
사내 협업용 **LLM Wiki**. 여러 사람의 문서·채팅·회의록을 LLM이 읽어 markdown 위키로 **점진 정리(compounding)** 하고, 질의하면 전체 맥락을 아는 위키가 **출처와 함께** 답한다. A의 질의·답변이 위키에 누적되어 같은 팀 B가 재사용한다 — 질의 행위 자체가 협업 자산이 된다(`E:\llm-wiki\docs\01-concept-goals.md` §3). RAG처럼 질의마다 원본을 재검색하지 않고 한 번 정리해 누적하는 Karpathy의 LLM Wiki 패턴을 ~수천 문서 규모에 맞춰 1차 방식으로 채택. agora(예약·게시판)와 완전 분리된 신규 프로젝트로, agora 코드는 복사하지 않고 배포·인증·보안 지식만 prior art로 인용한다.

## 기술 스택 / 아키텍처 한눈에
- 스택: **Next.js 16(App Router) + TypeScript + React 19**, **Prisma + PostgreSQL 16**(Docker, 포트 5433; MVP는 SQLite로 시작했음), 개발 포트 4310 (`E:\llm-wiki\package.json`, `docs\03-architecture.md` §4).
- 위키 본문 = **git-backed markdown**(`wiki-runtime/`, `simple-git`), 메타만 DB. raw/wiki/schema 3계층(`docs\01` §1).
- LLM = **공급자 추상화** `callStructured`(`lib/anthropic.ts`): anthropic(Sonnet=인제스트/Opus=질의) ↔ ollama(로컬 무료) ↔ gemini/openai-compat. 구조화 JSON 강제(anthropic=tool_choice, ollama=format). 용도별 `INGEST_PROVIDER`/`QUERY_PROVIDER` > 전역 `LLM_PROVIDER`(`docs\03` §3.1).
- 추출 레이어: pdfjs·mammoth·xlsx·turndown·officeparser·word-extractor·jszip(hwpx)·jschardet/iconv-lite(인코딩 감지), LibreOffice 변환 폴백(`docs\17-asset-extraction.md`).
- 인제스트 워커 = git **단일 라이터**, 큐 폴링(`FOR UPDATE SKIP LOCKED`), 커밋 trailer로 provenance(sha·conf·model).

## 핵심 결정 (왜 그렇게 했나)
- **git-backed 위키**: 버전·blame·머지·revert·provenance가 거의 공짜, LLM이 파일을 그대로 컨텍스트로(`docs\03` §2).
- **워커 단일 라이터**: 동시쓰기 충돌을 구조적으로 제거, LLM 지연이 요청 경로를 안 막음(REQ-OPS-003).
- **ACL 4 강제지점**(질의입력/페이지로드/인제스트적용/누적파일링): 한 곳 우회해도 다른 곳이 막음. 불변식 = 허용 scope 밖 경로는 LLM 컨텍스트에 절대 안 들어감(`docs\07` §2). scope = `common`/`project-*`(룸)/`personal`.
- **신뢰도 게이트 + 모순 시 무조건 사람 검토**: 지식 오염 방지, MVP는 보수적으로(`docs\06` §3).
- **로컬 Ollama 운영 확정**: "추가 결제 불가 + 데이터 외부 유출 금지" 둘을 동시에 만족하는 유일 안. 무료 클라우드(Gemini 무료등급)는 학습 활용으로 탈락(`docs\PLAN-local-llm-operation.md`).
- **무료/과금 업로드 게이팅**: 로컬=txt/md만, 구조(경로)는 코드가 결정·모델은 콘텐츠만 — 소형 모델이 경로를 `/1`로 깨뜨리는 문제 회피(`docs\PLAN-free-paid-upload-gating.md`).
- **웹검색 격리**: 외부 결과는 `Message.webSourced`(대화층)에만, git위키·queries·인덱스 미진입(REQ-SEARCH-003).

## 노하우 / 재사용 패턴
- 본문=git / 메타=DB 분리는 버전·provenance를 공짜로 얻는 강력한 패턴.
- LLM은 **JSON 편집셋만** 반환하고 코드가 git에 적용 — LLM이 git을 직접 만지지 않음.
- 단일 ACL 계산처(`lib/acl/scope.ts`)를 4지점이 공용 호출 — 권한 로직 분산 방지.
- 공급자 추상화로 `.env`만 바꿔 하이브리드(질의=Claude·인제스트=로컬) 무코드 전환.
- 약한 모델엔 task 단순화(구조는 코드)가 모델 교체보다 효과적. 적대적 6차원 리뷰로 결함 self-catch.

## 함정 / 다시는 안 할 것
- **Windows 셸에서 `curl -d` 인라인 한글 금지** — U+FFFD 손상. node로 payload/파일 작성(`HANDOFF.md` §0).
- cross-scope 경로탈출(`common/../personal/..`) — `assertInScope`로 `..` 차단 필수(OVERNIGHT-STATUS 3b).
- PDF를 `readAsText`로 읽어 깨지던 버그 — 타입별 텍스트/바이너리 업로드 분기 필요.
- 소형 로컬 모델은 깨끗한 md조차 위키 구조화 실패 — 게이팅만으론 품질 안 됨.

## 미해결 / 다음에 이어가면
- **SSO 실배포 HOLD**: 코드 완료, secret 주입·IdP 공동배포 사람 신호 대기(`docs/sso-cowork-agents.md`).
- pgvector 의미검색(외부 임베딩 의존으로 연기), 개인위키 BYO Hermes/Obsidian(연기).
- 로컬 질의 CPU 속도(~4분) — GPU/하이브리드 재논의 시 개선. 100명 동시성은 CPU-only 한계.
- LibreOffice 변환 happy-path는 soffice 설치 배포 컨테이너에서 실문서 검증 필요.

---
출처:
- `E:\llm-wiki\README.md`, `E:\llm-wiki\CLAUDE.md`, `E:\llm-wiki\HANDOFF.md`, `E:\llm-wiki\OVERNIGHT-STATUS.md`, `E:\llm-wiki\package.json`
- `E:\llm-wiki\docs\01-concept-goals.md`, `03-architecture.md`, `06-ingest-pipeline.md`, `07-query-and-acl.md`, `09-security-privacy.md`, `17-asset-extraction.md`
- `E:\llm-wiki\docs\PLAN-local-llm-operation.md`, `PLAN-free-paid-upload-gating.md`
- `chats/INDEX.md` (이 아카이브의 세션 색인)

관련: second-brain `rails/model-tiers.yaml`(tier 라우팅) ← 이 프로젝트의 공급자 추상화가 직접 영감.
