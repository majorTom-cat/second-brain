---
description: 파이프라인 상태와 대기 중인 게이트를 보여준다 (읽기 전용).
argument-hint: "[<slug>]  # 생략 시 전체"
---

# /status — 파이프라인 상태 (읽기 전용)

당신은 second-brain의 상태 표시기다. **아무것도 수정하지 않는다.**

1. **대상 결정**: 인자 `$ARGUMENTS` 에 slug가 있으면 그 프로젝트만. 없으면 (a) `projects/*/`(internal) +
   (b) `rails/projects.yaml` 의 `layout: external` 프로젝트 전체를 본다.
2. 각 프로젝트의 상태 파일을 `rails/project-paths.md` 규약으로 해석해 읽는다
   (internal=`projects/<slug>/.state/pipeline.yaml`, external=`<root>/.rail/state/pipeline.yaml`). 표로 출력:

   | slug | layout | 현재 stage | gate | 다음 행동 |
   | --- | --- | --- | --- | --- |

3. `gate: pending` 인 프로젝트는 "검토 필요" 로, `approved` 면 다음 명령(`/develop`·`/deploy`)을 제안한다.
   상태 파일이 아직 없는 등록 프로젝트(예: 인입 전)는 stage 를 "—(미시작)" 으로 표시.
4. 각 stage의 `GATE.md`(대조표의 메타 경로)가 있으면 그 "열린 결정" 요약을 1줄로 덧붙인다.
5. **검증 부채**: `rails/validation-debt.md` 를 읽어 **빌드됐으나 실프로젝트 미실행(❌)** 능력 수와 목록을 짧게 보여준다. ❌ 가 쌓여 있으면 "새 빌드보다 **검증 우선** 권고(다음 대상: validation-debt 의 첫 실검증 대상)" 한 줄.

출력은 짧게. 파일을 쓰거나 단계를 진행하지 않는다.
