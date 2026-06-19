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

# 3회차 회고 (2026-06-18) — 능력은 폭증, 검증은 toy 1개 (검증 부채)
R4a·Sonnet·아카이브 채굴(패턴 10개)·열린 학습 구조·cross-project sweep 까지 한 세션에 쌓은 뒤, 새 `/retro`(sweep+열린구조)를 처음 돌린 회고.

## 무엇이 잘 됐나
- **second brain 보상이 실제로 작동**: 과거 프로젝트(agora·llm-wiki) 노하우 → 재사용 패턴 10개 → 다음 프로젝트(intra)가 더 똑똑하게 시작.
- churn 수정(P-B) 지속 유효: 재distill 헛알림 0·Temp 미등장.
- 새 `/retro`(sweep) 첫 실행이 **스스로 작동 검증**: broad 패턴 0 신규(이미 다 승격)를 정확히 식별.

## 결정·마찰 (열린 교훈)
1. **★검증 부채 — 빌드 vs 검증의 갈림길.** 이 세션에 레일 *능력*을 대량 추가(P1·P2·P3·R4a·패턴10·열린학습·sweep)했지만 **실프로젝트 검증은 toy 1개(diverge→full→local)뿐.** ingest·rough·change-ingest·intranet-deploy·R4b·sweep 전부 **실프로젝트 미실행.** `/retro` 가 매번 *더* 만들어 부채를 키운다. → 트레이드오프: 계속 빌드(능력↑·검증 안 된 위험 누적) vs 검증 전환(느리지만 진짜 작동 확인). **언제 빌드: 갭이 명확하고 작을 때. 언제 검증: 미검증 능력이 쌓였을 때(=지금).** 첫 실검증 대상 = intra(디자인 파일 대기).
2. **cross-project sweep 자기 교훈(첫 실행).** ① **dedup 없음** — 이미 `patterns/` 에 있는 걸 매 sweep마다 재제안할 구조(이번엔 수동 회피). ② **도메인 특화 후보**(익명성·추출·동적게시판 등 1프로젝트)는 broad와 섞이면 노이즈 → 백로그로 분리해 매칭 프로젝트 올 때 승격.

## 레일 수정 제안 (열린 구조, 우선순위)
- **[V1] (메타·최우선) 검증 부채 가시화 + "빌드보다 검증 우선" 권고**: `/status`(또는 `/retro` 끝)가 "빌드됐으나 실프로젝트 미실행" 레일 능력을 표로 표시. `/retro` §3 에 "미검증 능력이 N개 이상이면 새 빌드보다 **검증을 권고**" 한 줄. (강제 아님 — 선택권은 사용자. 열린 권고.)
- **[V2] sweep 정교화(방금 만든 것 버그픽스)**: ① sweep은 `patterns/` 에 이미 있는 결정을 **제외**(dedup), 신규 후보만 제안. ② 1프로젝트·도메인특화 후보는 `patterns/_candidates.md` 백로그로(매 sweep 재분석 X), 매칭 프로젝트 올 때 승격.

## 적용 결과 (2026-06-18 게이트 = V1+V2)
- ✅ **V1**: `rails/validation-debt.md`(검증 부채 트래커, 현재 ❌6+⛔1) + `/status` §5 표시 + `/retro` §3 "검증 우선 권고".
- ✅ **V2**: `/retro` sweep 에 **dedup**(기존 `patterns/` 제외) + `memory/patterns/_candidates.md` 백로그(도메인특화 후보 7개).
- ★**결론(강제 아님)**: 다음은 빌드가 아니라 **검증** — intra 디자인 파일 대기. 이 회고가 자기 자신에게 "그만 만들고 검증하라"를 권고했고, 가시화 장치(validation-debt)까지 둠.

## 승격 후보
- 없음(broad 패턴은 이미 10개 다 승격). 도메인특화 후보는 V2 의 `_candidates.md` 백로그로 보류.

---

# 4회차 회고 (2026-06-18) — intra-toy 검증이 드러낸 ingest·rough 품질 갭
intra-toy 스탠드인을 실제로 띄워보니(Next dev 렌더) **실 intra 구현·프로토타입과 품질 차이가 큼**. 사용자가 그 갭을 짚어 나온 교훈.

## 무엇이 잘 됐나
- 검증 토이가 **실제로 기동**(Next dev 렌더·GNB·health) — 파일만 있는 게 아니라 돈다.
- 사용자가 "기존 intra/프로토타입과 차이 크다"를 즉시 포착 → 레일 한계가 드러남(검증의 본 목적).

