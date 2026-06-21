# LESSONS — 프로젝트 간 누적 교훈 (append-only)

> `/retro` 가 각 프로젝트에서 distill한 교훈의 **사람이 큐레이션한 다이제스트**.
> 여기에 쌓인 교훈이 레일(템플릿·명령·tier)을 점점 개선한다 = second brain의 보상.
> 한 줄 포인터만 둔다. 원본은 `lessons/<slug>.md`, 승격된 재사용 패턴은 `patterns/` 에.

## 🧭 핵심 원리 합본 (cross-cutting — 큰 그림) · 갱신 2026-06-21

> intra·agora·llm-wiki·bns-intranet·rail(회고 8)·todo-toy 의 교훈을 가로질러 합본. 아래 포인터·`lessons/`·`patterns/` 는 그대로(여긴 "판단의 뼈대"만). **레시피가 아니라 결정·트레이드오프·언제 같게/다르게.**

### ★ 단 하나의 뿌리 패턴: **capture ≠ apply ≠ verify** (잡는 것·쓰는 것·확인하는 것은 다 다르다)
거의 모든 큰 실패가 이 셋 중 하나의 갭이었다. 교훈을 *적는* 것만으로는 안 바뀐다("교훈만 쌓으면 뭐해, 또 반복" — 사용자).

1. **capture (잡기)** — 지금은 잘 됨. 지식 자체는 풍부히 쌓여 있다. 여기가 약한 고리는 아니다.
2. **apply (쓰기) — 제일 자주 깨지는 곳.** 교훈이 *있었는데* 작업 순간에 안 떠서 반복:
   - **위치 문제**: 작업 디렉터리가 `second-brain` 이면 대상(intra)의 `CLAUDE.md`·`lessons/intra.md` 가 **자동 로드 안 됨** → 시안 충실도 교훈이 기록만 되고 안 떠서 반복. → **교훈은 *로드되는 위치*에 둔다**(대상 `CLAUDE.md` + 이 세션이 읽는 `second-brain/CLAUDE.md` 양쪽). 대상 작업 시작 시 그 파일들을 **명시적으로 Read**. [[enforce-lessons-in-target-claude-md]]
   - **부분 채택**: prior-art/패턴을 *갖고도* 전체를 안 옮겨 실패(bns 배포 6연속 실패 — CSI노드·MariaDB·pull시크릿 등 전부 prior-art엔 있던 것). → 작업 시작 시 prior-art **전체 설정 선채택**. [[consult-prior-art-first]]
   - **grep만 하고 실코드 안 읽음**: llm-wiki entrypoint 자동스키마를 "수동"이라 2번 오답. → 추측·grep 전에 **기동 경로 실코드**를 읽어라.
3. **verify (확인) — "done"을 무엇으로 판정하나.** green 테스트·에이전트 자가보고·"likely faithful" = **대리신호**지 동작이 아니다. 죽은 버튼이 테스트 green, 시안과 딴판인 화면, 관리자에게 익명글 누수, admin이 익명 본문 열람 — 전부 green이었다. → **done = 직접 본 동작**. UI=시안 소스 대조+클릭스루, 서비스=기동 smoke, 권한=차단까지 테스트, 위임=경계 검증. [[done-means-observed-working]] · `patterns/verify-by-observation.md`

### ★ 실제로 통한 것 (긍정 패턴 — 다음에도 기본값)
- **시안은 *소스*로 대조**(스샷 눈비교 아님): HTML/CSS에서 `ti-*` 아이콘·문구 토씨·`:root` 색·구조를 파싱해 impl과 항목별 diff. 스샷은 최종 sanity만. [[compare-design-source-not-screenshots]]
- **갭은 병렬 적대 감사로 전수 수확** — 사용자를 영구 버그탐지기로 두지 말 것. 한 화면 지적받으면 형제(목록·작성·상세·게이트) 선제 감사. [[harvest-gaps-with-parallel-audit]] · [[fix-the-failure-class-not-the-instance]]
- **불변식은 DB가 강제**(EXCLUDE/CHECK/append-only 트리거·FK RESTRICT), UI는 보조. 다형참조엔 FK가 없으니 트리거로. (agora·intra 2회) `patterns/constraints-as-truth.md`
- **권한은 "허용"뿐 아니라 "차단"까지** 적대적으로 테스트(admin 차단·exec 허용).
- **빠른 피드백**: tsc → 영향 파일만 → 전체는 배경/체크포인트. **timeout = 가장 비싼 실패**. 배경 테스트 중 src/app 편집 금지(HMR이 깸). [[fast-feedback-not-timeouts]]
- **화면 패밀리 = 키트 재사용**: 첫 화면은 비싼 "키트"(파라미터화 공유 컴포넌트), 형제는 분할상환. `patterns/spec-screen-build-efficiency.md`
- **환경 깨놓고 넘기지 말 것**: 내 테스트가 공유DB 비번을 바꿔놓고 "확인해봐" 금지 — 넘기기 전 내가 먼저 `hong/intra1234` 로 되는지 밟아본다. [[dont-hand-back-broken-state]]

