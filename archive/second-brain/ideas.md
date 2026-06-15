# second-brain — 아이디어 / 백로그 / 미실현 스파크

> 진행 중 떠올랐지만 아직 안 한 것들. 향후 `/creative` 의 prior-art 입력이 될 수 있다.
> ⚠️ company-internal 분류(대화에 agora 언급) — 평문 raw 는 미푸시.

## 하려다 만 것 (backlog)
- **R4 — 비용 라우팅 엔진**: `[tier: bulk]`→무료(로컬 qwen/Gemini), `[tier: judgment]`→Claude 소액. `rails/model-tiers.yaml`+`.env`+일 예산. llm-wiki `lib/anthropic.ts`/`cost.ts` 포팅 대상.
- **레일 1바퀴 검증**: 작은 아이디어로 `/creative`→게이트→`/develop`→`/deploy`→`/retro` 한 사이클(첫 교훈으로 루프 닫기).
- **외부 프로젝트 레지스트리 + 경로 해석**: `rails/projects.yaml`(slug→root·layout·deploy_profile) + `rails/project-paths.md`. layout=external 이면 docs/+루트 코드+.rail/ 로 매핑 → 레일이 agora/llm-wiki 같은 외부 repo를 산출(미등록 slug는 기존 `projects/` 유지=하위호환). _(intra에서 도출)_
- **`/creative` 인제스트(수렴) 모드**: 기획 문서(요구사항·화면기획·프로토타입)가 먼저 있는 프로젝트는 발산 대신 문서→번호docs+REQ표 수렴. 화면 1개=`REQ-SCR`. _(intra)_
- **rough/full rigor 2단계**: 디자이너 반복형은 러프(스캐폴드+화면, 테스트·critic 생략) → 상세 디자인 회수 → 풀 rigor. 스택은 최종 목표 기준으로 선택해 러프가 실제 앱이 되게. _(intra)_
- **미등록 프로젝트 자동 등록 보조**: `/archive all` 이 미등록 폴더를 발견하면 repo 경로 추정 + 민감도 기본값(안전쪽=company-internal)으로 yaml 초안 제안.
- **distill 자동 트리거**: `newSinceDistill` 가 임계 넘으면 재정리를 자동 제안(현재는 표시만).

## 떠오른 스파크 (다른 프로젝트로 분화 가능)
- **archive 엔진을 독립 도구로**: "Claude Code 트랜스크립트 → 마스킹·색인·암호화 백업"은 second-brain 밖에서도 쓸 범용 유틸.
- **archive 지식 → /creative prior-art 자동 주입**: 새 아이디어 창작 시 `archive/*/knowledge.md` 를 자동 검색해 관련 노하우를 컨텍스트로.
- **회고 루프 보상의 정량화**: `/retro` 교훈이 템플릿/명령을 개선해 "N번째 프로젝트가 1번째보다 빠르다"를 실제로 측정.

## 개선 아이디어 (이 프로젝트를 다시 한다면)
- **타임스탬프 churn 제거**: README/SECRETS 의 생성시각을 내용 해시 변경 시에만 갱신(매 실행 diff 방지).
- **PS 스크립트 처음부터 ASCII** (PS5.1 UTF-8 오독을 도구 규약으로 박기).
- **민감도 분류를 인제스트 첫 단계 게이트로**: 신규 프로젝트는 분류 확정 전엔 raw 를 항상 gitignore(안전 기본값).