## 결정·마찰 (열린 교훈)
1. **★ingest 입력 — 화면 목록만 vs 프로토타입·PRD까지.** 이번 ingest는 `docs/screens.md`(화면 *목록*)만 먹어 **시안 충실도 0**. intra `design-input/` 엔 **프로토타입 HTML·PRD·수용기준**이 있는데 안 읽혔다. 트레이드오프: 목록만=가볍고 빠름·but 비주얼/인터랙션 의도 소실 / 프로토타입까지=충실도↑·but 파싱(docx·html) 비용. **언제 목록만**: 프로토타입이 없거나 구조만 필요할 때. **언제 프로토타입까지**: design-input 에 시안이 *있을* 때(있는데 안 먹는 건 손해).
2. **★"러프 ≠ 저품질" — 같은 '러프' 지시가 전혀 다른 결과.** 실 intra도 *러프로* 지시했는데 33화면 클릭 가능·프로토타입 참조·다듬어진 결과. intra-toy 러프(=Sonnet 한 방·아키타입 6개·mock·프로토타입 미참조)는 훨씬 낮음. ⇒ **"러프는 의도적으로 못생긴 게 맞다"는 (내) 프레이밍은 틀렸다** — 러프의 *품질 바*는 실 intra 러프(클릭 가능·시안 참조·전 화면)다. 갭의 원인 = ① 프로토타입 미소비 ② 전 화면 아니라 아키타입만 ③ 한 방(반복 없음). 트레이드오프: 빠른 한 방=검증엔 충분·but 손으로 키운 러프 못 따라감 / 시안참조+전화면+반복=품질↑·시간↑. **언제 한 방**: 기계 검증. **언제 품질 바**: 기획자에게 실제 핸드백할 산출.
3. **레일은 *흐름*을 자동화하지 *품질*을 자동화하지 않는다.** intra급 = 프로토타입까지 먹이고 + full + 게이트마다 사람 반복. 한 방 러프로는 안 됨(레일은 가속·구조화, 품질은 여전히 노력·반복 의존).

## 레일 수정 제안 (열린 구조)
- **[I1] ingest가 프로토타입·시안을 소비**: `/creative` 수렴 모드 + `spec-author` greenfield-ingest — `design-input/`(또는 지정 경로)에 **프로토타입 HTML·PRD·수용기준이 있으면 함께 읽어** 비주얼/인터랙션 의도를 03-architecture·09 에 반영(화면 목록만으로 끝내지 않음). 없으면 목록만(현행). docx 등은 추출 비용 있으니 "있으면 소비" 휴리스틱.
- **[I2] rough 품질 바 명시 + 프로토타입 참조**: `req-implementer` rough 절차 — "러프=저품질" 아님을 명문화. 러프의 목표 = **전 REQ-SCR 화면 클릭 가능 + 프로토타입(있으면) 레이아웃 참조 + 디자인 토큰 골격**(아키타입 몇 개·mock 덤프가 아니라). 한 방 스캐폴드 후 **빌드 통과 + 진입점 기동 smoke** 까지(이번엔 띄워서 확인). "아키타입만/프로토타입 미참조"는 *검증용 축소*일 뿐 표준 아님.

## 적용 결과 (2026-06-18 게이트 = I1+I2)
- ✅ **I1**: `spec-author` greenfield-ingest — `design-input` 에 프로토타입·PRD 있으면 **반드시 소비**(목록만 X), 03·09 에 비주얼/인터랙션 반영.
- ✅ **I2**: `req-implementer` rough — **러프≠저품질 품질 바** 명시(전 화면 클릭 가능·프로토타입 참조) + 게이트에 **진입점 기동 smoke** 추가.
- 정정: "러프는 의도적으로 못생긴 게 맞다"(이전 프레이밍)는 틀림 — 품질 바는 손으로 키운 실 intra 러프.

## 승격 후보
- 없음(레일 ingest/rough 절차 자체 수정 대상).

---

# 5회차 회고 (2026-06-18) — 진짜 일이 왔다: bns-intranet (그만 만들고 쓸 때)
intra-toy 검증·정리 후 `/retro`. §0 아카이브에서 **새 실제 프로젝트**가 잡힘.

## ★발견 (§0 새 세션)
- **second-brain #6**: "E드라이브에 **bns-intranet** — **사내 서버에 배포**할건데?" → **남(동료)이 만든 프로젝트를 *배포만*** 하는 의뢰(사용자 본인 프로젝트 아님). ⇒ 정책 [[deploy-only-third-party-policy]]: **archive 금지·배포 교훈만 일반화·타깃엔 문서 1개만**. **레일 빌드 파이프라인 대상이 아니다**(만든 게 아니라 배포만). 단 `intranet-deploy` 패턴이 배포 *참조*로는 쓰임. ⚠️정정: 이 회고 초안이 "bns-intranet 을 레일에 태워 ❌ 검증"이라 적었으나 **틀림** — 사용자 설명으로 정정.
- llm-wiki #11(위키 출처/sha256) — llm-wiki 자체 작업(재distill 권장, 레일과 무관).

