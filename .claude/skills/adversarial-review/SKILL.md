---
name: adversarial-review
description: 모듈 내부 CRITIC. 산출물(스펙 또는 코드)을 8개 차원 + false-done 체크리스트(green≠동작, A~H) + 생성형 프리모템으로 적대적으로 검증해 결함을 찾고, 통과/루프백 판정을 낸다. /creative·/develop·/deploy 가 사용. (llm-wiki 6차원 적대적 리뷰 일반화)
---

# adversarial-review — 차원 + false-done 체크리스트 CRITIC

목적: 결함을 **하류로 보내기 전에** 잡는다. 너그럽게 통과시키지 말고, 기본 입장은 "결함을 찾는다". 특히 **보고는 done 인데 실제론 깨진(거짓완료)** 것을 사람이 겪기 전에 잡는다.

## 입력
- 검증 대상: 스펙(`creative/*` + SPEC.manifest) 또는 코드(`develop/*` PR) 또는 배포물(`deploy/*`).
- 기준선: `SPEC.manifest.yaml` 의 requirements/invariants.

## 6개 차원

1. **정확성/일관성** — 모순, 잘못된 가정, 번호 문서 ↔ manifest 불일치. 핵심 불변식이 **앱 로직 검증에 의존하나, 구조적으로 강제**(DB 제약·단일 라이터·스키마)되나 ([[constraints-as-truth]]).
2. **REQ 충족/추적성** — 모든 P0 REQ가 다뤄졌나? REQ↔(스펙 acceptance / 코드 테스트 / 배포 smoke) 연결이 끊겼나?
3. **검증 가능성** — 각 REQ의 acceptance 가 비었거나 관찰 불가하면 **거부**. 테스트로 옮길 수 없는 요구는 결함.
4. **보안/프라이버시** — 시크릿 하드코딩, 권한 경계 누락, 민감/익명 데이터 인제스트, 무료 외부 LLM에 민감자료 전송. 권한 로직이 **단일 계산처**에 모였나 vs 여러 곳 분산됐나 ([[single-permission-point]]).
5. **단순성/범위** — 00 한 줄 정의·비목표를 벗어난 scope creep, 불필요한 복잡도, 차라리 재사용할 것.
6. **운영 준비도**(배포 단계에서) — health 응답, graceful shutdown, 롤백 명시, 백업/모니터링 갭.
7. **UI 충실도/인터랙션 배선**(UI REQ = `REQ-SCR-*` · 화면을 만드는 REQ에서만) — `design-input` 시안이 있으면 **렌더된 화면이 시안과 일치**하나(뭉뚱그림·근사 구현 = 결함, [[design-ready-skin]]), 모든 버튼·링크·폼이 **실제로 배선**됐나(죽은 인터랙션 = 결함). ★이 판정은 **테스트 통과가 아니라 실제 렌더 관찰**(앱 띄워 화면 열고 클릭)에 근거해야 한다 — 단위테스트 green 은 시각 일치·링크 배선을 검증하지 않는다(intra 교훈 "에이전트 보고를 믿지 말 것"). `done`/`verification: pass` 로 올라온 UI REQ가 **렌더 관찰 없이**(테스트만으로) 통과됐거나, 시안 불일치·죽은 버튼이 있으면 **blocker** ([[verify-by-observation]]: done = green 신호가 아니라 직접 본 동작).
8. **프로세스/레일 자가 무결성**(메타 — 모든 단계) — critic 을 *레일 자신*에 적용한다: 게이트 `approved` 가 산출 세션의 자가승인이 아니라 사람 검수인가 · GATE.md 가 critic 발견을 의역(soft-pedal) 없이 그대로 전사했나 · done 근거가 (a)acceptance/(b)critic/(c)관찰 smoke 로 분리됐나(단일 칸에 묻히지 않았나) · 상류 열린 결정이 미해소인데 통과되지 않았나 · 재개/매핑유지로 건너뛴 `done` 이 *현재* 코드 기준 stale 이 아닌가 · distill 결론이 manifest 로 그라운딩되나(자가보고 단정 아님). 거짓완료는 종종 레일이 *자기 자신을 속이는* 데서 온다 — 좁은 신호(파일 값·자체 요약)가 사람 검수를 대체하면 **blocker/warn** ([[verify-by-observation]]).

## false-done 점검 — green ≠ 동작 (차원과 별개로 매번)

거짓완료(보고는 `done`/`pass` 인데 실제론 깨짐)는 UI 만의 문제가 아니라 **모든 게이트에서 좁은 신호가 넓은 done 을 대신**할 때 생긴다(creative: "acceptance 있음"≠전부 falsifiable / develop: "테스트 green"≠동작 / deploy: "health 200"≠사용 가능). 그래서 차원 점검에 더해:

1. **체크리스트 점검** — `rails/false-done-checklist.md` 의 **산출물 유형에 해당하는 항목**을 본다. 각 항목은 **관찰로 통과 또는 명시적 N/A(이유)** — **조용한 건너뜀 = blocker**(검증 안 했는데 done). 순수 로직 REQ에 UI·반응형 항목 N/A 처리는 정상(과한 게이트 방지).
2. **★생성형 프리모템** — 목록과 별개로 **항상** 묻는다: *"이게 보고는 done 인데 실제로 깨졌다면 어떻게?"*(숨은 결함 전제). 목록 밖 모드가 나오면 (a) 루프백 + (b) **`/retro` 가 그 모드를 체크리스트에 추가**하도록 GATE.md/HANDOFF.md §3 에 표시. → 사람이 직접 겪지 않아도 새 함정이 레일에 쌓인다.

## 판정

- 차원별로 발견 사항을 {차원, 심각도(blocker|warn), 위치, 고칠 방법} 으로 적는다.
- **blocker가 하나라도 있으면 FAIL** → 호출자에게 루프백을 지시(어느 단계로, 무엇을 고칠지).
- blocker 0, warn만 있으면 PASS(단, warn은 GATE.md 의 "열린 결정"에 노출).
- 루프백 사건은 호출자가 `HANDOFF.md` §3 에 기록(회고 입력).

## 강도 조절
- 빠른 점검: 핵심 차원(2·3·4)만, 1회. **UI REQ면 7번도 핵심**(렌더 관찰).
- 철저(audit): 8차원 전부 + false-done 체크리스트(A~H) 해당 항목 전수 + 생성형 프리모템 + 동일 결함을 다른 관점으로 2~3표 교차검증 후 다수결.

`[tier: judgment]` — critic은 판단 단계다. 무료 모델로 대체하지 않는다.
