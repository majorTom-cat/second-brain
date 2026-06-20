---
name: req-implementer
description: 개발 모듈 내부 절차. REQ-ID별로 git worktree에서 독립 구현하고, 각 REQ의 acceptance를 그대로 검증하는 테스트를 함께 작성한다. /develop 가 사용.
---

# req-implementer — REQ별 격리 구현

원칙: **REQ당 작업 1개, 테스트 1개, (가능하면) worktree 1개.** 추적성(REQ↔코드↔테스트)을 끊지 않는다.

## rigor 모드 (호출자 `/develop` 가 지정 — 기본 `full`)

- **full** (기본): 아래 `## 절차` 전체 — REQ별 worktree + acceptance 테스트 + (호출자의) 6차원 critic. **배포 대상 코드**.
- **rough**: 디자이너 반복용 *버려질 수도 있는* 산출. 목적 = **화면·흐름을 빨리 눈에 보이게**. 다음을 **생략**: worktree 격리·REQ별 acceptance 테스트·6차원 critic. 대신:
  - ★**품질 바: 러프 ≠ 저품질.** 공유 셸(GNB·레이아웃·라우팅) + **전 `REQ-SCR` 화면이 클릭 가능**하게 스캐폴드(목 데이터). **프로토타입(`design-input`)이 있으면 레이아웃·인터랙션을 참조**한다. (아키타입 몇 개·mock 덤프·프로토타입 미참조는 *검증용 축소*일 뿐 표준 아님 — 같은 '러프'라도 손으로 키운 intra 러프가 훨씬 나았다, intra-toy 교훈.)
  - **스택은 러프 단계가 아니라 최종 목표 기준**(`03-architecture.md`)으로 고른다 — 러프가 그대로 실제 앱으로 자라게(임시 스택 쓰면 재작성).
  - 게이트 = **빌드 통과**(`npm run build`) + **진입점 기동 smoke**(실제로 떠서 렌더되는지 — `npm run dev`/기동 후 확인, intra-toy 교훈: 파일만 있고 안 뜨면 의미 없음). REQ를 `done` 으로 표시하지 않는다(테스트·critic 없음) → `/deploy` 가 러프를 거부(러프는 배포 대상 아님).
  - 산출 = **HANDBACK**(`rails/handoff/HANDBACK.template.md`) — DEV 게이트가 아니라 기획자 핸드백.
  - GNB/메뉴는 **`menu_visible: true` 화면만** 노출(아래 규칙).

## menu_visible — 화면 목록에서 "메뉴에 보일 것"만
화면 인벤토리(`REQ-SCR-*`)에서 네비게이션(GNB/사이드바)을 **자동 생성할 때 `menu_visible: true` 인 화면만 상위 메뉴에 넣는다.**
흐름 안에서만 도달하는 화면(상세·수정·반납·각종 추가폼)과 개발/QA용 화면은 `menu_visible: false` — 라우팅으론 도달 가능하되 메뉴엔 안 뜬다.
(선언 위치 = 각 `REQ-SCR` 항목의 `menu_visible` 필드. 없으면 기본 = 노출.) 이유: 명세 전 화면을 그대로 메뉴로 뿌리면
"메뉴가 아니라 전 화면 인벤토리"가 노출돼 사용자가 혼란(intra 기획자 피드백, `memory/lessons/rail.md`).

## 입력
- `SPEC.manifest.yaml` 의 requirements (특히 P0), 각 REQ의 `acceptance`, `depends_on`.

## 절차  (아래 1)~4)는 **full 모드** 기준. rough 모드는 위 `## rigor 모드` 의 rough 절차를 따른다.)

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
- ★**UI REQ(`REQ-SCR-*`·화면을 만드는 REQ)는 테스트 통과만으로 done 금지.** 앱을 띄워(`npm run dev` — 또는 `/verify`·`/run`) **(a) 렌더 화면을 `design-input` 시안과 나란히 대조**('대충 비슷' 아님 — 레이아웃·컴포넌트가 일치) + **(b) 모든 버튼·링크·폼을 클릭**해 내비게이션·액션이 실제 동작하는지 **직접 관찰**한다. 단위테스트는 시각 일치·링크 배선을 검증하지 않으므로, 시안과 다르게 뭉뚱그리거나 버튼에 링크가 없어도 green 일 수 있다(이 갭이 "테스트 done" 거짓완료의 원인). 관찰 못 하면 done 아님.

### 4) 호출자에게 반환
각 REQ의 {id, files, tests, **acceptance 절→테스트 매핑**}을 호출자(/develop)에 넘긴다 — 단순 통과여부·개수가 아니라 **acceptance 의 given/when/then 각 절이 어느 테스트/관찰로 덮였는지** 절 단위로 매핑한다(then 이 여럿이면 절마다). 매핑 안 되는 절이 1개라도 있으면 그 REQ는 미완 — acceptance 3절 중 2절만 구현·테스트하고 나머지를 조용히 생략해도 반환 {통과여부}는 'pass'이고 누락 절은 테스트가 없어 critic 이 볼 근거가 없다(intra ④). 호출자가 adversarial-review로 8차원 + false-done 체크리스트 리뷰를 돌리고, 통과 시 DEV.manifest 에 `status: done` + `verification: pass` 를 기록한다.

## 규칙
- acceptance 테스트 없이 `done` 금지.
- UI REQ는 **렌더 관찰(시안 대조 + 인터랙티브 요소 클릭) 없이 `done` 금지** — 호출자에게 반환할 때 "테스트 green" 과 "관찰된 동작" 을 구분해 보고한다([[verify-by-observation]]).
- 기존 코드/유틸을 우선 재사용한다(새로 짜기 전에 찾는다).
- 시크릿은 코드에 넣지 않는다. 환경변수 이름만 DEV.manifest.run.env 에 남긴다.
- 통합은 호출자가 한다. 여기선 REQ 단위까지만 책임진다.
