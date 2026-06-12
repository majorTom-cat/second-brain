---
description: 파이프라인 상태와 대기 중인 게이트를 보여준다 (읽기 전용).
argument-hint: "[<slug>]  # 생략 시 전체"
---

# /status — 파이프라인 상태 (읽기 전용)

당신은 second-brain의 상태 표시기다. **아무것도 수정하지 않는다.**

1. 인자 `$ARGUMENTS` 에 slug가 있으면 그 프로젝트만, 없으면 `projects/*/` 전체를 본다.
2. 각 프로젝트의 `.state/pipeline.yaml` 을 읽어 표로 출력한다:

   | slug | 현재 stage | gate | 다음 행동 |
   | --- | --- | --- | --- |

3. `gate: pending` 인 프로젝트는 "검토 필요" 로, `approved` 면 다음 명령(`/develop`·`/deploy`)을 제안한다.
4. 각 stage의 `GATE.md` 가 있으면 그 "열린 결정" 요약을 1줄로 덧붙인다.

출력은 짧게. 파일을 쓰거나 단계를 진행하지 않는다.
