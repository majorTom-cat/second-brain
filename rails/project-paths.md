# project-paths.md — 슬러그 → 경로 해석 규약 (레일 명령 공통 Step 0)

레일 명령(`/creative`·`/develop`·`/deploy`·`/retro`·`/status`)은 산출물 경로를 **직접 박지 말고**
이 규약으로 `<slug>` 를 실제 경로로 해석한다. 목적: 같은 명령이 산출물을 레일 repo 안(`projects/`)에 두든
바깥 별도 repo 에 두든 동일하게 동작하게.

> ★**하위호환 1순위**: `rails/projects.yaml` 에 없는(미등록) slug 는 **무조건 internal(A) = 기존 `projects/<slug>/` 동작**.
> 이 규약은 그 위에 external 만 추가하는 것이므로, 기존 프로젝트 동작은 절대 바뀌지 않는다.

## 해석 알고리즘 (각 명령 Step 0에서 1회)
1. `rails/projects.yaml` 을 읽는다.
2. `<slug>` 항목이 있고 `layout: external` 이면 → **B. external 매핑**.
   항목이 없거나 `layout: internal` 이면 → **A. internal 매핑**(기존과 동일).
3. 아래 논리 경로 변수를 확정하고, 명령 본문의 모든 산출/입력 경로에 이 변수를 쓴다.

> `$DOCS`/`$META` 는 **현재 명령의 stage**(creative|develop|deploy) 기준이다. 이전 stage 의 파일을 읽을 때
> (예: `/develop` 가 창작 `SPEC.manifest.yaml` 을 읽음)는 아래 **대조표의 해당 stage 행**으로 경로를 찾는다.

## A. internal  (기본·기존 동작 — 미등록 slug 포함)
- `BASE`   = `projects/<slug>`
- `$DOCS`  = `BASE/<stage>/`            ← 번호 설계문서(00-brief·01·02·03·08·09)는 `creative/` 아래 그대로
- `$META`  = `BASE/<stage>/`            ← HANDOFF.md·GATE.md·SPEC/DEV/DEPLOY.manifest.yaml
- `$STATE` = `BASE/.state/pipeline.yaml`
- `$CODE`  = `BASE/develop/`            ← 골격·코드

→ 즉 오늘과 100% 동일: `projects/<slug>/creative/00-brief.md`, `projects/<slug>/develop/DEV.manifest.yaml`, `projects/<slug>/.state/pipeline.yaml` …

## B. external  (별도 repo — `projects.yaml` 의 `root` 사용)
- `ROOT`   = `projects.yaml` 의 `root`  (예: `E:\intra`)
- `$DOCS`  = `<ROOT>/docs/`             ← 번호 설계문서 01·02·03 … (그 repo 의 docs 관례에 맞춤)
- `$META`  = `<ROOT>/.rail/<stage>/`    ← HANDOFF.md·GATE.md·*.manifest.yaml (레일 메타)
- `$STATE` = `<ROOT>/.rail/state/pipeline.yaml`
- `$CODE`  = `<ROOT>/`                  ← 프로젝트 스택대로(레일이 별도 골격 폴더를 새로 만들지 않음)

→ 규율: external repo 에는 레일 메타를 **`<ROOT>/.rail/` 에만** 둔다(프로젝트 코드와 안 섞임).
  번호 설계문서만 `<ROOT>/docs/` 에 두되 **기존 파일 덮어쓰기 전 확인**. 읽기전용 prior-art repo 엔 아무것도 쓰지 않는다.

## 대조표
| 논리 이름 | internal (기본) | external |
| --- | --- | --- |
| 상태(pipeline.yaml) | `projects/<slug>/.state/pipeline.yaml` | `<root>/.rail/state/pipeline.yaml` |
| 창작 설계문서 | `projects/<slug>/creative/0*.md` | `<root>/docs/0*.md` |
| 창작 메타(HANDOFF·GATE·SPEC.manifest) | `projects/<slug>/creative/` | `<root>/.rail/creative/` |
| 개발 코드 | `projects/<slug>/develop/` | `<root>/` |
| 개발 메타(DEV.manifest·HANDOFF·GATE) | `projects/<slug>/develop/` | `<root>/.rail/develop/` |
| 배포 메타(DEPLOY.manifest·RUNBOOK·HANDOFF·GATE) | `projects/<slug>/deploy/` | `<root>/.rail/deploy/` |

## 예시
- slug `todo-app` (미등록) → A → `projects/todo-app/creative/00-brief.md`, 상태 `projects/todo-app/.state/pipeline.yaml`.
- slug `intra` (external, root `E:\intra`) → B → 설계문서 `E:\intra\docs\02-requirements.md`,
  메타 `E:\intra\.rail\creative\SPEC.manifest.yaml`, 상태 `E:\intra\.rail\state\pipeline.yaml`, 코드 `E:\intra\` 루트.

관련: 승격 패턴 [`memory/patterns/external-project-layout.md`](../memory/patterns/external-project-layout.md).
