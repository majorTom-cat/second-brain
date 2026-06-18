# memory 색인

`/retro` 가 읽고 갱신하는 라우팅 색인. 다음 프로젝트의 창작/개발/배포가 관련 교훈을 빠르게 찾게 한다.

## 카테고리별 교훈 포인터

- **창작(spec)**: 수렴(ingest) 모드(문서→REQ표 / 변경인입 CR) → [patterns/ingest-convergence.md](patterns/ingest-convergence.md), [lessons/rail.md](lessons/rail.md)
- **개발(dev)**: rough/full 2단계 rigor(러프=테스트·critic 생략, 스택은 최종목표 기준) → [lessons/rail.md](lessons/rail.md)
- **배포(deploy/ops)**: 외부 repo 산출 타깃(레지스트리+경로해석) → [patterns/external-project-layout.md](patterns/external-project-layout.md)
- **tier/비용**: R4a 활성 — `[tier: bulk]`→Haiku 서브에이전트 위임 / `[tier: judgment]`→메인(Opus). 계약 `rails/routing.md`·`model-tiers.yaml`. R4b(로컬 qwen/Gemini 진짜 $0)는 옵션 → [lessons/rail.md](lessons/rail.md)
- **archive 엔진**: churn 억제(ts 안정 write·활성세션 제외·임시폴더 무시) + distill 결과 단정 금지(`⚠️확인요망`) → [lessons/rail.md](lessons/rail.md) (2회차)
- **검증/리스크**: 레일 입구는 빌드됐으나 **end-to-end 미실행**(toy 1바퀴로 실검증 필요) → [lessons/rail.md](lessons/rail.md)

<!-- 형식: - <키워드> → [lessons/<slug>.md](lessons/<slug>.md) 또는 [patterns/<name>.md](patterns/<name>.md) -->
