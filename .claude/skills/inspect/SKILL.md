---
name: inspect
description: (레일 일반판) 어떤 프로젝트든 "완료" 보고 전 돌리는 충실도·품질 검사 묶음 절차. 서로 다른 결함을 잡는 독립 검사 여러 종을 앞단에서·한 번에·전수로 — 사용자 버그 하나당 한 라운드씩 재발견하지 않기 위함. 시안 있는 UI 프로젝트가 주 대상, 원칙은 도메인 무관. 실행 인스턴스 예시 = intra `.claude/skills/inspect` + `scripts/{fidelity,responsive}-audit.mjs`.
---

# inspect (레일 일반판) — 검사 묶음을 앞단에 한 번에

> **검사 묶음** = 서로 다른 결함을 잡는 *독립 검사 여러 종*을 한 데 모아 같이 돌리는 것(영어 "battery of tests"). 한 종만으론 다 못 잡으니 묶는다.

**왜 이 스킬:** 검수 결함이 *사용자 브라우징으로 하나씩* 나오면 매번 재작업한다. 느린 건 검사 실행이 아니라 **어떤 검사가 필요한지를 버그 하나당 한 라운드씩 깨닫는 것**(실증 intra: 스샷대조→소스diff→인터랙션→가로넘침, 11건이 질질). 그 *발견 비용은 한 번만* 치르고 묶음을 harness 로 물려준다. 정본 원칙 = 이 repo `CLAUDE.md` 충실도 프로토콜 capstone + auto-memory [[run-checks-upfront-not-one-by-one]]·[[verification-is-layered-zero-isnt-clean]].

## 0. 이 프로젝트의 묶음이 있는가 (없으면 만들고, 있으면 돌린다)
- 시안 있는 웹 UI → **이미 있는 인스턴스(intra)를 템플릿으로 복제·적응**: `fidelity-audit.mjs`(구조+아이콘+문구 소스 diff)·`responsive-audit.mjs`(반응형 불변식+가로넘침 전수). 화면 매핑·로그인·포트·시안 경로만 갈아끼운다.
- 다른 도메인이면 묶음 항목이 다르다(예: API = 스키마검증 + 계약테스트 + 퍼즈 + 부하 + 보안스캔). **"검사 묶음을 앞단에 물려 한 번에"** 원칙만 같다.
- 검증 스크립트는 second-brain `.preview-shots/` 에 둬 대상 repo 워킹트리를 안 더럽힌다(Playwright 는 대상 repo node_modules 절대경로 import).

## 1. 순서 (싼 정적 → 한 세션 동적 → 인터랙션 → 실패 시에만 스샷; fail-fast·이미지 최소)

