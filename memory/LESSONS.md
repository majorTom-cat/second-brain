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
- [bns-intranet](lessons/bns-intranet.md) (2026-06-18) — **첫 실배포(deploy-only)**: 기성 클러스터엔 prior-art **전체 설정 선채택**(CSI노드·CPU/MariaDB·공용pull시크릿·dind·gradle내장이미지 — 부분만 옮겨 6연속 실패) + **`validate`면 스키마 변경 자동 반영 X**(수동 ALTER/Flyway 권고) → 반영: [patterns/intranet-deploy.md](patterns/intranet-deploy.md) 실배포 함정 보강.
- [rail 6회차](lessons/rail.md) (2026-06-19) — bns-intranet 실배포가 드러낸 **capture≠apply≠verify**(prior-art 있었는데 6실패 + grep만 해서 llm-wiki 자동스키마를 "수동"이라 2번 오답) + **패턴이 요약distill 한계로 불완전**(entrypoint 자동마이그레이션 누락) + **/retro §0가 deploy-only/회사 프로젝트 안 거름** → ✅R1(§0=`ingest auto`로 회사 자동수집 제외)·R2(deploy-runbook intranet 체크리스트) 빌드 + 패턴 보강·스키마전략3.
- [rail 7회차](lessons/rail.md) (2026-06-20) — **"테스트 done" 거짓완료**: 다른 세션이 시안 받아 "개발+테스트 완료" 보고했으나 버튼·링크 죽고 시안과 다르게 뭉뚱그림(green ≠ 시각 일치·링크 배선). full 경로에 UI 관찰 게이트가 없던 갭 → ✅U1(critic 7번 UI 차원)·U2(req-implementer UI는 관찰 없이 done 금지)·U3(/develop done조건+UI smoke)·U4(DEV.manifest `ui_verified`+acceptance 강제). **승격**: [patterns/verify-by-observation.md](patterns/verify-by-observation.md)(done = green 아니라 직접 본 동작; todo-toy 진입점 smoke + intra 거짓안심과 한 뿌리).

<!-- 형식:
- [<slug>](lessons/<slug>.md) — <한 줄 교훈> → 반영: <레일 수정 요약 또는 patterns/<name>.md>
-->
