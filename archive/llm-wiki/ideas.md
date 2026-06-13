# llm-wiki — 아이디어 / 백로그 / 미실현 스파크

> 진행 중 떠올랐지만 아직 안 한 것들. 향후 `/creative` 의 prior-art 입력이 될 수 있다.

## 하려다 만 것 (backlog)
- **pgvector 의미검색**: LLM Wiki를 1차로 두되 벡터를 *후보 선정 보조*로만 쓰는 하이브리드로 설계에 정식 포함했으나, 외부 임베딩(Voyage 등) 의존이라 연기(`E:\llm-wiki\docs\15-search-cost-retention.md`, `docs\03-architecture.md` §3). 인덱스·index.md 라우팅 고도화도 후속.
- **개인 위키 BYO Hermes/Obsidian**(`docs\14-personal-wiki-byo.md`): 단일 파워유저 가치라 연기.
- **agora 게시판 커넥터**(소스 ④): read-only 배치 + 실명·공개 보드 allow-list만. 설계만 있고 미구현(`docs\06` §5).
- **SSO 실배포**: SP 코드 완성, IdP 공동배포·secret 주입만 남음(HOLD).
- **거버넌스 잔여**: 공통기여 신뢰도 자동/검토 자동분기, diff 프리뷰 고도화.
- **인제스트 Batch 처리**(야간 비실시간 비용↓), 단순 판정은 Haiku 위임.

## 떠오른 스파크 (다른 프로젝트로 분화 가능)
- **공급자 추상화 어댑터 자체가 자산**: `callStructured`로 anthropic/ollama/gemini/openai-compat를 한 인터페이스로 구조화 JSON 강제 — 비용/프라이버시 라우팅이 필요한 어떤 프로젝트로도 일반화 가능(second-brain의 `rails/model-tiers.yaml` tier 라우팅과 직결).
- **git을 진실의 원천으로 쓰는 LLM 산출물 저장소** 패턴 — provenance·blame·revert가 공짜인 "AI 산출물 = append-only git" 모델은 second-brain 파이프라인 산출물 관리에도 적용 가능.
- **다중 포맷 추출 레지스트리**(`extractAsset`): 원본 보존 + 결정적 파서 정규화 + 비전/LibreOffice 폴백 — 독립 라이브러리로 떼어낼 만함.
- **"질의가 곧 협업 자산"** 컨셉: 채팅 Q&A를 턴 단위로 공유 지식에 파일링하는 메커니즘.

## 개선 아이디어 (이 프로젝트를 다시 한다면)
- 처음부터 **PostgreSQL로 시작**(MVP SQLite→PG 전환 비용). docker-compose 메타DB를 1일차에.
- **사용자/룸별 공급자 토글**(현재 전역 `.env` 런타임 고정) — 하이브리드를 세밀 제어.
- 로컬 모델 한계를 **task 단순화로 먼저 설계**(구조는 코드, 모델은 콘텐츠만)했다면 `/1` 경로 버그를 우회.
- 한글/인코딩 테스트 하니스를 node 기반으로 처음부터 표준화(셸 인라인 금지 교훈을 도구로).
