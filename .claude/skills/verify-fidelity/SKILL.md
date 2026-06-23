---
name: verify-fidelity
description: (레일 일반판) 어떤 프로젝트든 "완료" 보고 전 돌리는 충실도·품질 검사 묶음 절차. 서로 다른 결함을 잡는 독립 검사 여러 종을 앞단에서·한 번에·전수로 — 사용자 버그 하나당 한 라운드씩 재발견하지 않기 위함. 시안 있는 UI 프로젝트가 주 대상, 원칙은 도메인 무관. 실행 인스턴스 예시 = intra `.claude/skills/verify-fidelity` + `scripts/{fidelity,responsive}-audit.mjs`.
---

# verify-fidelity (레일 일반판) — 검사 묶음을 앞단에 한 번에

> **검사 묶음** = 서로 다른 결함을 잡는 *독립 검사 여러 종*을 한 데 모아 같이 돌리는 것(영어 "battery of tests"). 한 종만으론 다 못 잡으니 묶는다.

**왜 이 스킬:** 검수 결함이 *사용자 브라우징으로 하나씩* 나오면 매번 재작업한다. 느린 건 검사 실행이 아니라 **어떤 검사가 필요한지를 버그 하나당 한 라운드씩 깨닫는 것**(실증 intra: 스샷대조→소스diff→인터랙션→가로넘침, 11건이 질질). 그 *발견 비용은 한 번만* 치르고 묶음을 harness 로 물려준다. 정본 원칙 = 이 repo `CLAUDE.md` 충실도 프로토콜 capstone + auto-memory [[run-checks-upfront-not-one-by-one]]·[[verification-is-layered-zero-isnt-clean]].

## 0. 이 프로젝트의 묶음이 있는가 (없으면 만들고, 있으면 돌린다)
- 시안 있는 웹 UI → **이미 있는 인스턴스(intra)를 템플릿으로 복제·적응**: `fidelity-audit.mjs`(구조+아이콘+문구 소스 diff)·`responsive-audit.mjs`(반응형 불변식+가로넘침 전수). 화면 매핑·로그인·포트·시안 경로만 갈아끼운다.
- 다른 도메인이면 묶음 항목이 다르다(예: API = 스키마검증 + 계약테스트 + 퍼즈 + 부하 + 보안스캔). **"검사 묶음을 앞단에 물려 한 번에"** 원칙만 같다.
- 검증 스크립트는 second-brain `.preview-shots/` 에 둬 대상 repo 워킹트리를 안 더럽힌다(Playwright 는 대상 repo node_modules 절대경로 import).

## 1. 순서 (싼 정적 → 한 세션 동적 → 인터랙션 → 실패 시에만 스샷; fail-fast·이미지 최소)

1. **정적 소스 diff (브라우저 없이, 초):** 시안(HTML/CSS) ↔ 구현 소스를 토큰화해 '시안엔 있는데 구현에 없는 것'. **구조 + 아이콘 이름(시안 `ti-{name}` ↔ 렌더 `tabler-icon-{name}` 등, *이름* 매칭) + 문구 토씨**(샘플 숫자는 # 치환). ★아이콘·문구는 *스샷이 못 잡는다 — 화질 올려도 사각 그대로* → 반드시 소스 diff([[compare-design-source-not-screenshots]]).
2. **한 세션 동적 (로그인 1번 → 전 라우트):** 페이지당 `page.evaluate` *한 번에* — 구조 토큰 + **가로넘침**(`body.scrollWidth>vw` + 클립조상 거른 per-element 우측넘침; overflow 는 구조·요소존재 검사를 다 빠져나가는 결함층) + computed-style 단언 + (UI면) 반응형 불변식. 뷰포트(모바일·태블릿·PC)는 병렬 컨텍스트. **브라우저 재기동·재로그인 반복 금지**(느림의 원인).
3. **인터랙션 시뮬:** 변경한 동작이 맞는 자원/상태로 가는가(드래그·토글·모달·**모바일 단일뷰 좌표→자원** 등). 결과 URL/상태를 단언.
4. **스샷 = 검출 아니라 실패 증거:** 1~3 에서 단언 깨진 화면만 고화질 캡처해 사람 확인. **전 화면 fullPage 금지**(그게 '하루 종일'의 주범).

## 2. 실패 계열 (하나 찾으면 같은 패턴 grep 으로 형제 전수 — [[fix-the-failure-class-not-the-instance]])
웹 UI 공통: ① `display:flex` 푸터가 텍스트·인라인배지를 칼럼처럼 깸 → 본문 span 인라인 ② 고정폭 모달/팝업 viewport 캡 없음 → `maxWidth:calc(100vw-…)`/`%vw` ③ `place-items:center` grid scrim 의 `max-width:100%` 는 트랙 기준이라 안 먹음 → vw 기준 ④ `repeat(N,1fr)` 고정 그리드 폰 넘침 → 좁은 폭 reflow ⑤ `flex;white-space:nowrap` 라벨의 긴 텍스트 → wrap ⑥ 단일뷰(1열)인데 좌표→자원 매핑이 전체열 등분 → 보이는 요소 실측 hit-test ⑦ 인라인 style 이 `@media` 를 조용히 이김([[inline-style-beats-media-query]]).

## 3. 보고·성장
- 통과 = **이 묶음을 소진**(0 위반). "깨끗 증명" 아님 — 보고는 "검사 N종 소진, 안 돌린 방법은 여기"로 정직하게.
- **새로 만난 실패모드는 즉시 이 묶음(스크립트·이 스킬)에 영구 추가** — harness 가 복리로 자라 다음 프로젝트의 반응적 라운드가 0 으로 수렴. 2+ 프로젝트서 반복되면 `memory/patterns/` 로 승격.
