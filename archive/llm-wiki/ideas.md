# llm-wiki — 아이디어 / 백로그 / 미실현 스파크

> 진행 중 떠올랐지만 아직 안 한 것들. 향후 `/creative` 의 prior-art 입력이 될 수 있다.

## 하려다 만 것 (backlog)
- **큐레이션 후보 뷰**: 저신뢰 ollama 페이지 + `answered:false`였던 질의 + 미정제 원문을 모아 운영자가 Claude Code로 끌어올리는 `/curate` 뷰(`docs\PLAN-curation-hybrid.md` §3·`PLAN-status-verification.md` §3). 앱 변경은 `curator` provenance 한 줄 수준, 나머지는 운영자 런북.
- **pgvector 의미검색**: LLM Wiki 1차 + 벡터를 *후보 선정 보조*로만 쓰는 하이브리드. 외부 임베딩 의존이라 연기(`docs\15-search-cost-retention.md`). index.md 라우팅·Postgres FTS는 인프라 추가 0(이미 PG16).
- **개인 위키 BYO Hermes/Obsidian**(`docs\14`): 단일 파워유저 가치라 연기.
- **agora 게시판 커넥터**(소스 ④): read-only 배치 + 실명·공개 보드 allow-list만. 설계만 있고 미구현(`docs\06` §5).
- **거버넌스 잔여**: 공통기여 신뢰도 자동/검토 자동분기, diff 프리뷰 고도화.
- **SSO 실배포**: SP 코드 완성, IdP 공동배포·secret 주입만 남음(HOLD).
- **유료 승격 경로**: 동일 어댑터로 무료 Gemini→유료 Gemini/Vertex(비학습)·Claude API로 키만 바꿔 승격(코드 무변경).

## 떠오른 스파크 (다른 프로젝트로 분화 가능)
- **공급자 추상화 + tier 폴백 어댑터 자체가 자산**: `callStructured`로 anthropic/ollama/gemini/openai-compat를 한 인터페이스로 구조화 JSON 강제 + 서빙모델 tier별 프롬프트 재선택 + 자동 폴백 — 비용/프라이버시 라우팅이 필요한 어떤 프로젝트로도 일반화(second-brain `rails/model-tiers.yaml` tier 라우팅과 직결).
- **"무료·빠름·비공개 트릴레마" 의사결정 프레임**: LLM 제품의 공급자 선택을 3제약(비용·프라이버시·하드웨어)으로 강제 좁히는 분석틀(`MASTER-PLAN.md`) — 사내 LLM 도입 어떤 프로젝트에도 재사용.
- **"라이브 LLM을 경로에서 빼고 검색·읽기형 + 운영자 생산"** 패턴: 느린/비싼 모델을 사용자 경로에서 제거하고 비동기 큐레이션으로 품질을 누적 — 비용·속도 제약이 큰 협업툴 일반화.
- **git을 진실의 원천으로 쓰는 LLM 산출물 저장소**: provenance·blame·revert 공짜 "AI 산출물 = append-only git" — second-brain 파이프라인 산출물 관리에도 적용.
- **다중 포맷 추출 레지스트리**(`extractAsset`): 원본 보존 + 결정적 파서 정규화 + 비전/LibreOffice 폴백 — 독립 라이브러리로 떼어낼 만함.
- **프로젝트 한정 토스트+소리 알림 훅**: 메인 세션 완료/온디맨드 테스트 알림을 프로젝트 스코프로 설정 — Claude Code 워크플로 자산.

## 개선 아이디어 (이 프로젝트를 다시 한다면)
- **트릴레마를 1일차에 못 박기** — Max≠API·GPU 없음·유출 금지를 처음에 인지했다면 "로컬 단독→하이브리드" 재설계 비용을 줄였을 것.
- 처음부터 **PostgreSQL로 시작**(MVP SQLite→PG 전환 비용). docker-compose 메타DB를 1일차에.
- 절대 URL을 **요청 호스트 기준으로 생성**(LAN 공유 깨짐 회피). `dev-login` 다중사용자를 처음부터.
- 로컬 모델 한계를 **task 단순화로 먼저 설계**(구조는 코드)했다면 `/1` 경로 버그 우회. 폴백도 tier별 프롬프트 재선택을 처음부터.
- 한글/인코딩 테스트 하니스를 node 기반으로 처음부터 표준화(셸 인라인 금지 교훈을 도구로).
