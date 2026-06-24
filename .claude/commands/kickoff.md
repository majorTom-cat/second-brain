---
description: 프로젝트/세션 시작 강제 절차 — 교훈을 *읽기만* 하지 않고 *실행+증거*로 따르게 만든다(주장 금지, 출력으로 증명).
argument-hint: "<프로젝트 경로|slug>  또는  new <이름>   (생략 시 물어봄)"
---

# /kickoff — 똑똑하게 시작 (교훈을 *적용*하게 강제)

사용자가 `/kickoff $ARGUMENTS` 를 쳤다. **핵심 전제(이 세션의 실패 모드): 교훈은 로드돼 있어도 *읽기만 하고 안 따르면* 무용이다([[apply-lessons-not-just-store-them]]). 그래서 이 명령은 "준수"가 아니라 *Read→요약→실행→출력증명* 을 강제한다. 주장("봤다/깨끗/0건") 금지 — 명령 출력으로 증명.**

대상 판별: `$ARGUMENTS` 가 `new <이름>` 이면 **신규**, 경로/slug 면 **기존**, 비었으면 사용자에게 물어라.

## 공통 (어느 쪽이든 먼저)
1. **Read 강제(자동 로드 안 됨 — 명시적으로 끌어와라)** 후 **핵심 규율 3줄 요약**을 출력하라. 안 읽었으면 작업 시작 금지.
2. 요약 끝에 *이 세션에서 따를 하드 규칙*을 1줄씩 못 박아라:
   - 동적 피드백(토스트·토글·저장·생성)은 "요소 존재=PASS" 금지 → **액션 수행 후 단언**.
   - "사람이 봐라"로 떠넘기지 마라 — hover·opacity·입력검증·이동목적지·역할게이트는 **시안 소스에 박혀 자동 판정 가능**([[automate-dont-offload-qa]]). 진짜 사람 잔여(외부 메일클라 렌더·실기기)만 남겨라.
   - 검증 순서: `tsc` → 영향 테스트만 → 직접 프로브 → **전체 스위트는 마지막 1회**(반복 금지 — 서버 과부하·timeout 자해 [[fast-feedback-not-timeouts]]).
   - **이미 부정된 방법 재등장 금지**: 고화질 스샷으로 아이콘·문구 잡기 · "한 방법 0건=완료" · 좌표 등분 매핑.
   - 보고는 **"검사 N종 소진, 안 돌린 건 여기 / 진짜 갭 vs 노이즈"** 형식. "완료/깨끗" 단독 보고 금지.

## A. 기존 프로젝트 (`$ARGUMENTS` = 경로/slug)
1. **Read(절대경로)**: `<root>/CLAUDE.md` + `<root>/HANDOFF.md`(맨 위 이어가기 블록) + `memory/lessons/<slug>.md`(있으면) + `<root>/.claude/skills/inspect/SKILL.md`(또는 second-brain 레일 `/inspect`). 3줄 요약.
2. **상태 점검(읽기 전용)**: `git rev-parse --abbrev-ref HEAD` · 미푸시 `git log origin/<main>..HEAD --oneline` · `git status -s` · 환경(dev 포트 `curl -m3` · docker ps). 안 떴으면 기동 안내.
3. **완료 게이트 강제**: 화면/동작 건드리면 "완료" 전 반드시 **`npm run inspect`**(없으면 개별 `*-audit.mjs`) 돌리고 **출력을 붙여라**. tsc 0 + 영향 테스트도 출력으로.

## B. 신규 프로젝트 (`$ARGUMENTS` = `new <이름>`)
1. **Read**: 이 repo `CLAUDE.md` 충실도 capstone + `memory/patterns/inspect-battery.md` + 레일 `/inspect` 스킬. 3줄 요약.
2. **시스템 먼저 스캔**(화면 만들기 *전*): 공유 디자인시스템·토큰을 정의하는 화면/CSS를 먼저 읽어 전역 결정 확정 + 화면↔라우트 매핑표.
3. **★배터리를 *일찍* 세워라**: `inspect-battery` 레시피로 ①소스diff ②반응형+overflow ③피드백 액션단언 ④TC행동 + `npm run inspect` orchestrator 를 (intra 골격 적응으로) 만든다. **화면 1번부터·매 변경마다 돌린다**(나중이 아니라 시작에).
4. 새로 만난 실패모드는 *해당 감사 스크립트에 케이스 추가*(prose 말고 코드 — harness 복리).

## 마치며 (사용자에게)
- **★가장 강한 레버: 결론 말고 산출물을 요구하라.** "다 됐어?" 대신 "`npm run inspect` 출력이랑 tsc 결과 붙여" — 증거는 못 꾸며낸다.
- "안다 ≠ 실수 안 함." 보장은 문서가 아니라 *배터리를 일찍 만들어 매 변경 돌리는 데서* 나온다. 이 명령은 그걸 *시작부터 강제*할 뿐.
