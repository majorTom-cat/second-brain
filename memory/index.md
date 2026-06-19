# memory 색인

`/retro` 가 읽고 갱신하는 라우팅 색인. 다음 프로젝트의 창작/개발/배포가 관련 교훈을 빠르게 찾게 한다.

## 카테고리별 교훈 포인터

- **창작(spec)**: 수렴(ingest) 모드(문서→REQ표 / 변경인입 CR) → [patterns/ingest-convergence.md](patterns/ingest-convergence.md), [lessons/rail.md](lessons/rail.md)
- **개발(dev)**: rough/full 2단계 rigor · **진입점 기동 smoke 강제**(단위/통합 green ≠ 실행됨; Windows main-guard) · **UI REQ 는 시안대조+클릭스루 관찰 없이 done 금지**(green ≠ 시각 일치·링크 배선) → [patterns/verify-by-observation.md](patterns/verify-by-observation.md), [lessons/rail.md](lessons/rail.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **배포(deploy/ops)**: 외부 repo 산출 타깃(레지스트리+경로해석) · **배포가능 서비스 OPS REQ(health·graceful·bind) 선반영** → [patterns/external-project-layout.md](patterns/external-project-layout.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **tier/비용**: R4a 활성 — `[tier: bulk]`→**Sonnet** 서브에이전트 위임 / `[tier: judgment]`→메인(Opus). 계약 `rails/routing.md`·`model-tiers.yaml`(다이얼 haiku/sonnet/opus). R4b(로컬 qwen/Gemini 진짜 $0)는 옵션 → [lessons/rail.md](lessons/rail.md), [lessons/todo-toy.md](lessons/todo-toy.md)
- **archive 엔진**: churn 억제(ts 안정 write·활성세션 제외·임시폴더 무시) + distill 결과 단정 금지(`⚠️확인요망`) → [lessons/rail.md](lessons/rail.md) (2회차)
- **검증/리스크**: ✅ 레일 1바퀴 완주(todo-toy) · ⚠️ **검증 부채**(능력 폭증 vs 실검증 toy 1개) → `rails/validation-debt.md`(`/status` 표시) · 다음=intra 실검증 → [lessons/todo-toy.md](lessons/todo-toy.md), [lessons/rail.md](lessons/rail.md)

## 패턴 라이브러리 (`patterns/` — 승격된 재사용 패턴)
> 대부분 아카이브(agora·llm-wiki) 채굴로 승격(2026-06-18). `spec-author` 가 아이디어 유형별로 prior-art 참조.
- **아키텍처**: [constraints-as-truth](patterns/constraints-as-truth.md)(불변식=구조로 강제) · [single-permission-point](patterns/single-permission-point.md)(단일 권한 계산처) · [git-as-source-of-truth](patterns/git-as-source-of-truth.md)(AI 산출물=append-only git) · [soft-delete-hide-recover](patterns/soft-delete-hide-recover.md)(archivedAt 하나로 숨기고 복구)
- **배포**: [intranet-deploy](patterns/intranet-deploy.md)(사내 k8s 무중단+운영 플레이북) · [external-project-layout](patterns/external-project-layout.md)(외부 repo 산출 타깃)
- **창작/인입**: [ingest-convergence](patterns/ingest-convergence.md)(문서→수렴/변경인입) · [design-ready-skin](patterns/design-ready-skin.md)(구조 먼저·비주얼은 토큰 1패스)
- **검증**: [verify-by-observation](patterns/verify-by-observation.md)(done = green 신호가 아니라 직접 본 동작 — UI 는 시안대조+클릭스루, 서비스는 기동 smoke, 위임은 경계검증). 운영 도구 = `rails/false-done-checklist.md`(성장 목록 **A~H**: UI·서비스·권한·통합배포·동시성/멱등·비명백주입·게이트/레일자가무결성·시간축/비기능/정합성) + critic 8차원·생성형 프리모템 + `/retro` append(거짓완료 모드를 사람이 겪기 전에 능동 수확). 32확인갭 sweep=rail.md 8회차
- **LLM**: [llm-trilemma](patterns/llm-trilemma.md)(무료·빠름·비공개) · [llm-provider-routing](patterns/llm-provider-routing.md)(공급자 추상화·폴백·비용안전·BYOK = R4b 토대)

<!-- 형식: - <키워드> → [lessons/<slug>.md](lessons/<slug>.md) 또는 [patterns/<name>.md](patterns/<name>.md) -->