1. **소스 diff (시안↔구현 토큰화, *모든 뷰포트* + chrome):** '시안엔 있는데 구현에 없는 것'. **구조 + 아이콘 이름(시안 `ti-{name}` ↔ 렌더 `tabler-icon-{name}`, *이름* 매칭) + 문구 토씨**(샘플 숫자 # 치환). ★아이콘·문구는 *스샷이 못 잡는다 — 화질 올려도 사각 그대로* → 소스 diff([[compare-design-source-not-screenshots]]). **★PC만 보지 말 것** — 시안이 반응형이면 시안↔구현을 *각 뷰포트(모바일·태블릿·PC)로 렌더*해 각각 diff(`innerText`=보이는 문구만; 실증: 로그아웃 문구가 모바일만 구현서 숨겨짐). **★공통 chrome(상단바·사이드바·계정)은 per-screen 에서 빠지니 chrome 전용 감사 1개로 따로**([[fidelity-audit-all-viewports-and-chrome]]).
2. **한 세션 동적 (로그인 1번 → 전 라우트):** 페이지당 `page.evaluate` *한 번에* — 구조 토큰 + **가로넘침**(`body.scrollWidth>vw` + 클립조상 거른 per-element 우측넘침; overflow 는 구조·요소존재 검사를 다 빠져나가는 결함층) + computed-style 단언 + (UI면) 반응형 불변식. 뷰포트(모바일·태블릿·PC)는 병렬 컨텍스트. **브라우저 재기동·재로그인 반복 금지**(느림의 원인).
3. **인터랙션 시뮬 (요소가 *있는가* 아니라 *동작하는가*):** 변경한 동작이 맞는 자원/상태로 가는가(드래그·토글·모달·**모바일 단일뷰 좌표→자원** 등). **+ 죽은 컨트롤 검출**([[dead-controls-distinct-destination]]): 형제 네비/탭/링크의 **href 가 서로 distinct 한가** + 클릭 시 **URL·상태가 실제로 바뀌는가**(같은 목적지 = 죽은 링크 — 구조·시각 검사를 다 빠져나감). 결과 URL/상태를 단언.
4. **스샷 = 검출 아니라 실패 증거:** 1~3 에서 단언 깨진 화면만 고화질 캡처해 사람 확인. **전 화면 fullPage 금지**(그게 '하루 종일'의 주범).

## 2. 실패 계열 (하나 찾으면 같은 패턴 grep 으로 형제 전수 — [[fix-the-failure-class-not-the-instance]])
웹 UI 공통: ① `display:flex` 푸터가 텍스트·인라인배지를 칼럼처럼 깸 → 본문 span 인라인 ② 고정폭 모달/팝업 viewport 캡 없음 → `maxWidth:calc(100vw-…)`/`%vw` ③ `place-items:center` grid scrim 의 `max-width:100%` 는 트랙 기준이라 안 먹음 → vw 기준 ④ `repeat(N,1fr)` 고정 그리드 폰 넘침 → 좁은 폭 reflow ⑤ `flex;white-space:nowrap` 라벨의 긴 텍스트 → wrap ⑥ 단일뷰(1열)인데 좌표→자원 매핑이 전체열 등분 → 보이는 요소 실측 hit-test ⑦ 인라인 style 이 `@media` 를 조용히 이김([[inline-style-beats-media-query]]) ⑧ 형제 네비/탭이 같은 href = 죽은 컨트롤(클릭 무반응) → distinct 목적지 + 상태변화 ⑨ 시안 `.scrim`/`.modal` *바깥* 요소(배경)는 scrim 뒤라 사용자에 안 보임 → 갭 아님 ⑩ **동적 레이아웃이 데이터 수에 안 맞음**(N자원→N열인데 고정 3열 등) → 데이터 개수 2/4/5로 바꿔 트랙수==자원수 회귀. 흔한 원인: 클라 DOM 조작이 인라인을 ""로 비워 서버의 동적값 소실 → 원본 보존·복원([[dynamic-layout-matches-data-count]]). ⑪ **폼/모달을 안 열어서 그 안 필드·required 미검사** → `?create`/`?edit` 등 모달 오픈상태를 감사에 등록 + 시안↔구현 `(라벨,required?)` 집합 diff. *시안에 없는 required 필드*는 노이즈 아님([[audit-form-modals-and-required-fields]]). ⑫ **Tailwind 유틸 클래스명 충돌**(ring·grid·flex·hidden·block·border·container·group 등을 의미용 className 으로 쓰면 유틸 스타일이 덧입혀짐) → "CSS 소스엔 없는데 보이는 스타일"은 `getComputedStyle` 로 확인(소스 grep 만으론 못 잡음). 고침=클래스명 prefix([[tailwind-utility-classname-collision]]).

## 3. 보고·성장
- 통과 = **이 묶음을 소진**(0 위반). "깨끗 증명" 아님 — 보고는 "검사 N종 소진, 안 돌린 방법은 여기"로 정직하게.
- **새로 만난 실패모드는 즉시 이 묶음(스크립트·이 스킬)에 영구 추가** — harness 가 복리로 자라 다음 프로젝트의 반응적 라운드가 0 으로 수렴. 2+ 프로젝트서 반복되면 `memory/patterns/` 로 승격.
