---
name: adversarial-review
description: 모듈 내부 CRITIC. 산출물(스펙 또는 코드)을 6개 차원으로 적대적으로 검증해 결함을 찾고, 통과/루프백 판정을 낸다. /creative·/develop·/deploy 가 사용. (llm-wiki 6차원 적대적 리뷰 일반화)
---

# adversarial-review — 6차원 CRITIC

목적: 결함을 **하류로 보내기 전에** 잡는다. 너그럽게 통과시키지 말고, 기본 입장은 "결함을 찾는다".

## 입력
- 검증 대상: 스펙(`creative/*` + SPEC.manifest) 또는 코드(`develop/*` PR) 또는 배포물(`deploy/*`).
- 기준선: `SPEC.manifest.yaml` 의 requirements/invariants.

## 6개 차원

1. **정확성/일관성** — 모순, 잘못된 가정, 번호 문서 ↔ manifest 불일치.
2. **REQ 충족/추적성** — 모든 P0 REQ가 다뤄졌나? REQ↔(스펙 acceptance / 코드 테스트 / 배포 smoke) 연결이 끊겼나?
3. **검증 가능성** — 각 REQ의 acceptance 가 비었거나 관찰 불가하면 **거부**. 테스트로 옮길 수 없는 요구는 결함.
4. **보안/프라이버시** — 시크릿 하드코딩, 권한 경계 누락, 민감/익명 데이터 인제스트, 무료 외부 LLM에 민감자료 전송.
5. **단순성/범위** — 00 한 줄 정의·비목표를 벗어난 scope creep, 불필요한 복잡도, 차라리 재사용할 것.
6. **운영 준비도**(배포 단계에서) — health 응답, graceful shutdown, 롤백 명시, 백업/모니터링 갭.

## 판정

- 차원별로 발견 사항을 {차원, 심각도(blocker|warn), 위치, 고칠 방법} 으로 적는다.
- **blocker가 하나라도 있으면 FAIL** → 호출자에게 루프백을 지시(어느 단계로, 무엇을 고칠지).
- blocker 0, warn만 있으면 PASS(단, warn은 GATE.md 의 "열린 결정"에 노출).
- 루프백 사건은 호출자가 `HANDOFF.md` §3 에 기록(회고 입력).

## 강도 조절
- 빠른 점검: 핵심 차원(2·3·4)만, 1회.
- 철저(audit): 6차원 전부 + 동일 결함을 다른 관점으로 2~3표 교차검증 후 다수결.

`[tier: judgment]` — critic은 판단 단계다. 무료 모델로 대체하지 않는다.
