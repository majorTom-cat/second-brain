# LESSONS — 프로젝트 간 누적 교훈 (append-only)

> `/retro` 가 각 프로젝트에서 distill한 교훈의 **사람이 큐레이션한 다이제스트**.
> 여기에 쌓인 교훈이 레일(템플릿·명령·tier)을 점점 개선한다 = second brain의 보상.
> 한 줄 포인터만 둔다. 원본은 `lessons/<slug>.md`, 승격된 재사용 패턴은 `patterns/` 에.

## 색인

- [rail](lessons/rail.md) (2026-06-16) — 레일이 **외부 repo·변경 인입을 못 받음**(그린필드·발산 전제) → 승격: [patterns/ingest-convergence.md](patterns/ingest-convergence.md), [patterns/external-project-layout.md](patterns/external-project-layout.md). 반영: P1·P2-b·P3·P2-a 빌드 완료.
- [rail 2회차](lessons/rail.md#2회차-회고-2026-06-18--빌드-누적--아카이브-churn) (2026-06-18) — 빌드가 **end-to-end 미검증으로 누적** + 아카이브 **타임스탬프 churn·재distill 헛알림**이 `/retro` 자동선행으로 증폭 → 반영: 엔진 P-B(churn 억제·활성세션 제외·임시폴더 무시) + P-C(distill 결과 단정 금지). P-A(toy 1바퀴 실검증) 보류.
- [todo-toy](lessons/todo-toy.md) (2026-06-18) — 레일 **첫 end-to-end 1바퀴 완주**(P-A): 테스트 green인데 진입점 실행이 깨짐(Windows main-guard)·배포에서 OPS 뒤늦게 보강 → 반영: `/develop` **진입점 기동 smoke 강제(T1)** · `/creative` **배포가능 서비스 OPS REQ 선반영(T2)** · critic 검증가능성 문구(T3). bulk=Sonnet 전환.
- **아카이브 채굴** (2026-06-18) — agora·llm-wiki 의 검증된 노하우를 **재사용 패턴 8개로 승격**([패턴 라이브러리](index.md)) → `spec-author`(prior-art 참조)·`adversarial-review`(constraints/권한 차원)·`deploy-runbook`(intranet) 배선. = 과거 프로젝트 지식이 다음 프로젝트를 더 똑똑하게(second brain 보상).
- **열린 학습 구조** (2026-06-18) — 교훈·패턴을 *복제 레시피*가 아니라 **결정·트레이드오프·언제 같게/다르게**로(선택권 보존). `lesson-distiller`·`/retro`·CLAUDE.md + 패턴 10개 전부 정렬.
- [rail 3회차](lessons/rail.md) (2026-06-18) — **검증 부채**: 능력은 폭증(P1~R4a·패턴10·sweep)인데 실검증은 toy 1개 → 반영: `validation-debt.md` 트래커(V1)·sweep dedup+`_candidates.md` 백로그(V2). ★결론: **빌드보다 검증**(다음=intra).
- [rail 4회차](lessons/rail.md) (2026-06-18) — **intra-toy 검증이 드러낸 ingest/rough 품질 갭**: ① ingest가 화면목록만 먹고 프로토타입 미소비(시안 충실도 0) ② "러프=저품질" 오프레이밍(실 intra 러프는 고품질) → 반영: I1 spec-author 프로토타입 소비·I2 req-implementer 러프 품질 바+기동 smoke. ★레일은 흐름을 자동화하지 품질을 자동화 안 함.
- [rail 5회차](lessons/rail.md) (2026-06-18) — **그만 만들고 쓸 때**: 레일 성숙·검증됨, 회고 수익 체감, 제안 없음(의도). `bns-intranet`(사내 배포)은 **남이 만든 걸 배포만** → 레일 파이프라인/archive 대상 아님([[deploy-only-third-party-policy]]); 배포 교훈만 일반화 캡처. ★다음 교훈은 회고가 아니라 실전에서.

<!-- 형식:
- [<slug>](lessons/<slug>.md) — <한 줄 교훈> → 반영: <레일 수정 요약 또는 patterns/<name>.md>
-->
