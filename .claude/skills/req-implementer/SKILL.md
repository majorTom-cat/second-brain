---
name: req-implementer
description: 개발 모듈 내부 절차. REQ-ID별로 git worktree에서 독립 구현하고, 각 REQ의 acceptance를 그대로 검증하는 테스트를 함께 작성한다. /develop 가 사용.
---

# req-implementer — REQ별 격리 구현

원칙: **REQ당 작업 1개, 테스트 1개, (가능하면) worktree 1개.** 추적성(REQ↔코드↔테스트)을 끊지 않는다.

## 입력
- `SPEC.manifest.yaml` 의 requirements (특히 P0), 각 REQ의 `acceptance`, `depends_on`.

## 절차

### 1) 순서 정하기
`depends_on` 위상정렬로 처리 순서를 정한다. 의존 없는 P0부터.

### 2) REQ별 구현  `[tier: bulk]`
각 REQ에 대해:
- `develop/tasks/<REQ-ID>.md` 를 TASK 템플릿으로 만든다.
- **git worktree** 를 새로 만들어(`git worktree add`) 그 안에서 구현한다 — 병렬 REQ 간 파일 충돌 방지.
  (worktree가 과하면, 의존 없는 REQ 묶음만 격리하고 작은 변경은 메인에서 직렬 처리해도 된다.)
- 구현과 **함께** 그 REQ의 `acceptance`(given/when/then)를 그대로 옮긴 테스트를 작성한다.
  테스트 이름/주석에 REQ-ID를 적어 추적성을 남긴다.

### 3) 자체 검증
- 그 REQ의 테스트를 돌려 통과를 확인한다(`npm test` 또는 해당 러너).
- 통과하지 않으면 done 으로 표시하지 않는다.

### 4) 호출자에게 반환
각 REQ의 {id, files, tests, 통과여부}를 호출자(/develop)에 넘긴다. 호출자가 adversarial-review로
6차원 리뷰를 돌리고, 통과 시 DEV.manifest 에 `status: done` + `verification: pass` 를 기록한다.

## 규칙
- acceptance 테스트 없이 `done` 금지.
- 기존 코드/유틸을 우선 재사용한다(새로 짜기 전에 찾는다).
- 시크릿은 코드에 넣지 않는다. 환경변수 이름만 DEV.manifest.run.env 에 남긴다.
- 통합은 호출자가 한다. 여기선 REQ 단위까지만 책임진다.