### ★ 레일 운영의 메타 교훈 (회고가 회고한 것)
- **레일은 *흐름*을 자동화하지 *품질*을 자동화하지 않는다.** 품질은 여전히 노력·반복·게이트 사람검수.
- **빌드 vs 사용/검증의 갈림길**: 능력은 폭증했는데(P1~R4a·패턴12) 실검증은 적으면 = **검증 부채**. 성숙·검증됐고 실대상이 있으면 **그만 만들고 써라**(레일 과축조 = 또 다른 grind). [[efficiency-over-per-project-grind]] · `rails/validation-debt.md`
- **deploy-only(남이 만든 걸 배포만)** 는 레일 파이프라인/archive 대상 아님 — 배포 교훈만 일반화, 타깃엔 문서 1장만. [[deploy-only-third-party-policy]]
- **정직한 메타 한계**: critic·게이트·distill 이 모두 한 세션 권한 안 → "레일이 자기를 속이는"(자가승인) 범주는 **탐지+규약**까지만(구조적 완전강제 미해결). 1인·감독 운영에선 사람이 게이트에 *있다*는 사실이 그 보증을 이미 제공 → 하드 분리(A)는 안 건다. 되돌릴 신호 = 무인 자동(cron)·다인 운영.

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
- [rail 7회차](lessons/rail.md) (2026-06-20) — **"테스트 done" 거짓완료**: 다른 세션이 시안 받아 "개발+테스트 완료" 보고했으나 버튼·링크 죽고 시안과 다르게 뭉뚱그림(green ≠ 시각 일치·링크 배선). full 경로에 UI 관찰 게이트가 없던 갭 → ✅U1(critic 7번 UI 차원)·U2(req-implementer UI는 관찰 없이 done 금지)·U3(/develop done조건+UI smoke)·U4(DEV.manifest `ui_verified`+acceptance 강제)·U5(반응형→능동: `rails/false-done-checklist.md` 성장목록 + critic 프리모템 + /retro append). **승격**: [patterns/verify-by-observation.md](patterns/verify-by-observation.md)(done = green 아니라 직접 본 동작; todo-toy 진입점 smoke + intra 거짓안심과 한 뿌리).
- [rail 8회차](lessons/rail.md) (2026-06-20) — **거짓완료 표면 능동 예측**(사용자: "내가 겪은 것만 말고 놓칠 것도 예측해 보완"): (a)인라인 + (b)멀티에이전트 sweep(10렌즈·47에이전트·**32 확인갭**) → ✅U6(체크리스트 A~H 확장: 신규 E 동시성/멱등·F 비명백주입·G 게이트/레일 자가무결성·H 시간축/비기능/정합성)·U7(DEPLOY.manifest 증거필드 dry-run≠pass/rollback_tested + GATE 템플릿 (a)/(b)/(c) 분리·열린결정 체크칸 + critic **차원 8 레일 자가무결성**). ✅2차(P-U1~4 + H 전부 적용): develop §5 통합검증(생존대조·cross-REQ왕복·통합critic재실행)·deploy §3 smoke충실도·lesson-distiller P-C·게이트 자가승인 차단(pending만 기재·approved_by/freshness 대조)·H 배선(시간축/정합성→deploy-runbook·RUNBOOK, NFR→02-req/spec-author, 위임자가검증→routing). ★메타한계: 레일이 한 세션 권한 안이라 '자기를 속이는' 범주는 탐지·규약까지(구조적 강제 미해결).

- [intra (2026-06-21 이어받기)](lessons/intra.md) — 충실도 마감+검증인프라. 전이교훈: **정본 소스 최신확인**(복사본 낡음 주의) · **시안 없는 추가도 갭**(union 자기면죄 금지) · **공유 pseudo-knob + 인라인 중복 = 이중 렌더 버그**(토글) · **.env=테스트/런타임 결합**(재시작) → [[cache-and-config-before-code]] · **메일 이미지 = CID 내장** · **인터랙션 요소는 진짜 작동**(장식 컨트롤도 누른다) · **무거운 변경은 컨텍스트 여유시**(정직한 체크포인트).

<!-- 형식:
- [<slug>](lessons/<slug>.md) — <한 줄 교훈> → 반영: <레일 수정 요약 또는 patterns/<name>.md>
-->
- [intra (2026-06-21 이어받기2)](lessons/intra.md) — 모달·드래그·인라인이미지·성능·버그. 전이교훈: **토스트 URL정리=history.replaceState**(router.replace는 서버재렌더로 토스트 깜빡) · **새 오버레이가 기존 클릭 막음**([[verify-by-observation]] elementFromPoint 진단·inline z-index) · **폼 기본선택은 busy 자원 회피**(데모데이터 충돌=멀쩡한데 깨져보임) · **평문→HTML 본문=저장형 XSS**(sanitize-html 화이트리스트+sharp재인코딩+내부src한정+저장·렌더 양쪽) · **의존성없는 새테이블은 DROP SCHEMA 없이 직접적용** · **dev 컴파일이 체감느림 큰몫**(prod빌드 권장) · **검증 fixture 진정성**(거부가 정상동작일 수). → 반영: `rails/false-done-checklist.md` A(라벨드컨트롤·오버레이클릭막힘·폼기본상태)·F(평문→HTML XSS)·G(fixture진정성) append.
