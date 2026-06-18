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
- **★질의 기본 PRIVATE(본인만) + 본인 승격**(2026-06-15, `HANDOFF.md` §0): 초기엔 모든 위키-질의를 자동으로 공용 `queries/*` git 페이지로 파일링 → "내 질의가 룸 전체에 다 보인다"는 프라이버시 우려. 해법 = 질의 기본 `visibility:PRIVATE`·`filedPath:null`(검색·grounding·타인 재사용 미진입), `tryReuseAnswer(scope,q,userId)`는 `OR[TEAM, PRIVATE+userId]`로 **남의 프라이빗은 안 봄**, 본인 최근 PRIVATE은 맥락 참고용(인용 금지)으로만 주입. 가치 있으면 `POST /api/queries/[id]/promote`(asker 본인·멱등)로 룸 공용 승격. 스키마 변경 없이 `QueryLog.visibility`/`userId` 재사용.
- **★배포 = agora 인프라 일반화(복사 아님)**: 사내 Harbor 레지스트리(`<사내Harbor>/<사내ns>`)·GitLab CI(`docker-build→release` 자동, `service-deploy` 수동)·nginx ingress+cert-manager·네임스페이스 `<사내ns>`. 인증은 SSO HOLD 동안 **임시 PILOT_AUTH(이름/패스코드)**. 스키마는 **클러스터 내 migrate-job**(`prisma db push`, 서버에 node 불필요).
- **★유료 OpenAI 공식 공급자 = 7번째 공급자, 무료/구독과 완전 분리**(2026-06-17, `lib\openai.ts`·`HANDOFF.md` §0). 기존 `openai-compat`(Groq 등 무료)·codex/claude-cli($0 구독 CLI)와 **별개의 `openai` 공급자**로, 회사 결제 OpenAI 키(`/v1/chat/completions`)를 직접 쓴다. 핵심 차이 = ① **데이터 OpenAI 외부전송**(민감자료 금지·단 공식 API는 기본 학습 미사용=정식경로), ② **종량 과금**이라 폴백을 ★OpenAI 안에서만·같은 capability끼리★로 가둬 무료(Gemini/Groq)로 절대 캐스케이드 안 함(과금 누설 방지, `lib\fallback.ts` `gpt-4.1-mini→nano→4.1` / `gpt-4o-mini→4o` / `gpt-5-mini→nano→o4-mini→gpt-5`). ③ 활성화는 **별도 토글 없이 "키를 넣으면 켜짐"**(결제키 입력=쓰겠다는 뜻). 기본 질의 공급자는 **Gemini 유지**(유료는 선택지로만). 1순위/백업은 capability별 큐레이션(`OPENAI_CURATED`, primary만 셀렉터 '대표'·나머지 '↳ 백업'으로 직접 선택 가능), `OPENAI_MODELS` 핀으로 덮어쓰기 가능.
- **★공급자 키 = 관리자 화면입력 + DB AES-256-GCM 암호화 + 다중 키 자동 회전(BYOK)**(2026-06-17, `lib\secrets.ts`·`ProviderSecret`). `.env`로만 받던 모든 공급자 키를 **관리자가 UI에서 슬롯별로 여러 개 등록** → DB에 AES-256-GCM으로 암호화 저장하고, 1번 키가 한도(429)면 **다음 키로 자동 회전**(`callStructured` 키 회전 루프 → 다 쓰면 모델/공급자 폴백). 적용 대상 = **전 공급자**(openai/gemini/groq=apiKey 주입, anthropic=키별 클라이언트, claude-cli=자식 env 토큰+★ANTHROPIC_API_KEY 삭제 유지★, codex=임시 CODEX_HOME auth.json). **마스터키(`SECRET_ENCRYPTION_KEY`)는 env에만** 둬 DB만 봐선(DBeaver 등) 복호화 불가 — 루트 시크릿 외부화. **env 키 폴백 무회귀**(DB 행 없으면 기존 `.env` 동작 유지). 배포 전제 = `migrate-job`(provider_secrets 테이블) + Secret `SECRET_ENCRYPTION_KEY` 주입.

