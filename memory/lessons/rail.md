# 교훈 — rail (레일 자체) · 2026-06-16

> 첫 `/retro`. `projects/<slug>/` 정식 생성물이 아직 없어, 소스를 **아카이브 distill 교훈**으로 잡음:
> `archive/agora/{knowledge,ideas}.md`(CR-001/v4.1 라운드), `archive/second-brain/{knowledge,ideas}.md`(intra 실사용+기획자 피드백),
> `archive/llm-wiki/{knowledge,ideas}.md`(공급자/tier). 외부·아카이브 프로젝트에서 **레일이 무엇을 못했나**를 모음.
> ⚠️ 제안일 뿐 — 레일 변경은 사람 승인 후. (company-internal 일반화 유지)

## 무엇이 잘 됐나
- **산출물=인터페이스 + 게이트** 모델이 아카이브에도 그대로 통함: distill을 모듈 안 critic(누출 스캔)으로 self-check, 게이트(비밀·사내정보)에서 정지.
- **REQ-ID 척추**가 agora v4.1 변경 라운드에서 crosswalk(구REQ→신REQ)로 추적 가능했음 — 요구 누락 0.
- **민감도를 데이터 옆에** 둔 archive 정책(회사=raw gitignore)이 자동 확장돼, 3개 프로젝트 동시 distill·푸시에서 누출 0.

## 어디서 마찰이 있었나 (근거 인용)
1. **변경 인입(change-intake) 게이트가 레일에 없다.** agora는 기획팀이 PRD v4.1(요구·프로토타입·acceptance·dev노트 4종)을 `resource/changes/` 로 던졌고, 기존 v3.0 코드에 **델타**를 입혔다(CR-001). 레일은 *그린필드 아이디어→스펙*만 가정 → 기존 프로젝트에 변경을 받는 경로·게이트·REQ crosswalk·불변식(익명성/해시) 상속 강제가 없음. (근거: `archive/agora/knowledge.md` "개선 라운드 v3.0→v4.1", `ideas.md` "CR change-intake rail" 스파크)
   - ★**보강(사용자 정정 2026-06-16) — "기존 수정 vs 그린필드"는 게이트의 첫 분기다.** agora는 "기존 수정이 빠르다"를 택했으나, 받은 **새 디자인**을 입히는 단계에서 구현이 자꾸 **기존 UI로 회귀**(기존 코드·컴포넌트 관성 = gravity)해 받은 디자인과 어긋났고, **결국 인플레이스를 폐기→`intra` 그린필드로 재시작**했다. 즉 change-ingest 가 **항상 옳지 않다**: 점진 델타면 인플레이스가 맞지만 **전면 리디자인이면 그린필드**가 낫다(재사용 절감 < 관성 비용). → 변경 인입 게이트는 받자마자 **설계 거리(델타냐 리디자인이냐)를 먼저 판정**하고 경로를 가르는 단계를 가져야 한다. 인플레이스를 택해도 critic은 "옛 화면이 아니라 **받은 디자인**과 대조"를 강제해야 한다. (근거: `archive/agora/knowledge.md` 함정 "기존 코드 관성", `archive/second-brain/knowledge.md` intra 출생 배경)
2. **명령이 `projects/<slug>/` 를 하드코딩** → 외부 repo 타깃 미지원. intra(E:\intra)·agora·llm-wiki 전부 외부인데 레일은 내부 `projects/` 만 안다. (근거: `archive/second-brain/knowledge.md` "레일 첫 실사용 — intra")
3. **`/creative` 가 아이디어 발산 전제** → 기획 문서가 먼저 오는 프로젝트(intra·agora)에 안 맞음. 발산 대신 **수렴(ingest)** 이 필요(문서→번호docs+REQ표, 화면 1개=`REQ-SCR`). (근거: 동상)
4. **rough vs full rigor 미분리** → 디자이너 반복형 UI에 풀 rigor(화면별 테스트·6차원 critic·worktree)는 throwaway 과투자. 러프엔 생략, 스택만 최종 목표 기준으로. (근거: 동상)
5. **전달 방식·용어가 산출물만큼 중요한데 핸드백 템플릿에 없음.** intra 러프를 정적 PNG 48장으로 전달 → 이미 구현된 반응형/햄버거가 "안 보여서" 기획자가 "프로토타입 아님"이라 오해. 자동생성 GNB가 전체 33화면 인벤토리를 사용자 메뉴처럼 노출. (근거: `archive/second-brain/knowledge.md` "기획자 피드백 라운드", `ideas.md` HANDBACK/`menu_visible`)
6. **tier 라우팅(R4)이 미구현** → `[tier: bulk/judgment]` 태그는 의미만 있고 실제 무료/유료 라우팅이 없음. llm-wiki에 검증된 공급자 추상화·폴백·tier별 프롬프트 재선택·비용 라우팅이 그대로 포팅 대상. (근거: `archive/llm-wiki/knowledge.md` 공급자 추상화·폴백, `ideas.md` 스파크 1)