## 결정·마찰 (열린 교훈)
1. **★빌드 vs 사용의 갈림길 — 이제 사용 쪽.** 이 세션에 레일을 4~5번 회고하며 계속 만들고 고쳤다(P1~R4a·패턴10·열린학습·sweep·검증부채·ingest/rough 정정). 능력은 성숙했고 toy로 검증도 됐다. **이제 진짜 분기는 "또 만들기 vs 실프로젝트에 쓰기"** — bns-intranet 라는 **실제 대상이 생겼다**. 트레이드오프: 더 회고/빌드=완벽 추구·but 검증부채·수익체감 / 실사용=진짜 검증·교훈은 실전에서 / **언제 빌드**: 명확한 갭. **언제 사용(=지금)**: 성숙·검증됨·실대상 있음.
2. **(소) 러프 스캐폴드 runnability** — intra-toy 를 띄우려니 Sonnet 산출이 그대로는 안 돌았다(tsconfig 없음·Tailwind v3/v4 불일치·deps 미설치). I2 의 **진입점 기동 smoke** 게이트가 이걸 잡게 돼 있음(=커버됨). 추가 교훈: rough 스캐폴드는 **프레임워크 설정(tsconfig 등)까지** 포함해 *바로 떠야* 한다(smoke 가 강제).
3. **회고의 수익 체감.** 5회차째 — 새 broad 패턴 0(이미 10개), 새 능력 갭도 거의 없음. **회고가 회고를 부르는 단계는 끝.** 다음 교훈은 회고가 아니라 **실프로젝트(bns-intranet)** 에서 나온다.

## 레일 수정 제안 (열린 구조)
- **제안 없음(의도적).** 레일 성숙·검증됨. validation-debt 권고대로 **새 빌드 자제.**
- **bns-intranet 처리(정책, [[deploy-only-third-party-policy]])**: 레일 파이프라인에 **안 태운다**(남이 만든 걸 배포만). archive 등록 X · 배포는 `intranet-deploy` 패턴을 *참조*로 수행 · **배포하며 얻은 일반화 교훈만** `memory/lessons/` 에 · 타깃 repo 엔 `DEPLOY.md` **한 장만**(기존 소스·md 무수정).
- 남은 rail 파이프라인 ❌(external·change-ingest·intranet 배포)의 실검증은 **사용자 본인의 새 프로젝트**가 와야(bns-intranet 으론 안 됨 — 배포 전용이라 빌드 단계가 없음).
- (보류) llm-wiki #11 archive 재distill — 레일과 무관, 필요시 `/archive llm-wiki`.

## 승격 후보
- 없음. (도메인특화는 `_candidates.md` 백로그 유지.)