## 노하우 / 재사용 패턴
- 본문=git / 메타=DB 분리는 버전·provenance를 공짜로 얻는 강력한 패턴. LLM은 **JSON 편집셋만** 반환하고 코드가 git에 적용.
- 단일 ACL 계산처를 여러 지점이 공용 호출 — 권한 로직 분산 방지. 공급자 추상화로 `.env`만 바꿔 하이브리드 무코드 전환. **폴백은 서빙모델 tier로 프롬프트 재선택**해야 정합.
- 약한 모델엔 task 단순화(구조는 코드)가 모델 교체보다 효과적. 적대적 6차원 리뷰로 결함 self-catch.
- 토큰 효율화: 질의 컨텍스트 한정(전 공급자)·질의/웹 답변 재사용 캐시·Claude `cache_control`·로컬 임베딩(`nomic-embed-text`) 의미 페이지검색. **답변 재사용엔 임베딩 미적용**(의도 다른 동일엔티티 질문이 패러프레이즈만큼 유사해 위험).
- **모델별 컨텍스트 예산**(`lib\query.ts ctxBudgetFor`)으로 무료 TPM에 맞춰 페이지 수를 줄임(Gemini/Claude 14p / Groq 소형 8p·대형 4p). 위키 페이지 아카이브=점-디렉터리(`.archive/`) 이동만으로 트리·검색·질의에서 자동 제외(추가 필터 불필요).
- **아카이브 "축"이 3겹 = 메커니즘이 다 다름**(혼동 주의). ① **위키 페이지** 아카이브 = `.archive/` git 점-디렉터리 이동(질의 제외의 *본질*). ② **자료(Source)** 아카이브 = `Source.archivedAt` DB 소프트 플래그(자료의 지식은 위키에 있어 이것만으론 질의에서 안 빠짐). ③ **룸(Project)** 아카이브 = `Project.archivedAt` DB 타임스탬프 soft-delete(내용 보존, OWNER 전용 `POST /api/rooms/[slug]/archive`). 룸 archive는 `allowedScopes()`의 `!m.project.archivedAt` 필터로 **사이드바·ACL에서 통째 사라지게** 한다 → 페이지/자료 아카이브와 별 메커니즘(세션 68cccbe2, `HANDOFF.md`).
- **아카이브 룸 복구 = "읽기 전용 scope" 한 경로로 푼다**(소프트삭제 가시화 패턴): `allowedScopes`가 아카이브 룸을 빼버려 사이드바에서 사라진 것을 → 사이드바 하단 접이식 '아카이브 룸(N)' 섹션(`WikiTab`의 `showArchive`+`tree-caret` 회전 재사용)으로 다시 보이게 하고, 클릭 시 **위키만 읽기 전용 열람**(채팅/질의/인제스트 잠금), OWNER만 복원. 핵심 = **쓰기는 막은 채 읽기만 연다**: 기존 쓰기 가드(`canManageScope`)는 이미 `archivedAt` 룸을 `false`로 막아서(`lib\acl\scope.ts`) 편집/AI분석/승격 버튼이 자동으로 숨음 → 새로 한 건 **읽기 경로(`assertScopeAllowed`)만 아카이브 룸을 통과시키고** 복원 API(`Materials`의 `action:restore` PATCH 패턴 재사용)를 추가한 것. UI는 `archivedScopes` prop + `effTab`(위키 고정) + 읽기전용 배너. **스키마 변경 0**(`Project.archivedAt` 재사용, 세션 68cccbe2, `HANDOFF.md`).
- **★구독 CLI 공급자 2종(codex·claude-cli) 패턴 = 1:1 미러로 추가 가능**: 5번째(codex/ChatGPT)에 이어 **6번째 `claude-cli`(Claude Max 구독)**도 `lib\codex.ts`를 거의 그대로 복제해 붙임(`lib\claude-cli.ts`). `claude -p --output-format json --model opus|sonnet|haiku`를 자식 프로세스로 spawn, 프롬프트는 **stdin+EOF**. Claude Code엔 `--output-schema`가 없어 **스키마는 프롬프트 인라인 후 `extractJson` 파싱**. ★과금 방지 핵심 = 자식 env에서 `ANTHROPIC_API_KEY`를 제거★해 구독 OAuth(`CLAUDE_CODE_OAUTH_TOKEN`)로만 인증(`--bare` 미사용·cwd=tmp·도구 비활성). codex(단일 모델)와 달리 **모델 3종**을 `claude-cli/<alias>` id로 등록(API용 `claude-*`와 충돌 회피) → `cost.ts providerOfModel`에서 `startsWith("claude-cli")`를 `startsWith("claude")`보다 **위에** 둬야 오분류 안 됨. 활성화는 env 없이 **계정설정 토글(기본 꺼짐)**, API Claude는 결제 전까지 잠금 유지(세션 68cccbe2, `HANDOFF.md`).
- **2단계 업로드**: 업로드=스테이징(토큰0) → '분석' vs '원본 그대로(토큰0)' 선택. 사전정제 .md/.txt는 frontmatter 감지로 토큰0 파일링. **드롭=즉시처리는 "난 올리려던 게 아닌데" 혼란 유발** → 드롭/선택은 **스테이징만**, 모드 고른 뒤 **[처리 시작]**으로 확정하는 흐름으로 확정(`HANDOFF.md` §0 2026-06-15).
- **원본 그대로 → AI 분석 = 대체가 아니라 증강(augment)**: '원본 그대로'로 보존된 topic이 있으면 재분석은 원본을 **편집 금지**하고 `entities/`·`concepts/`만 만들어 [[링크]]로 그래프화. 원본 끝 '## 관련 분석' 링크 섹션은 **코드가 결정적·멱등 생성**(LLM 아님, 재분석 반복해도 중복 0). 초기 설계의 supersede(원본 아카이브로 대체)는 "원본은 거의 그대로" 기대와 어긋나 제거(`lib\ingest.ts buildAugmentSystem`/`buildRelatedSection`, `HANDOFF.md` §0).
- **탭 간 상태 보존 = 항상 마운트 + 공유 무효화 신호**: 자료 탭만 `{tab===... && <Tab/>}` 조건부 마운트라 탭 전환 시 모드·대기큐가 리셋됐다(Chat/Wiki는 `hidden` prop로 항상 마운트). → 항상 마운트 + 공유 **`dataRev`** 신호로 자료 변경 시 위키 트리/아카이브를 **새로고침 없이** 갱신. 새로고침 영속화는 `sessionStorage`(룸·열린탭·업로드모드+큐).
- **codex(ChatGPT 구독)를 $0 인제스트/질의 공급자로**(opt-in·실험): 앱이 직접 호출이 아니라 컨테이너 안 `codex` CLI 실행 → `codex exec --output-schema`로 구조화 JSON, **프롬프트는 stdin으로 보내고 닫아야**(인자로 주면 stdin 대기하며 30분 행), OpenAI strict 스키마라 위키 스키마를 `strictifySchema`로 변환(전부 required·additionalProperties:false). `callStructured`에 `codex` 분기로 4공급자→5공급자(`lib\codex.ts`, `HANDOFF.md` §0).
- **★OpenAI 한 어댑터 안에서 모델 세대별 파라미터를 자동 분기(A/B)**: 같은 `/v1/chat/completions`라도 ① 표준 챗(gpt-4.1·4o 계열)은 `max_tokens` + `temperature:0` + `response_format:json_object`(JSON 모드 강제), ② 신세대·추론(gpt-5·o 계열)은 `max_completion_tokens` + **temperature 생략**(거부함) + **response_format 미강제**(일부 추론모델이 400으로 거부 → system의 'JSON만 출력' 지시 + 정규식 추출 폴백에 의존). 판정은 `isReasoningModel`(`^gpt-5`/`^o\d`). 구조화 출력은 **스키마를 프롬프트에 인라인**해 전 모델 호환(claude-cli·codex와 같은 전략). 비전은 `image_url` data URL, PDF 등 문서는 chat completions가 직접 못 받아 무시(추출 텍스트는 이미 userText에 포함). 공급자별 프리앰블(`openaiPromptHint`)도 추론/표준으로 분기(`lib\openai.ts`).
- **★BYOK 키 저장소 = 암호화·캐시·쿨다운 한 모듈로(`lib\secrets.ts`)**: 암호문 형식은 `iv:tag:ct`(전부 base64), IV는 매 암호화마다 `randomBytes(12)`. 복호화 평문은 **globalThis 메모리 캐시에만**(영속 안 함, TTL 30초, 관리자 저장 시 `refreshSecrets`로 즉시 갱신) — prisma 싱글톤과 같은 이유(라우트 핸들러 간 모듈 분리 대비). **마스터키 형식오류는 fail-loud(throw)** — 조용히 SESSION_SECRET로 폴백하면 잘못된 키로 암호화→복호화 불일치가 나므로. 한도 맞은 키는 `markKeyCooldown`으로 ~15분(`KEY_COOLDOWN_MS`) 뒤로 미뤄 헛 429 방지, `resolveKeys`가 쿨다운 안 걸린 키 먼저·마지막에 env 폴백(id=0)을 붙여 정렬. **화면엔 마스킹만**(`maskSecret` = 실제 길이만큼 점 최대 56 + 마지막 4자, codex auth.json 같은 긴 JSON은 길이만) — 평문 절대 미반환.

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
- **같은 라벨 버튼 2개 금지** — "원본 그대로 추가"가 ①상단 모드 토글 ②하단 제출 버튼 두 군데 있어, 파일을 드롭하면(즉시 처리됨) 하단 버튼이 `disabled`(textarea 비면 비활성=접근금지 커서)라 "버튼이 안 눌린다"고 오해. 하단 제출은 *붙여넣기 텍스트 전용*이었음. UI는 같은 행위에 한 진입점만(`HANDOFF.md` §0 2026-06-15).
- **dedup이 LLM 호출을 통째로 건너뛴 치명버그** — [AI로 분석] 시 `ingestText` 중복판정이 '원본 그대로'(`RAW_IMPORT`) 페이지를 '이미 분석됨'으로 오인 → `SKIPPED_DUP`으로 LLM을 건너뛰고도 "반영됨" 거짓표시(entities/concepts 미생성). 해법=dedup에서 `RAW_IMPORT` 제외. 재분석은 `{reanalyze:true}`로 기존 잡 삭제해 dedup 우회.
- **전역 boolean 진행상태 = 룸 간 누수** — ChatTab `streaming`이 전역이라 다른 룸 질의 중 '생각 중'·답변이 열린 화면에 끼어듦 → **룸별 `streamingScopes` + 답변을 질의 시작 룸으로 라우팅(`deliver`)**. 같은 룸 중복만 차단, 다른 룸 동시 질의는 허용.
- **Turbopack dev: 부모 `route.ts` 수정 시 형제 중첩 라우트가 재시작 전까지 404**(예: `app/api/wiki/route.ts` 고치면 `archive`·`ai-edit`가 404) → dev 서버 재시작 필요. **프로덕션 빌드/배포는 정상**(개발 환경 한정 함정).
- **★구독 CLI는 "런타임 CPU 명령어"에 막힐 수 있다 — claude-cli는 사내 노드 AVX 미지원으로 배포판 동작 불가**(코드/설정 무관, 순수 하드웨어). Claude Code는 **Bun으로 컴파일**돼 바이너리에 AVX 명령이 박혀 있어, AVX 없는 사내 노드(`<사내노드>`)에서 실행 시 `Illegal instruction (core dumped) / CPU lacks AVX support`(SIGILL)로 크래시. 진단은 노드 라벨 `kubectl get nodes -o json | grep -i avx` 또는 busybox pod로 직접 확인 → **클러스터 전 노드 AVX 없음** 결론. 해법은 소프트웨어로 못 넘김 → **배포 이미지에서 claude-code 설치 제거**(Dockerfile), claude-cli는 **로컬 전용**(운영자 PC는 최신 CPU). ★대조 = codex는 **Rust 바이너리**라 AVX 무관 → 배포 정상★(같은 "구독 CLI"라도 런타임이 다르면 결과가 갈림 — Bun=AVX 필요 vs Rust=무관). 무료·빠름·비공개 트릴레마의 **하드웨어 축**이 또 한 번 결정적이었던 사례(세션 68cccbe2, `docs\18` §10, `HANDOFF.md`).
- **구독 CLI 토큰은 CI 변수가 아니라 서버 Secret에 직접** — `CLAUDE_CODE_OAUTH_TOKEN`을 GitLab CI 변수로 넣는 경로를 추가했다가 철회: 앱은 `envFrom: secretRef`로 Secret을 읽으므로 **키가 그 Secret 안에만 있으면 됨**. CI 변수가 안 먹는 환경에선 서버에서 kubectl로 직접 Secret에 추가하는 게 정답이고, **CI 변수 경로를 남겨두면 나중에 `service-deploy`가 (빈 CI 변수로) 수동 주입한 토큰을 빈 값으로 덮어쓰는 함정**이 된다(세션 68cccbe2).
- **"화면이 안 보인다/게이지가 안 뜬다"의 진짜 원인이 미배포인 경우** — 코드 수정은 끝났지만 **푸시·배포 미반영**이라 실서버에 안 떠 있던 사례 반복. 동작 안 하면 *배포 상태부터* 확인. (CI가 `kubectl set image`만 하면 매니페스트 변경분(볼륨 등)은 자동 반영 안 됨 → `apply -f`/`patch` 필요, `HANDOFF.md` §0.)
- **★유료 공급자 과금 안전은 한 겹으로 안 끝난다 — 다층 게이트가 필요**(적대적 리뷰 결론): ① 폴백을 OpenAI 안에 가둠(무료로 캐스케이드 금지), ② 유료(openai·anthropic) 모델엔 UI '유료' 뱃지 + 선택/실행 시 확인 팝업(옵션 클릭·팝업 [분석]·배치 [처리 시작] 3지점), ③ 기본 공급자는 무료(Gemini) 유지, ④ 관리자 `DAILY_TOKEN_LIMIT` 상한. **키를 넣으면 자동 활성**이라 결제키 등록 = 즉시 과금 가능 → 경고 없이는 "실수로 유료 호출" 위험. (codex/claude-cli=구독·gemini/groq=무료는 비경고.)
- **★암호화 시크릿 저장은 '값을 절대 흘리지 않는' 표면을 다 막아야**(적대적 리뷰 수정): 복호화 실패 행은 **값 미로깅**(행 id·슬롯만 경고), 관리자 API POST 오류는 **일반 메시지만 반환**(키/스택은 서버 로그에만), 마스터키 형식오류는 throw(조용한 폴백 금지), 암호문 형식(`iv:tag:ct`) 검증, reorder id 배열 NaN 검증. 화면은 마스킹만·평문 미반환. 키 누출 표면 = 로그·에러응답·DB 평문이 전부 닫혀 있어야 함.
- **구독·종량 키는 CI 변수가 아니라 서버 Secret(DB+SECRET_ENCRYPTION_KEY)에** — 이전 claude-cli 함정(CI 변수 경로가 나중에 빈 값으로 덮어씀)의 일반화: 이제 키는 **관리자 UI→DB 암호화**가 1순위, env(서버 Secret)가 폴백. CI 변수로 키를 주입하는 경로는 만들지 않는다. 배포 전 `migrate-job`으로 provider_secrets 테이블 + Secret에 `SECRET_ENCRYPTION_KEY`가 있어야 복호화 가능(없으면 SESSION_SECRET 파생으로 동작은 하나 **마스터키 교체 시 기존 암호문 전부 복호화 불가**가 되므로 운영 키 고정 권장).

