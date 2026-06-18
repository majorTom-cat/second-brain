# memory 색인

`/retro` 가 읽고 갱신하는 라우팅 색인. 다음 프로젝트의 창작/개발/배포가 관련 교훈을 빠르게 찾게 한다.

## 카테고리별 교훈 포인터

- **창작(spec)**: 수렴(ingest) 모드(문서→REQ표 / 변경인입 CR) → [patterns/ingest-convergence.md](patterns/ingest-convergence.md), [lessons/rail.md](lessons/rail.md)
- **개발(dev)**: rough/full 2단계 rigor · **진입점 기동 smoke 강제**(단위/통합 green ≠ 실행됨; Windows main-guard) → [lessons/rail.md](lessons/rail.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **배포(deploy/ops)**: 외부 repo 산출 타깃(레지스트리+경로해석) · **배포가능 서비스 OPS REQ(health·graceful·bind) 선반영** → [patterns/external-project-layout.md](patterns/external-project-layout.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **tier/비용**: R4a 활성 — `[tier: bulk]`→**Sonnet** 서브에이전트 위임 / `[tier: judgment]`→메인(Opus). 계약 `rails/routing.md`·`model-tiers.yaml`(다이얼 haiku/sonnet/opus). R4b(로컬 qwen/Gemini 진짜 $0)는 옵션 → [lessons/rail.md](lessons/rail.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **archive 엔진**: churn 억제(ts 안정 write·활성세션 제외·임시폴더 무시) + distill 결과 단정 금지(`⚠️확인요망`) → [lessons/rail.md](lessons/rail.md) (2회차)
- **검증/리스크**: ✅ **레일 1바퀴 완주**(todo-toy: creative→develop→deploy 실검증, 실버그 1건·OPS 보강 2건 회수) → [lessons/todo-toy.md](lessons/todo-toy.md)

<!-- 형식: - <키워드> → [lessons/<slug>.md](lessons/<slug>.md) 또는 [patterns/<name>.md](patterns/<name>.md) -->
