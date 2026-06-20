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
- **배포 가능한 장기 실행 서비스**면(`deploy_profile: intranet` 이든 `local`+Docker 든) **OPS REQ를 자동 포함**: `health` 엔드포인트 · `graceful shutdown`(SIGTERM) · `configurable bind`(HOST/PORT). 이유: local+Docker 도 graceful·bind 가 필요(todo-toy 교훈). 한 줄 도구·라이브러리는 제외.
- **UI/화면 REQ(`REQ-SCR-*`)의 acceptance 는 관찰 가능한 *시각·인터랙션* 결과를 명시**한다: ① `design-input` 시안이 있으면 "화면이 시안과 레이아웃·컴포넌트 일치"(뭉뚱그림 금지) ② "각 버튼·링크 클릭 시 명세된 화면으로 이동/액션 발생"(죽은 링크 금지). 이유: acceptance 가 시각·인터랙션을 안 적으면 테스트·critic 이 검증할 게 없어, 시안과 다르고 버튼이 죽어도 통과한다(거짓완료).
- **비기능 요구(NFR)도 acceptance 로**(배포 가능한 서비스에서 해당되면): 성능(p95 응답·N+1 쿼리 없음)·동시성/용량(동시 N요청)·리소스(메모리 상한·OOM 없음)·관측성(실패가 로그에 보임)을 *관찰 가능 then* 으로 1개라도 적는다. 이유: acceptance·smoke 가 전부 기능적 then(상태코드·값·렌더)이면 health 200·기능 green 이어도 응답 10초·OOM 재시작 루프면 사용 불가인데 어떤 게이트도 안 본다(false-done-checklist H). 해당 없으면 명시 생략.

## 요구사항 표

| REQ-ID | 요구 | acceptance (given/when/then) | 우선순위 |
| --- | --- | --- | --- |
| REQ-CORE-001 | <무엇을 한다> | given <상태> when <행위> then <관찰 가능한 결과> | P0 |
| REQ-CORE-002 | | | P1 |
| REQ-OPS-001 | health 엔드포인트 | given 앱 실행 when GET /api/health then 200 + {status:ok} | P0 |
| REQ-SCR-001 | <화면명> 화면 | given 화면 진입 when 렌더 then 시안(design-input)과 레이아웃 일치 · when 각 버튼/링크 클릭 then 명세된 화면으로 이동(죽은 링크 0) | P0 |

> 우선순위: P0(없으면 제품이 아님) · P1(있어야 함) · P2(나중).
> `depends_on` 은 SPEC.manifest.yaml 에 기계가독으로 기록.