## 레일 수정 제안 (diff 식, 우선순위)

### P1 — 외부 타깃 지원 (다른 모든 개선의 선결)  ✅ 완료 2026-06-16
- [x] **신규** `rails/projects.yaml`: `slug → {root, layout(internal|external), deploy_profile}` 레지스트리. intra 등록.
- [x] **신규** `rails/project-paths.md`: 경로해석 규약($DOCS/$META/$STATE/$CODE). external = `<root>/docs/`(문서)+`<root>/`(코드)+`<root>/.rail/`(메타·상태). **미등록 slug = 기존 `projects/<slug>/` 동작 유지(하위호환).**
- [x] **수정** `/creative`·`/develop`·`/deploy`·`/retro`·`/status` 명령: `projects/<slug>/` 하드코딩 → 경로해석 변수로 교체. status 는 등록된 external 도 스캔.

### P2 — 수렴(ingest) 모드 + 변경 인입 게이트  〔승격 후보〕  ✅ 빌드 완료 2026-06-18
- [x] **수정** `/creative` 명령 + `spec-author` 스킬: 모드 분기 추가(발산 자동/수렴 자동 판별, 발산 경로 유지).
  - (a) **greenfield-ingest**: 기획 문서(요구·화면기획·프로토타입) → 번호 docs + REQ표, 화면 1개=`REQ-SCR`. _(intra)_
  - (b) **change-ingest**: 기존 프로젝트에 델타 인입. `<repo>/resource/changes/` → `docs/changes/CR-NNN` 규약, **REQ crosswalk(구→신) 표 강제**, 핵심 불변식(익명성·단방향 해시 등) **상속 검증을 critic 차원에 추가**. _(agora CR-001)_

### P2 — rough/full 2단계 rigor  ✅ 완료 2026-06-16
- [x] **수정** `/develop` 명령 + `req-implementer` 스킬: `rough` 모드(스캐폴드+화면, 화면별 테스트·6차원 critic·worktree **생략**, 빌드만 게이트) vs `full` 모드. 스택은 **최종 목표 기준** 선택 강제. 인자 `/develop <slug> [rough|full]`, 기본 full. rough 는 HANDBACK 산출·`/deploy` 거부.

### P3 — 핸드백 품질 (작지만 반복될 마찰)  ✅ 완료 2026-06-16
- [x] **신규** `rails/handoff/HANDBACK.template.md`: `deliverable_stage`(rough-skeleton|hifi-prototype|final) 라벨 + `recommended_delivery`(정적 PNG 금지 → 라이브 링크/프리뷰) 필드 + 화면 인벤토리.
- [x] **규약** `menu_visible: bool`: req-implementer 가 네비 자동생성 시 `menu_visible: true` 화면만 상위 메뉴 노출(흐름내/개발용은 false). 선언 위치 = REQ-SCR 항목. HANDBACK 인벤토리에 컬럼.

