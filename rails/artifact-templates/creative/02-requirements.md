<!-- 요구사항 — REQ-ID 척추. llm-wiki docs/02-requirements.md 일반화. [tier: judgment]
     이 표가 파이프라인의 척추다: 개발은 REQ당 작업/PR 1개, 배포는 REQ당 smoke 1개.
     ★규율: 모든 P0/P1 REQ는 비어있지 않은 acceptance(given X when Y then Z)를 가져야 한다.
       acceptance 없는 REQ는 critic(adversarial-review)이 거부한다. -->

# 02 — 요구사항: <프로젝트명>

## REQ-ID 규약

- 형식: `REQ-{CAT}-{NNN}` (예: `REQ-CORE-001`)
- 카테고리(CAT) 예시 — 프로젝트에 맞게 정함:
  - `CORE` 핵심 기능 · `AUTH` 인증 · `UI` 화면 · `DATA` 데이터/스키마 · `API` 외부연동
  - `OPS` 운영(health·graceful shutdown·백업·모니터링) · `SEC` 보안/프라이버시
- `deploy_profile: intranet` 이면 **OPS REQ를 자동 포함**: health 엔드포인트, graceful shutdown 최소 2개.

## 요구사항 표

| REQ-ID | 요구 | acceptance (given/when/then) | 우선순위 |
| --- | --- | --- | --- |
| REQ-CORE-001 | <무엇을 한다> | given <상태> when <행위> then <관찰 가능한 결과> | P0 |
| REQ-CORE-002 | | | P1 |
| REQ-OPS-001 | health 엔드포인트 | given 앱 실행 when GET /api/health then 200 + {status:ok} | P0 |

> 우선순위: P0(없으면 제품이 아님) · P1(있어야 함) · P2(나중).
> `depends_on` 은 SPEC.manifest.yaml 에 기계가독으로 기록.
