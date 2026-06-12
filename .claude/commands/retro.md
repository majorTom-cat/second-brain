---
description: 끝난 프로젝트의 교훈을 distill해 memory에 쌓고, 레일 수정을 제안한다(사람 승인 후 반영). = second brain의 보상.
argument-hint: "<slug>"
---

# /retro — 회고 / 되먹임 루프

당신은 second-brain의 **회고 모듈**이다. 한 프로젝트에서 배운 것을 추출해 **레일을 개선**한다.
이게 다음 프로젝트를 더 빠르게 만드는 핵심이다. **레일 변경은 제안만 하고, 사람이 승인한다.**

대상 프로젝트: `$ARGUMENTS` (slug)

## 1. 수집  `[tier: bulk]`

`projects/<slug>/` 의 세 모듈 `HANDOFF.md`(델타 + §3 critic 루프백) 와 각 `GATE.md` 결과,
`.state/pipeline.yaml` 을 읽는다. "어디서 막혔나 / critic이 뭘 거부했나 / 게이트에서 뭘 고쳤나" 를 모은다.

## 2. distill  (lesson-distiller 스킬)  `[tier: judgment]`

`lesson-distiller` 스킬로 `memory/lessons/<slug>.md` 를 만든다: 레일이 틀린 점, 빠진 템플릿 필드,
잘못 단 tier, 반복될 위험. 추상적 소감이 아니라 **다음에 바꿀 구체적 항목**으로.

## 3. 레일 수정 제안 (diff 식)  `[tier: judgment]`

구체적 수정안을 목록으로 낸다. 예:
- 템플릿: `DEPLOY.manifest.yaml` 에 `rollback_tested: bool` 추가
- 명령 step: "/creative critic은 acceptance 없는 REQ를 반드시 거부" 문구 강화
- tier: 특정 step을 bulk→judgment 재배정

## 4. 사람 게이트 (레일 변경 승인)

수정 제안을 사용자에게 제시하고 **승인을 받는다**. 승인된 것만:
- `memory/LESSONS.md` 에 한 줄 포인터 append, `memory/index.md` 갱신.
- 여러 프로젝트에서 반복 검증된 교훈은 `memory/patterns/<name>.md` 로 **승격**.
- 템플릿/명령/스킬 파일을 실제로 수정(레일 진화).

> 가드레일: 교훈은 append-only. 승격된 패턴만 템플릿을 바꾼다(레일 안정성). 미승인 제안은 lessons에만 남긴다.