### P3 — tier 라우팅 엔진 (R4)  ✅ R4a 완료 2026-06-18 / ⏸ R4b 옵션
- [x] **R4a(하네스 내, 설정0)**: `rails/routing.md`(라우팅 계약) + `rails/model-tiers.yaml`(active_profile: r4a, bulk→Haiku) + `CLAUDE.md` 배선. `[tier: bulk]` step 은 `Agent`/`Task` 를 `model: haiku` 로 위임, judgment 는 메인(Opus). 핵심 깨달음: 레일이 Claude Code 안에서 도니 "라우팅"=서브에이전트 모델 위임(외부 스크립트 불필요). 싸지나 무료는 아님.
- [ ] **R4b(옵션·미구현, 진짜 $0)**: `rails/route.mjs` 디스패처 + `.env` 로 bulk→로컬 qwen(Ollama)/Gemini 무료. llm-wiki `lib/anthropic.ts`·`cost.ts`·`fallback.ts` 포팅. ⚠️ 소형 로컬모델 구조화 실패율↑·민감자료 외부금지.

## 승격됨 (2026-06-16 게이트 승인 — 2+ 프로젝트 반복)
- ✅ **수렴(ingest) 모드**: intra(greenfield) + agora(change) → [`patterns/ingest-convergence.md`](../patterns/ingest-convergence.md).
- ✅ **외부 repo를 산출 타깃으로**: intra 명시 + agora·llm-wiki 모두 외부 → [`patterns/external-project-layout.md`](../patterns/external-project-layout.md).

## 게이트 결정 (2026-06-16)
- 승인: 색인 기록(LESSONS·index) + 위 2개 패턴 승격.
- ✅ **P1 외부타깃 빌드 착수·완료**(2026-06-16): `rails/projects.yaml`·`rails/project-paths.md` 신설, 5개 명령 경로 변수화. 하위호환 유지(미등록 slug=기존 동작). 아직 external 프로젝트에 명령 실제 실행은 안 함(P2 인입 모드가 선결).
- ✅ **P2-b(rough/full) + P3(핸드백·menu_visible) 완료**(2026-06-16): `/develop [rough|full]`, `req-implementer` rigor 모드 + `menu_visible` 규칙, `rails/handoff/HANDBACK.template.md`. 아직 external 프로젝트에 실제 실행은 안 함(검증은 다음).
- ✅ **P2-a(수렴/ingest 모드) 빌드 완료**(2026-06-18): `/creative` 모드 자동 판별(발산 vs 수렴) + `spec-author` greenfield-ingest·change-ingest 절차. 보류 조건(발산 경로 유지 + 모드 자동 판별) 충족. **⏸ intra 실제 실행은 디자이너 화면 디자인 파일 대기 중이라 보류** — 지금 태우면 스펙이 또 바뀌고 러프 작업과 겹침(디자인-퍼스트). 파일 도착 시 `/creative ingest intra` → 게이트 → `/develop intra rough`.
- ✅ **UX: `/retro` 가 `/archive all` 을 자동 선행**(2026-06-18, 사용자 요청): 매번 둘을 따로 칠 필요 없게 — `/retro` 한 번 = 수집·distill(§0) + 레일 회고. `/archive all` 단독은 빠른 백업용으로 유지(매 백업에 무거운 회고가 붙지 않게 retro→archive 방향 선택).
- ✅ **R4a(tier 라우팅, 하네스 내) 완료**(2026-06-18): bulk→Haiku 위임, judgment→Opus. `rails/routing.md`+`model-tiers.yaml`+`CLAUDE.md`.
- **backlog(미착수)**: R4b(진짜 $0 로컬/Gemini, 옵션) · P-A(toy 1바퀴 실검증).

---

# 2회차 회고 (2026-06-18) — 빌드 누적 + 아카이브 churn
첫 회고 이후 P1·P2-b·P3·P2-a·retro-chaining 을 한 세션에 몰아 빌드한 뒤, `/retro`(=archive all 자동선행)를 처음 돌리며 나온 마찰.