## 미해결 / 다음에 이어가면
- **SSO 실배포 HOLD**: SP 코드 완료, secret 주입·IdP 공동배포 사람 신호 대기(순서 IdP→SP, `docs\sso-cowork-agents.md`). 가동 시 `SSO_*` 주입 + `PILOT_AUTH` 끄기로 코드 무변경 전환.
- **진짜 무중단**: 현 replicas:1+Recreate는 배포 시 수 초 blip. 쓰기락 크로스파드화 후 RWX+replicas2 확장(`docs\18` §0).
- pgvector 의미검색(외부 임베딩 의존 연기), 개인위키 BYO Hermes/Obsidian(연기). 100명 동시성·GPU 파일럿은 Phase C 재논의.
- LibreOffice 변환 happy-path는 soffice 설치 배포 컨테이너에서 실문서 검증 필요. 위키 서브탭 간 스크롤 보존 연기.
- **scope별 위키 초기화(어드민 전용)**: 배포 k8s의 `common` 위키 지식을 비우려 했으나 — 로컬 `npm run wiki:init`(`scripts/wiki-init.mjs`)는 배포 클러스터엔 무의미. 어드민 전용 '위키 초기화' 버튼(scope 단위, `common`만·`personal`/`project-*` 보존)이 정답: 기존 ADMIN 게이트 + `withWikiWriteLock`/`commitAll` 단일 라이터 + `canManageScope`에 그대로 얹힘. 단 **md 파일뿐 아니라 DB 메타(Source·임베딩·QueryLog)도 같은 scope를 참조**하므로 초기화 깊이를 정해야 함. 설계까지 진행·구현 대기(세션 bc5bec65, 2026-06-16).
- **codex CLI의 k8s 샌드박스 실동작 검증**(2026-06-15 실서버 시드·실응답까지는 확인, 컨테이너 Landlock 미지원 시 `danger-full-access` 폴백). 단일 구독 5h/주간 한도가 전사 공유라 동시사용 시 소진.