---
근거 파일: `archive/agora/{knowledge,ideas}.md`, `archive/second-brain/{knowledge,ideas}.md`, `archive/llm-wiki/{knowledge,ideas}.md`, `E:\second-brain\CLAUDE.md`. 4회차 근거: `projects/intra-toy/*`(검증 스탠드인)·실 `E:\intra`(읽기전용 비교). 5회차 근거: §0 새 세션(second-brain #6 bns-intranet).

---

# 6회차 회고 (2026-06-19) — 첫 실배포(deploy-only) bns-intranet: capture≠apply 가 생생히
`bns-intranet`(남이 만든 사내 Spring+SPA)을 사내 k8s에 **실제로 라이브 배포**. 레일 *파이프라인이 아니라* deploy-only(앱 소스 무수정)로. 실전에서만 나온 교훈.

## 무엇이 잘 됐나
- **deploy-only 정책이 실전서 버팀**: 앱 소스 0수정·신규 파일만(`deploy/`+루트 문서)·푸시 운영자 게이트. `/retro §0` mass-ingest 가 회사데이터를 개인 아카이브로 빨아들이려는 걸 **분류기가 자동 차단**(정책과 일치).
- 막힐 때마다 로그/이벤트로 **원인 확정 후** 진행(추측 배포 X). 로컬 Docker로 빌드·스키마생성·validate·/api 왕복을 매 단계 검증.

## 결정·마찰 (열린 교훈)
1. **★capture ≠ apply ≠ verify (생생히).** prior-art(agora/llm-wiki)·`intranet-deploy` 패턴을 *갖고 있었는데도* — ① 전체 설정을 선채택 안 해 **6연속 배포 실패**(CSI노드·CPU/MariaDB·registy-cred·dind·gradle.org·test게이트 — 전부 prior-art엔 있던 것) ② 나중에 `migrate` **grep만** 하고 llm-wiki 의 entrypoint `prisma db push`(자동 스키마)를 못 봐 **"수동"이라 2번 틀린 답**. → 약한 고리는 *캡처*가 아니라 **그 순간 surfacing + 실 코드(entrypoint/Dockerfile) 깊이 읽기**. 반영: [[consult-prior-art-first]] §4(grep 말고 기동경로 읽기).
2. **★패턴이 "요약 distill"의 한계로 불완전.** `intranet-deploy` 패턴이 archive `knowledge.md` *요약* 에서 distill돼, 실 repo 코드에만 있는 기법(**기동 시 entrypoint 자동 스키마 적용**)과 클러스터 함정들을 안 담았다. → 패턴은 **실 코드로 검증**해야. 반영: 패턴에 클러스터 함정 6 + 스키마 전략 3(자동 포함) 추가.
3. **/retro §0 가 deploy-only/회사 프로젝트를 안 거른다(레일 갭).** mass-ingest 가 bns-intranet 회사데이터를 개인 아카이브로 가져가려다 분류기에 막힘 — 옳은 차단이나, **레일이 스스로** deploy-only/company-internal 을 §0 인제스트에서 제외해야(분류기 의존 X).

## 레일 수정 제안 (열린 구조)
- **[R1] `/retro §0`+archive 가 deploy-only/company-internal 제외**: §0 mass-ingest 자동 스킵(분류기 의존 X). bns-intranet 류가 개인 아카이브로 안 새게.
- **[R2] `deploy-runbook` intranet 프로파일에 "prior-art 전체 선채택 체크리스트 + 스키마 전략 3"**: 패턴의 함정 6 + (A)수동/(B)기동시자동/(C)Job 을 runbook 체크리스트로 → 다음 intranet 배포의 6실패를 0으로.

## 적용 결과 (2026-06-19 게이트 = R1+R2 승인·빌드)
- ✅ **R1**: `.claude/commands/retro.md §0` 가 `ingest all` → **`ingest auto`**(개인만, `auto_push:true`)로 — 회사/deploy-only 자동수집 제외(이미 있던 `auto` 모드 재사용). `rails/archive-sources.yaml` 주석 보강.
- ✅ **R2**: `.claude/skills/deploy-runbook/SKILL.md` intranet 프로파일에 **prior-art 전체 선채택 체크리스트(함정6) + 스키마 전략3** 추가. 📐 라인에 bns-intranet 실검증 표기.

## 승격 후보
- 없음. intranet-deploy 패턴은 이미 승격돼 있고, 이번엔 그 패턴을 **정정·보강**(함정6·스키마전략3). validation-debt: **패턴은 실검증됨(deploy-only)**, 단 레일 `/deploy intranet` *명령/skill* 은 미실행 유지.

6회차 근거: 이번 세션 직접 관찰(bns-intranet 실배포 6실패·2오답·entrypoint 확인) + `E:\agora`·`E:\llm-wiki` 실 코드(`Dockerfile`·`docker-entrypoint.sh`).

---

# 7회차 회고 (2026-06-20) — "테스트 done" 거짓완료: green ≠ 관찰된 동작 (UI 게이트 강화)
실 incident. 다른 세션이 **디자인 시안을 받아 "개발+테스트 끝, 완료"** 라고 보고했는데, 사용자가 화면에 들어가 보니 **버튼·링크가 죽어 있고 시안과 다르게 뭉뚱그려** 구현돼 있었다. 사용자가 그 갭을 짚어 "이 실수를 반복 안 하게 지식을 쌓자" 로 캡처. (이번 세션은 레일만 업그레이드 — intra 현물 수정은 다른 세션 담당.)

## 무엇이 잘 됐나
- 사용자가 **green 보고를 곧이듣지 않고 직접 화면을 확인** → 거짓완료를 잡음(=이 패턴의 인간판). 레일이 자동으로 잡았어야 할 것.
- 같은 메타교훈이 이미 로그에 3번 흩어져 있었음(todo-toy 진입점 smoke · intra "에이전트 보고 믿지 말 것"·"거짓안심") → **승격 신호 충족**.

## 결정·마찰 (열린 교훈)
1. **★`done` 을 무엇으로 판정하나 — green 신호 vs 관찰된 동작.** 단위 테스트는 *로직*만 검증하지 *시각 일치·링크 배선*은 검증하지 않는다. 그래서 시안과 다르게 뭉뚱그리고 버튼이 죽어 있어도 테스트는 green 일 수 있다. green 하나를 done 의 대리로 쓰면 거짓완료가 게이트에 올라오고, 사람은 그 "완료"를 믿고 검토하므로 결함이 통과. 트레이드오프: green=빠르고 객관적·but 안 보는 차원이 있음 / 관찰=느리지만 사용자가 볼 형태를 직접 확인. **언제 green 충분**: 순수 로직·데이터·API(시각/인터랙션/기동 표면 없음). **언제 관찰 필수**: UI 화면·기동 경로·위임 산출·권한 불변식.
2. **레일 갭 — full 경로에 UI 관찰 게이트가 없었다.** rough 모드는 이미 "전 화면 클릭 가능 + 프로토타입 참조 + 기동 smoke"(4·5회차)인데, **정작 `done` 이 사는 full 모드**는 자체검증이 `npm test` 뿐이고 critic 6차원에 UI 충실도/인터랙션 차원이 없어, UI REQ가 렌더 관찰 없이 `done`/`verification: pass` 로 통과 가능했다.
3. **이미 발견된 교훈이 레일로 굳지 않으면 반복된다.** intra.md 의 "에이전트 보고 믿지 말 것"·"거짓안심"·"npm test 글로브" 가 *프로젝트 교훈*에만 있고 레일 게이트가 아니어서, 다른 세션이 같은 실수를 반복. capture≠harden(6회차 capture≠apply 의 친척).

## 레일 수정 제안 → 적용 결과 (2026-06-20 사용자 승인 "업그레이드 하자" = 적용)
- ✅ **[U1] `adversarial-review` 7번 차원 신설**: UI 충실도/인터랙션 배선. UI REQ 는 렌더 관찰 없이 통과 금지, 시안 불일치·죽은 버튼 = blocker. (강도조절에 "UI면 7번도 핵심")
- ✅ **[U2] `req-implementer` §3 + 규칙**: UI REQ 는 시안 대조 + 버튼·링크 클릭스루 **관찰 없이 `done` 금지**. "테스트 green" 과 "관찰된 동작" 분리 보고.
- ✅ **[U3] `/develop` §4·§5**: done 조건에 (c) 렌더 관찰 추가 · 진입점 smoke 를 UI 로 확장(각 `REQ-SCR` 열어 시안 대조+클릭스루, 실패면 루프백).
- ✅ **[U4] 계약/스펙 양쪽**: `DEV.manifest` UI REQ 에 `ui_verified` 증거 필드(없으면 done 금지) · `02-requirements`+`spec-author` 가 UI REQ acceptance 에 시각·인터랙션 관찰 기준 강제(목록만 옮기면 검증할 게 없음).
- ✅ **[U5] ★반응형→능동 전환(사용자 2차 지적: "내가 겪은 것만 보완하면 다음도 내가 직접 겪어야 한다 — 예측해서 보완").** UI 하나만 막으면 형제 갭(데이터 상태·반응형·권한 차단·실데이터·기동·배포 실여정)은 사람이 또 겪어야 발견됨. → **거짓완료를 모든 게이트에서 한 장치로 사냥**: 신규 `rails/false-done-checklist.md`(성장 목록·표면별 함정 seeded) + `adversarial-review` 가 매번 **해당 항목 점검 + 생성형 프리모템**("done 인데 깨졌다면 어떻게?")으로 *목록 밖* 모드까지 찾고 + **`/retro` 가 새 모드를 목록에 append**(되먹임). `/develop`·`/deploy` critic 이 이 체크리스트 참조. 행동교훈 auto-memory `fix-the-failure-class-not-the-instance`. → 사람이 직접 겪고 명령하지 않아도 레일이 거짓완료 표면을 스스로 넓힌다.

## 승격 (2026-06-20 게이트 = 사용자 "지식 쌓고 업그레이드")
- ✅ **broad 패턴 승격** (2+ 프로젝트 반복: todo-toy·intra·이 incident) → [`patterns/verify-by-observation.md`](../patterns/verify-by-observation.md): "done = green 신호가 아니라 직접 본 동작". 진입점 기동 smoke(todo-toy)와 한 뿌리로 통합.
- 세션간 행동교훈은 auto-memory `done-means-observed-working`(feedback)에도 기록 — 매 세션 자동 로드.

7회차 근거: 사용자 보고(다른 세션 시안 개발 거짓완료) + 기존 로그 `lessons/todo-toy.md`·`lessons/intra.md`(에이전트 보고/거짓안심/npm test 글로브) + 이번 세션 적용한 5개 레일 파일 diff.