## 마찰 (근거: 이 세션 실행 관찰)
1. **레일 변경이 전부 미검증으로 누적**. P1·P2-b·P3·P2-a·chaining 5건이 모두 *프롬프트(설명서) 수정* — 실제 프로젝트에 `/creative→/develop→/deploy` 를 **한 번도 안 돌렸다**. agora distill을 "성공"으로 잘못 적었다 사용자가 정정한 것과 같은 위험(검증 없이 "됐다"고 단정). 첫 실검증 대상=intra인데 디자인 파일 대기로 보류 → 미검증 빌드만 쌓임.
2. **아카이브 churn 이 `/retro` 자동선행으로 증폭**. ① README/SECRETS/SENSITIVE 의 타임스탬프가 매 실행 재생성 → 무변경에도 diff. ② `newSinceDistill` 이 **mtime 기반**이라 진행 중인 활성 세션(second-brain)이 매번 자기를 1로 표시하고, 재인제스트가 raw mtime을 갱신해 "재distill 권장"이 노이즈로 뜸. → `/retro` 가 archive를 매번 돌리니 이 churn·헛판단이 매 회고마다 반복.
3. **미등록 `...AppData\Local\Temp`(15 jsonl)가 매 실행 재등장**. 임시 폴더라 등록 대상이 아닌데 매번 "추가할까요?" 후보로 떠 노이즈.
4. **distill 정확성에 검증 비트가 없음**. agora "성공" 오기는 *사용자*만 잡았다. company-internal·복잡 세션의 distill 결론을 사실로 단정하면 틀려도 안 걸린다.

## 레일 수정 제안 (diff 식, 우선순위)
- **[P-A] 미검증 빌드 가시화 + 첫 실검증**: `/status` 또는 회고에 "빌드됐으나 end-to-end 미실행" 레일 기능 목록을 표시. 그리고 **작은 내부 프로젝트로 `/creative→/develop→/deploy` 1바퀴**를 돌려 입구들을 실제 검증(intra 대기와 무관한 toy slug로). → "레일 1바퀴 검증" backlog와 합침.
- **[P-B1] 타임스탬프 churn 억제**(엔진 `ingest.mjs`): README/SECRETS/SENSITIVE 의 생성시각을 **내용 해시가 바뀔 때만** 갱신(무변경 diff 0).
- **[P-B2] distill 트리거 정교화**(엔진): `newSinceDistill` 을 mtime 대신 **내용 비교**로, 그리고 **현재 활성 세션 제외**(자기 자신을 매번 새로 표시하지 않게).
- **[P-B3] 임시 폴더 무시 휴리스틱**(엔진 미등록 탐지): `AppData\Local\Temp`·`%TEMP%` 등 transient 경로는 unregistered 후보에서 기본 제외.
- **[P-C] distill 검증 비트**: company-internal/대형 세션 distill은 **결과(outcome)를 단정하지 말고** 불확실 항목을 "사용자 확인 요망"으로 표시(또는 distill 산출에 가벼운 critic 1패스). 코드 grep으로 그라운딩 가능한 주장만 단정.

## 적용 결과 (2026-06-18 게이트 승인 = P-B 3종 + P-C)
- ✅ **P-B1/B2/B3**(`ingest.mjs`): `writeStable`(ts 라벨 외 본문 동일하면 미기록) · `newSinceDistill` 활성세션 제외(`NOW-mtime>180s`) · `TRANSIENT_FOLDERS` 미등록 후보 제외. **재실행 검증**: 새세션 0(활성 제외 작동)·Temp 경고 사라짐·agora README/SECRETS 재실행 해시 동일(churn 0).
- ✅ **P-C**(`chat-archivist/SKILL.md` §3): distill 결과 단정 금지·불확실은 `⚠️확인요망`·게이트 전 self-check 1패스.
- ⏸ **P-A 보류**: "미검증 빌드 가시화 + toy 1바퀴 실검증"은 다음 작업으로(별도). 현재 레일 입구 5종이 end-to-end 미실행 상태인 점은 유효한 리스크.

## 승격 후보
- 없음(이번 마찰은 second-brain 레일/엔진 자체 한정 — 다른 프로젝트 반복 아님). P-B 계열은 엔진 버그픽스라 패턴 승격보다 직접 수정 대상.

---
근거 파일: `archive/agora/{knowledge,ideas}.md`, `archive/second-brain/{knowledge,ideas}.md`, `archive/llm-wiki/{knowledge,ideas}.md`, `E:\second-brain\CLAUDE.md`.