---
출처:
- `E:\llm-wiki\README.md`, `CLAUDE.md`, `HANDOFF.md`(§0: 2026-06-14·06-15·06-16), `OVERNIGHT-STATUS.md`, `package.json`
- `E:\llm-wiki\docs\01·03·06·07·09·15·17·18`, `MASTER-PLAN.md`, `PLAN-curation-hybrid.md`, `PLAN-model-prompt-strategy.md`(§6 codex·프롬프트전략), `PLAN-local-llm-operation.md`, `PLAN-free-paid-upload-gating.md`
- `lib\codex.ts`·`lib\openai.ts`(유료 OpenAI 어댑터·A/B 파라미터)·`lib\secrets.ts`(BYOK AES-256-GCM·회전)·`lib\fallback.ts`(OpenAI 전용 폴백 체인)·`lib\ingest.ts`(buildAugmentSystem·supersedeRawPage)·`lib\models.ts`(ingestModelChoice·recommendIngestModel·bestReasoning)·`app\api\admin\secrets\route.ts`(ADMIN 게이트)
- `chats\INDEX.md`(세션 색인). 2026-06 신규 세션: 자료 드래그·드롭 업로드 버그(10cf2565), docker 재기동·프라이빗 질의·결재요청(03bf49fb), **intellij 복구·위키 초기화 설계 + 유료 OpenAI 공급자 + 관리자 BYOK(AES 암호화·다중키 회전) + 적대적 리뷰**(bc5bec65 — ~0.3MB→10.8MB로 확장, 2026-06-16~18), **아카이브 룸 사이드바 복구 + claude-cli(6번째 공급자) 추가·AVX 배포한계**(68cccbe2, 2026-06-16~17)

관련: second-brain `rails/model-tiers.yaml`(tier 라우팅) ← 이 프로젝트의 공급자 추상화·tier 폴백이 직접 영감.
